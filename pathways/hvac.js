const trainingCourses = document.getElementById("eecTrainingCourses");

const escapeHtml = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatCourseDate = (dateValue) => {
    if (!dateValue) {
        return "Date to be announced";
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
        return "Date to be announced";
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    }).format(date);
};

const isHvacCourse = (course) => {
    const topics = Array.isArray(course.topics) ? course.topics : [];
    const searchableText = [course.title, course.category, ...topics]
        .join(" ")
        .toLowerCase();

    return searchableText.includes("hvac/r");
};

const isUpcoming = (course) => {
    if (!course.startDate) {
        return true;
    }

    const startDate = new Date(course.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !Number.isNaN(startDate.getTime()) && startDate >= today;
};

const buildCourseCard = (course) => {
    const metadata = [
        course.experienceLevel,
        course.deliveryType,
        course.location
    ].filter(Boolean);
    const registrationLink = course.registrationUrl
        ? `<a class="register-button" href="${escapeHtml(course.registrationUrl)}" target="_blank" rel="noopener noreferrer">View Course</a>`
        : "";

    return `
        <article class="card hvac-course-card">
            <span class="tag">EEC Training</span>
            <h3>${escapeHtml(course.title)}</h3>
            <p>${escapeHtml(course.category || "HVAC/R training")}</p>
            <div class="hvac-course-meta">
                <span><strong>Date</strong>${escapeHtml(formatCourseDate(course.startDate))}</span>
                ${metadata.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
            </div>
            ${course.learningUnits ? `<p class="hvac-learning-units">${escapeHtml(course.learningUnits)}</p>` : ""}
            ${registrationLink}
        </article>
    `;
};

const renderCourses = (courses) => {
    const upcomingCourses = courses
        .filter((course) => isHvacCourse(course) && !String(course.status || "").toLowerCase().startsWith("hold"))
        .sort((firstCourse, secondCourse) => String(firstCourse.startDate || "").localeCompare(String(secondCourse.startDate || "")));
    const selectedCourses = upcomingCourses.filter(isUpcoming).slice(0, 3);
    const coursesToShow = selectedCourses.length ? selectedCourses : upcomingCourses.slice(0, 3);

    if (!coursesToShow.length) {
        trainingCourses.innerHTML = '<p class="empty-state">No HVAC/R courses are currently available. Please check back for upcoming training.</p>';
        return;
    }

    trainingCourses.innerHTML = coursesToShow.map(buildCourseCard).join("");
};

if (trainingCourses) {
    fetch("../courses.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Course catalog unavailable");
            }
            return response.json();
        })
        .then(renderCourses)
        .catch(() => {
            trainingCourses.innerHTML = '<p class="empty-state">EEC training details are temporarily unavailable. Please try again soon.</p>';
        });
}
