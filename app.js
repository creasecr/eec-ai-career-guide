let courses = [];

const interestTopicMap = {
    "Electrification & Decarbonization": [
        "Electrification & Decarbonization",
        "Electrification"
    ],
    "HVAC/R": ["HVAC/R"],
    "Energy Codes & Standards": ["Energy Codes & Standards"],
    "Building Performance": [
        "Building Performance",
        "Energy Efficiency & Building Operations"
    ],
    "Agriculture & Irrigation": [
        "Agriculture, Pumps & Irrigation",
        "Agriculture & Irrigation"
    ],
    Foodservice: ["Foodservice"],
    Lighting: ["Lighting"],
    "Industrial Automation": [
        "Industrial Automation",
        "Energy Processes & Technology"
    ]
};

const points = {
    topic: 5,
    experience: 3,
    audience: 2
};

const recommendationsArea = document.getElementById("recommendationsArea");
const pathCourseGrid = document.getElementById("pathCourseGrid");
const findPathButton = document.getElementById("findPathButton");
const progressSteps = Array.from(document.querySelectorAll(".progress-step"));

let recommendationsGenerated = false;

if (findPathButton) {
    findPathButton.disabled = true;
}

const getSelectedAudience = () => {
    const selected = document.querySelector("input[name='audience']:checked");
    return selected ? selected.value : "";
};

const getSelectedInterests = () => {
    return Array.from(document.querySelectorAll("input[name='topics']:checked")).map((item) => item.value);
};

const getSelectedExperience = () => {
    const selected = document.querySelector("input[name='experience']:checked");
    return selected ? selected.value : "";
};

const renderEmptyState = (target, message) => {
    target.innerHTML = `<p class="empty-state">${message}</p>`;
};

const normalizeArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }
    if (!value) {
        return [];
    }
    return [value];
};

const normalizeText = (value) => String(value || "").toLowerCase().trim();

const hasTopicMatch = (course, interests) => {
    if (!interests.length) {
        return [];
    }

    const topics = normalizeArray(course.topics).map((item) => normalizeText(item));
    const category = normalizeText(course.category);
    const title = normalizeText(course.title);

    return interests.filter((interest) => {
        const mappedTopics = interestTopicMap[interest] || [interest];
        return mappedTopics.some((mappedTopic) => {
            const term = normalizeText(mappedTopic);
            return topics.some((topic) => topic.includes(term)) || category.includes(term) || title.includes(term);
        });
    });
};

const hasAudienceMatch = (course, selectedAudience) => {
    if (!selectedAudience) {
        return false;
    }

    const audiences = normalizeArray(course.audiences);
    return audiences.some((audience) => normalizeText(audience) === normalizeText(selectedAudience));
};

const hasExperienceMatch = (course, selectedExperience) => {
    if (!selectedExperience) {
        return false;
    }
    return normalizeText(course.experienceLevel) === normalizeText(selectedExperience);
};

const scoreCourse = (course, audience, interests, experience) => {
    let score = 0;
    const reasons = [];

    const matchedInterests = hasTopicMatch(course, interests);
    const audienceMatch = hasAudienceMatch(course, audience);
    const experienceMatch = hasExperienceMatch(course, experience);

    if (matchedInterests.length) {
        score += points.topic;
        reasons.push(`Matches ${matchedInterests.join(" and ")} interest`);
    }

    if (experienceMatch) {
        score += points.experience;
        reasons.push(`Appropriate for ${experience} level`);
    }

    if (audienceMatch) {
        score += points.audience;
        reasons.push(`Relevant for ${audience} role`);
    }

    if (course.deliveryType) {
        reasons.push(`Available in ${course.deliveryType} format`);
    }

    if (!reasons.length) {
        reasons.push("Relevant to your selected goals");
    }

    return {
        score,
        reasons
    };
};

const buildCourseCard = (course, reasons = []) => {
    const location = course.location || "Location TBD";
    const deliveryType = course.deliveryType || "TBD";
    const experienceLevel = course.experienceLevel || "TBD";
    const classUrl = course.registrationUrl || "";

    return `
        <article class="course-card">
            <h3>${course.title}</h3>
            <p class="course-description">Category: ${course.category}</p>
            <div class="meta-row">
                <span class="meta-pill">${experienceLevel}</span>
                <span class="meta-pill">${location}</span>
                <span class="meta-pill">${deliveryType}</span>
            </div>
            ${reasons.length
                ? `<div class="why-recommended"><p>Why Recommended</p><ul>${reasons
                    .slice(0, 4)
                    .map((reason) => `<li>&#10003; ${reason}</li>`)
                    .join("")}</ul></div>`
                : ""}
            ${classUrl
                ? `<a class="register-button" href="${classUrl}" target="_blank" rel="noopener noreferrer">View Class</a>`
                : `<button type="button" class="register-button" disabled>View Class</button>`}
        </article>
    `;
};

const getUniqueTopRecommendations = (scoredCourses, limit) => {
    const bestByTitle = new Map();

    scoredCourses.forEach((item) => {
        if (item.score <= 0) {
            return;
        }

        const key = normalizeText(item.course.title);
        if (!bestByTitle.has(key) || bestByTitle.get(key).score < item.score) {
            bestByTitle.set(key, item);
        }
    });

    return Array.from(bestByTitle.values())
        .sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.course.title.localeCompare(b.course.title);
        })
        .slice(0, limit);
};

const renderRecommendations = (coursesToShow) => {
    if (!coursesToShow.length) {
        renderEmptyState(recommendationsArea, "No strong matches yet. Update your selections and try again.");
        return;
    }

    const cards = coursesToShow
        .map((item) => buildCourseCard(item.course, item.reasons))
        .join("");
    recommendationsArea.innerHTML = `<div class="recommendations-grid">${cards}</div>`;
};

const buildLearningPath = (scoredCourses) => {
    const levelOrder = ["Beginner", "Intermediate", "Advanced"];
    const pathByLevel = {
        Beginner: null,
        Intermediate: null,
        Advanced: null
    };

    scoredCourses.forEach((item) => {
        const level = item.course.experienceLevel;
        if (!pathByLevel[level] && item.score > 0) {
            pathByLevel[level] = item.course;
        }
    });

    return levelOrder.map((level) => ({
        level,
        course: pathByLevel[level]
    }));
};

const renderLearningPath = (pathStages) => {
    const hasAtLeastOneCourse = pathStages.some((stage) => Boolean(stage.course));

    if (!hasAtLeastOneCourse) {
        renderEmptyState(pathCourseGrid, "No pathway progression available yet. Try selecting more interests.");
        return;
    }

    const stageMarkup = pathStages
        .map((stage, index) => {
            const card = stage.course
                ? buildCourseCard(stage.course)
                : '<article class="course-card course-card-empty"><p class="course-description">No matching class currently available for this level.</p></article>';

            const connector = index < pathStages.length - 1
                ? '<div class="path-arrow" aria-hidden="true">&#8595;</div>'
                : "";

            return `
                <div class="path-stage">
                    <p class="path-level">${stage.level.toUpperCase()}</p>
                    ${card}
                </div>
                ${connector}
            `;
        })
        .join("");

    pathCourseGrid.innerHTML = `<div class="learning-path-flow">${stageMarkup}</div>`;
};

const updateProgressTracker = () => {
    const profileComplete = Boolean(getSelectedAudience());
    const interestsComplete = getSelectedInterests().length > 0;
    const experienceComplete = Boolean(getSelectedExperience());
    const recommendationsComplete = recommendationsGenerated;

    const statuses = {
        profile: profileComplete,
        interests: interestsComplete,
        experience: experienceComplete,
        recommendations: recommendationsComplete
    };

    const orderedSteps = ["profile", "interests", "experience", "recommendations"];
    const activeStep = orderedSteps.find((step) => !statuses[step]) || "recommendations";

    progressSteps.forEach((step) => {
        const stepName = step.dataset.step;
        const isComplete = Boolean(statuses[stepName]);
        const isActive = stepName === activeStep;

        step.classList.toggle("is-complete", isComplete);
        step.classList.toggle("is-active", isActive);
    });
};

if (findPathButton) {
    findPathButton.addEventListener("click", () => {
        if (!courses.length) {
            renderEmptyState(recommendationsArea, "Course data is still loading. Please try again in a moment.");
            renderEmptyState(pathCourseGrid, "Suggested learning path is unavailable until course data loads.");
            return;
        }

        const audience = getSelectedAudience();
        const interests = getSelectedInterests();
        const experience = getSelectedExperience();

        const scoredCourses = courses
            .map((course) => ({
                course,
                ...scoreCourse(course, audience, interests, experience)
            }))
            .sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                return a.course.title.localeCompare(b.course.title);
            });

        const topMatches = getUniqueTopRecommendations(scoredCourses, 3);
        renderRecommendations(topMatches);

        const pathwayCourses = buildLearningPath(scoredCourses);
        renderLearningPath(pathwayCourses);

        recommendationsGenerated = true;
        updateProgressTracker();
    });
}

document.querySelectorAll("input[name='audience'], input[name='topics'], input[name='experience']").forEach((input) => {
    input.addEventListener("change", updateProgressTracker);
});

const loadCourses = async () => {
    try {
        const response = await fetch("./courses.json");
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error("courses.json did not return an array");
        }

        courses = data;
        if (findPathButton) {
            findPathButton.disabled = false;
        }
    } catch (error) {
        renderEmptyState(recommendationsArea, "Unable to load course data from courses.json. Please refresh or verify the file.");
        renderEmptyState(pathCourseGrid, "Suggested learning path is unavailable because course data could not be loaded.");
    }
};

loadCourses();
updateProgressTracker();