const assistantMessages = document.getElementById("assistantMessages");
const assistantForm = document.getElementById("assistantForm");
const assistantInput = document.getElementById("assistantInput");
const assistantStatus = document.getElementById("assistantStatus");
const recommendationArea = document.getElementById("assistantRecommendations");
const assistantReset = document.getElementById("assistantReset");
const promptButtons = Array.from(document.querySelectorAll(".prompt-chip"));

const initialAssistantGreeting =
	"Hello. I can help you explore EEC classes and build a learning path. Tell me what you are hoping to learn or accomplish.";
const initialRecommendationMessage = "Recommendations will appear after you send a message.";

let courses = [];

const levelRank = {
	beginner: 1,
	intermediate: 2,
	advanced: 3
};

const audienceDetectors = [
	{ label: "Contractor", terms: ["contractor", "trade contractor"] },
	{ label: "Student", terms: ["student", "intern", "new grad"] },
	{ label: "Government", terms: ["government", "city", "county", "municipal", "public sector"] },
	{ label: "Educator", terms: ["educator", "teacher", "instructor", "faculty", "trainer"] },
	{ label: "Commercial Customer", terms: ["commercial", "facility", "facilities", "building owner", "property manager"] },
	{ label: "Residential Customer", terms: ["homeowner", "residential", "home"] },
	{ label: "Building Professional", terms: ["engineer", "architect", "building professional"] }
];

const topicRules = [
	{
		label: "Electrification & Decarbonization",
		detectionTerms: ["electrification", "decarbonization", "heat pump", "electric"],
		topicAliases: ["electrification & decarbonization", "electrification", "decarbonization"],
		titleTerms: ["electrification", "decarbonization", "heat pump", "electric"],
		searchKeywords: ["electrification", "decarbonization", "heat pump", "electric"]
	},
	{
		label: "HVAC/R",
		detectionTerms: ["hvac", "hvac/r", "refrigeration", "chiller", "air conditioning", "ventilation", "hydronic", "air balancing", "duct"],
		topicAliases: ["hvac/r", "hvac", "refrigeration"],
		titleTerms: ["hvac", "refrigeration", "chiller", "air conditioning", "heat pump", "duct", "ventilation", "air balancing", "hydronic", "building hvac"],
		searchKeywords: ["hvac", "refrigeration", "chiller", "air conditioning", "heat pump", "duct", "ventilation", "air balancing", "hydronic", "building hvac"]
	},
	{
		label: "Energy Codes & Standards",
		detectionTerms: ["title 24", "energy code", "codes", "standards", "cabec", "icc"],
		topicAliases: ["energy codes & standards", "energy code", "title 24"],
		titleTerms: ["title 24", "energy code", "standards"],
		searchKeywords: ["title 24", "energy code", "standards"]
	},
	{
		label: "Building Performance",
		detectionTerms: ["building performance", "building operations", "benchmarking", "boc"],
		topicAliases: ["building performance", "energy efficiency & building operations"],
		titleTerms: ["building performance", "building operations", "benchmarking", "boc"],
		searchKeywords: ["building performance", "building operations", "benchmarking", "boc"]
	},
	{
		label: "Agriculture & Irrigation",
		detectionTerms: ["agriculture", "irrigation", "pump", "pumping"],
		topicAliases: ["agriculture, pumps & irrigation", "agriculture & irrigation", "agriculture"],
		titleTerms: ["agriculture", "irrigation", "pump"],
		searchKeywords: ["agriculture", "irrigation", "pump"]
	},
	{
		label: "Foodservice",
		detectionTerms: ["foodservice", "kitchen", "culinary"],
		topicAliases: ["foodservice"],
		titleTerms: ["foodservice", "kitchen", "culinary"],
		searchKeywords: ["foodservice", "kitchen", "culinary"]
	},
	{
		label: "Lighting",
		detectionTerms: ["lighting", "lamp", "daylighting", "luminaire"],
		topicAliases: ["lighting"],
		titleTerms: ["lighting", "daylighting", "luminaire"],
		searchKeywords: ["lighting", "daylighting", "luminaire"]
	},
	{
		label: "Industrial Automation",
		detectionTerms: ["industrial", "automation", "plc", "manufacturing", "robotics", "industrial controls"],
		topicAliases: ["industrial automation", "energy processes & technology"],
		titleTerms: ["industrial", "automation", "plc", "manufacturing", "robotics"],
		searchKeywords: ["industrial", "automation", "plc", "manufacturing", "robotics"]
	}
];

const hvacTitleTerms = ["hvac", "refrigeration", "chiller", "air conditioning", "heat pump", "duct", "ventilation", "air balancing", "hydronic", "building hvac"];
const industrialIntentTerms = ["automation", "plc", "manufacturing", "industrial controls", "robotics", "industrial"];
const beginnerIntentTerms = ["beginner", "new", "basics", "fundamentals", "introduction", "introductory", "getting started", "start"];
const deliveryLabelPattern = /\((?:\s*(?:via\s+zoom|webinar|adobe\s+connect|zoom|microsoft\s+teams|virtual|in[\s-]?person|online(?:\s*-\s*webinar)?)\s*)\)/gi;

const foundationalBonusRules = [
	{ term: "fundamentals", points: 8 },
	{ term: "introduction", points: 7 },
	{ term: "introductory", points: 7 },
	{ term: "101", points: 6 },
	{ term: "basics", points: 6 }
];

const specializedTermRules = [
	{ key: "ice machine", terms: ["ice machine"] },
	{ key: "chiller", terms: ["chiller"] },
	{ key: "commercial refrigeration", terms: ["commercial refrigeration"] },
	{ key: "hydronic balancing", terms: ["hydronic balancing"] },
	{ key: "certification exam", terms: ["certification exam"] },
	{ key: "diagnostics certification", terms: ["diagnostics certification", "diagnostic certification"] }
];

const continuingEducationTerms = ["continuing education", "continuing ed", "ceu", "credits"];
const continuingEducationTopicReplies = [
	"Energy Codes & Standards",
	"Building Performance",
	"HVAC/R",
	"Electrification & Decarbonization",
	"Lighting",
	"Agriculture & Irrigation"
];

const electrificationSubtopicRules = [
	{
		key: "buildingElectrification",
		keywords: [
			"building electrification",
			"electric buildings",
			"all-electric building",
			"building operations electrification",
			"building decarbonization",
			"facility electrification",
			"facilities electrification"
		],
		relatedPriorityTerms: [
			"building electrification",
			"all-electric building",
			"building operations electrification",
			"facility electrification",
			"building decarbonization",
			"building electrification program"
		]
	},
	{
		key: "transportationElectrification",
		keywords: ["ev", "electric vehicle", "charging", "bi-directional charging", "transportation electrification"],
		relatedPriorityTerms: ["electric vehicle", "ev", "charging", "bi-directional charging", "transportation electrification"]
	},
	{
		key: "agriculturalElectrification",
		keywords: ["agriculture", "agricultural", "farm", "farming", "irrigation", "agricultural electrification"],
		relatedPriorityTerms: ["agriculture", "agricultural", "farm", "farming", "irrigation", "agricultural electrification"]
	},
	{
		key: "solarStorage",
		keywords: ["solar", "battery", "storage", "nem"],
		relatedPriorityTerms: ["solar", "battery", "storage", "nem"]
	},
	{
		key: "panelRetrofit",
		keywords: ["panel upgrade", "electrical panel", "retrofit", "existing building", "load calculation"],
		relatedPriorityTerms: ["panel upgrade", "electrical panel", "retrofit", "existing building", "load calculation"]
	}
];

const conversationContext = {
	audience: "",
	topic: "",
	experience: "",
	electrificationSubtopic: "",
	learningGoal: "",
	awaitingExperience: false,
	latestUserMessage: ""
};

const normalizeText = (value) => String(value || "").toLowerCase().trim();

const normalizeArray = (value) => {
	if (Array.isArray(value)) {
		return value;
	}
	if (!value) {
		return [];
	}
	return [value];
};

const includesAny = (text, terms) => terms.some((term) => text.includes(normalizeText(term)));

const levelValue = (value) => levelRank[normalizeText(value)] || 0;

const normalizeComparableTitle = (value, options = {}) => {
	const { stripSeriesMarkers = false } = options;
	let text = normalizeText(value)
		.replace(/&/g, " and ")
		.replace(/\bvia\s+zoom\b/g, "zoom")
		.replace(deliveryLabelPattern, " ");

	if (stripSeriesMarkers) {
		text = text
			.replace(/\bday\s*\d+\s*of\s*\d+\b/g, " ")
			.replace(/\bpart\s*\d+\b/g, " ");
	}

	return text
		.replace(/[^a-z0-9\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
};

const cleanSeriesDisplayTitle = (value) => {
	return String(value || "")
		.replace(/\bDay\s*\d+\s*of\s*\d+\b/gi, " ")
		.replace(/\bPart\s*\d+\b/gi, " ")
		.replace(deliveryLabelPattern, " ")
		.replace(/\s+/g, " ")
		.replace(/[\-:]+\s*$/g, "")
		.trim();
};

const extractPartOrder = (title) => {
	const text = String(title || "");
	const partMatch = text.match(/\bpart\s*(\d+)\b/i);
	if (partMatch) {
		return Number(partMatch[1]);
	}
	const dayMatch = text.match(/\bday\s*(\d+)\s*of\s*\d+\b/i);
	if (dayMatch) {
		return Number(dayMatch[1]);
	}
	return Number.MAX_SAFE_INTEGER;
};

const getCourseStartMs = (course) => {
	const datePart = String(course.startDate || "").split("T")[0];
	if (!datePart) {
		return Number.MAX_SAFE_INTEGER;
	}
	const timePart = String(course.startTime || "00:00") || "00:00";
	const parsed = new Date(`${datePart}T${timePart}:00`).getTime();
	return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
};

const getUserIntentText = () => normalizeText(`${conversationContext.latestUserMessage} ${conversationContext.learningGoal}`);

const isBeginnerIntent = () => {
	if (normalizeText(conversationContext.experience) === "beginner") {
		return true;
	}
	return includesAny(getUserIntentText(), beginnerIntentTerms);
};

const getFoundationalBonus = (titleText) => {
	let points = 0;
	foundationalBonusRules.forEach((rule) => {
		if (titleText.includes(rule.term)) {
			points += rule.points;
		}
	});
	return points;
};

const getSpecializationKeys = (text) => {
	const normalized = normalizeText(text);
	const keys = [];
	specializedTermRules.forEach((rule) => {
		if (rule.terms.some((term) => normalized.includes(term))) {
			keys.push(rule.key);
		}
	});
	return keys;
};

const hasContinuingEducationIntent = (message) => {
	const normalized = normalizeText(message);
	if (includesAny(normalized, continuingEducationTerms)) {
		return true;
	}
	return /\bceu\b|\bcredits?\b/.test(normalized);
};

const getElectrificationSubtopicRule = () => {
	return electrificationSubtopicRules.find((rule) => rule.key === conversationContext.electrificationSubtopic) || null;
};

const detectElectrificationSubtopic = (message) => {
	const normalized = normalizeText(message);
	const scored = electrificationSubtopicRules
		.map((rule) => ({
			key: rule.key,
			hits: rule.keywords.filter((term) => normalized.includes(term)).length
		}))
		.filter((item) => item.hits > 0)
		.sort((a, b) => b.hits - a.hits);

	return scored.length ? scored[0].key : "";
};

const evaluateCourseElectrificationSubtopic = (course, subtopicRule) => {
	if (!subtopicRule) {
		return {
			isSubtopicMatch: false,
			hasExactSubtopicPhrase: false,
			matchedSubtopics: []
		};
	}

	const title = normalizeText(course.title);
	const searchText = normalizeText(course.searchText);
	const combined = `${title} ${searchText}`;
	const isSubtopicMatch = subtopicRule.keywords.some((term) => combined.includes(term));
	const hasExactSubtopicPhrase = subtopicRule.relatedPriorityTerms.some((term) => title.includes(term) || searchText.includes(term));

	const matchedSubtopics = electrificationSubtopicRules
		.filter((rule) => rule.keywords.some((term) => combined.includes(term)))
		.map((rule) => rule.key);

	return {
		isSubtopicMatch,
		hasExactSubtopicPhrase,
		matchedSubtopics
	};
};

const getSubjectKeyFromTitle = (title) => {
	return normalizeComparableTitle(title, { stripSeriesMarkers: true })
		.replace(/\b(certification|program|module|course|courses|training|workshop|day)\b/g, " ")
		.replace(/\s+/g, " ")
		.trim();
};

const setStatus = (message) => {
	assistantStatus.textContent = message;
};

const resetConversationContext = () => {
	conversationContext.audience = "";
	conversationContext.topic = "";
	conversationContext.experience = "";
	conversationContext.electrificationSubtopic = "";
	conversationContext.learningGoal = "";
	conversationContext.awaitingExperience = false;
	conversationContext.latestUserMessage = "";
};

const appendMessage = (sender, message) => {
	const article = document.createElement("article");
	article.className = `message ${sender}`;

	const label = document.createElement("p");
	label.className = "message-label";
	label.textContent = sender === "user" ? "You" : "Assistant";

	const body = document.createElement("p");
	body.textContent = message;

	article.append(label, body);
	assistantMessages.appendChild(article);
	assistantMessages.scrollTop = assistantMessages.scrollHeight;
};

const appendAssistantMessage = (contentBuilder) => {
	const article = document.createElement("article");
	article.className = "message assistant";

	const label = document.createElement("p");
	label.className = "message-label";
	label.textContent = "Assistant";

	article.appendChild(label);
	contentBuilder(article);

	assistantMessages.appendChild(article);
	assistantMessages.scrollTop = assistantMessages.scrollHeight;
};

const clearRecommendations = (message) => {
	recommendationArea.innerHTML = "";
	const emptyState = document.createElement("p");
	emptyState.className = "empty-state";
	emptyState.textContent = message;
	recommendationArea.appendChild(emptyState);
};

const detectAudience = (message) => {
	const normalized = normalizeText(message);
	for (const detector of audienceDetectors) {
		if (detector.terms.some((term) => normalized.includes(normalizeText(term)))) {
			return detector.label;
		}
	}
	return "";
};

const detectTopic = (message) => {
	const normalized = normalizeText(message);
	const scored = topicRules
		.map((rule) => ({
			label: rule.label,
			hits: rule.detectionTerms.filter((term) => normalized.includes(normalizeText(term))).length
		}))
		.filter((item) => item.hits > 0)
		.sort((a, b) => b.hits - a.hits);

	return scored.length ? scored[0].label : "";
};

const detectExperience = (message) => {
	const normalized = normalizeText(message);
	if (/\bbeginner\b|\bnew\b|\bintro\b|\bintroduction\b|\bintroductory\b|\bbasics\b|\bfundamentals\b|\bgetting started\b|\bstarting\b/.test(normalized)) {
		return "Beginner";
	}
	if (/\bintermediate\b|\bsome experience\b|\bmid\b/.test(normalized)) {
		return "Intermediate";
	}
	if (/\badvanced\b|\bexpert\b|\bexperienced\b/.test(normalized)) {
		return "Advanced";
	}
	return "";
};

const detectLearningGoal = (message) => {
	const trimmed = message.trim();
	const normalized = normalizeText(trimmed);
	if (trimmed.length < 16) {
		return "";
	}
	if (/\b(learn|goal|accomplish|need|want|help|continuing education|ceu|credential|certificate)\b/.test(normalized)) {
		return trimmed;
	}
	return "";
};

const updateContextFromMessage = (message) => {
	conversationContext.latestUserMessage = message;

	const audience = detectAudience(message);
	const topic = detectTopic(message);
	const experience = detectExperience(message);
	const electrificationSubtopic = detectElectrificationSubtopic(message);
	const goal = detectLearningGoal(message);

	if (audience) {
		conversationContext.audience = audience;
	}
	if (topic) {
		conversationContext.topic = topic;
	}
	if (conversationContext.topic === "Electrification & Decarbonization" && electrificationSubtopic) {
		conversationContext.electrificationSubtopic = electrificationSubtopic;
	}
	if (conversationContext.topic !== "Electrification & Decarbonization") {
		conversationContext.electrificationSubtopic = "";
	}
	if (experience) {
		conversationContext.experience = experience;
		conversationContext.awaitingExperience = false;
	}
	if (goal) {
		conversationContext.learningGoal = goal;
	}
};

const buildUnderstoodItems = () => {
	const items = [];
	if (conversationContext.audience) {
		items.push(`Role or audience: ${conversationContext.audience}`);
	}
	if (conversationContext.topic) {
		items.push(`Topic or interest: ${conversationContext.topic}`);
	}
	if (conversationContext.experience) {
		items.push(`Experience level: ${conversationContext.experience}`);
	}
	if (conversationContext.learningGoal) {
		items.push(`Learning goal: ${conversationContext.learningGoal}`);
	}
	return items;
};

const renderWhatIUnderstood = () => {
	const items = buildUnderstoodItems();
	appendAssistantMessage((article) => {
		const heading = document.createElement("p");
		heading.style.margin = "0 0 0.35rem";
		heading.style.fontWeight = "700";
		heading.textContent = "What I understood";
		article.appendChild(heading);

		if (!items.length) {
			const note = document.createElement("p");
			note.textContent = "I need a bit more detail to provide targeted recommendations.";
			article.appendChild(note);
			return;
		}

		const list = document.createElement("ul");
		list.style.margin = "0";
		list.style.paddingLeft = "1.1rem";
		items.forEach((text) => {
			const li = document.createElement("li");
			li.textContent = text;
			list.appendChild(li);
		});
		article.appendChild(list);
	});
};

const appendTopicQuickReplies = (question, topics) => {
	appendAssistantMessage((article) => {
		const prompt = document.createElement("p");
		prompt.style.margin = "0 0 0.55rem";
		prompt.textContent = question;
		article.appendChild(prompt);

		const wrapper = document.createElement("div");
		wrapper.style.display = "grid";
		wrapper.style.gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
		wrapper.style.gap = "0.45rem";

		topics.forEach((topic) => {
			const button = document.createElement("button");
			button.type = "button";
			button.className = "prompt-chip";
			button.textContent = topic;
			button.addEventListener("click", () => {
				appendMessage("user", topic);
				setStatus("Generating recommendations...");
				handleMessage(topic);
			});
			wrapper.appendChild(button);
		});

		article.appendChild(wrapper);
	});
};

const getActiveTopicRule = () => topicRules.find((rule) => rule.label === conversationContext.topic) || null;

const evaluateTopicRelevance = (course, topicRule) => {
	if (!topicRule) {
		return {
			relevant: false,
			exactTopicMatch: false,
			categoryMatch: false,
			titlePhraseMatch: false,
			searchTextMatch: false
		};
	}

	const topics = normalizeArray(course.topics).map((item) => normalizeText(item));
	const category = normalizeText(course.category);
	const title = normalizeText(course.title);
	const searchText = normalizeText(course.searchText);

	const exactTopicMatch = topics.some((topicValue) =>
		topicRule.topicAliases.some((alias) => topicValue === normalizeText(alias))
	);
	const categoryMatch = topicRule.topicAliases.some((alias) => category.includes(normalizeText(alias)));
	const titlePhraseMatch = includesAny(title, topicRule.titleTerms);
	const searchTextMatch = includesAny(searchText, topicRule.searchKeywords);

	let relevant = exactTopicMatch || categoryMatch || titlePhraseMatch || searchTextMatch;

	if (topicRule.label === "HVAC/R") {
		const hvacExplicit = exactTopicMatch || category.includes("hvac") || includesAny(title, hvacTitleTerms);
		if (!hvacExplicit) {
			relevant = false;
		}

		const industrialLike = category.includes("energy processes & technology") || category.includes("industrial automation");
		if (industrialLike) {
			const userIntent = getUserIntentText();
			const allowIndustrial = includesAny(userIntent, industrialIntentTerms);
			if (!allowIndustrial) {
				relevant = false;
			}
		}
	}

	return {
		relevant,
		exactTopicMatch,
		categoryMatch,
		titlePhraseMatch,
		searchTextMatch
	};
};

const courseMatchesAudience = (course) => {
	if (!conversationContext.audience) {
		return false;
	}
	return normalizeArray(course.audiences).some((audience) => normalizeText(audience) === normalizeText(conversationContext.audience));
};

const scoreCourse = (course, topicRule) => {
	const topic = evaluateTopicRelevance(course, topicRule);
	if (!topic.relevant) {
		return {
			topicRelevant: false,
			topicScore: 0,
			foundationalScore: 0,
			audienceMatch: false,
			isLevelMatch: false,
			isNextStep: false,
			courseRank: 0,
			reasons: []
		};
	}

	let topicScore = 0;
	if (topic.exactTopicMatch) {
		topicScore += 15;
	}
	if (topic.categoryMatch) {
		topicScore += 10;
	}
	if (topic.titlePhraseMatch) {
		topicScore += 8;
	}
	if (topic.searchTextMatch) {
		topicScore += 5;
	}

	const selectedRank = levelValue(conversationContext.experience);
	const courseRank = levelValue(course.experienceLevel);
	const levelMatch = courseRank === selectedRank;
	const isNextStep = courseRank === Math.min(3, selectedRank + 1);

	const audienceMatch = courseMatchesAudience(course);
	const titleComparable = normalizeComparableTitle(course.title);
	const electrificationSubtopicRule =
		conversationContext.topic === "Electrification & Decarbonization" ? getElectrificationSubtopicRule() : null;
	const subtopicEvaluation = evaluateCourseElectrificationSubtopic(course, electrificationSubtopicRule);
	const exactSubtopicBonus = subtopicEvaluation.hasExactSubtopicPhrase ? 12 : 0;
	topicScore += exactSubtopicBonus;

	// Title wording bonus is ranking-only and only compared among same structured level.
	const foundationalScore = isBeginnerIntent() ? getFoundationalBonus(titleComparable) : 0;

	return {
		topicRelevant: true,
		topicScore,
		foundationalScore,
		audienceMatch,
		isLevelMatch: levelMatch,
		isNextStep,
		isSubtopicMatch: subtopicEvaluation.isSubtopicMatch,
		hasExactSubtopicPhrase: subtopicEvaluation.hasExactSubtopicPhrase,
		matchedSubtopics: subtopicEvaluation.matchedSubtopics,
		exactSubtopicBonus,
		courseRank,
		reasons: []
	};
};

const levelBucket = (candidate) => {
	if (candidate.isLevelMatch) {
		return 0;
	}
	if (candidate.isNextStep) {
		return 1;
	}
	return 2;
};

const compareCandidateRank = (a, b) => {
	const bucketA = levelBucket(a);
	const bucketB = levelBucket(b);
	if (bucketA !== bucketB) {
		return bucketA - bucketB;
	}
	if (b.topicScore !== a.topicScore) {
		return b.topicScore - a.topicScore;
	}
	if (Number(b.isSubtopicMatch) !== Number(a.isSubtopicMatch)) {
		return Number(b.isSubtopicMatch) - Number(a.isSubtopicMatch);
	}
	if (b.exactSubtopicBonus !== a.exactSubtopicBonus) {
		return b.exactSubtopicBonus - a.exactSubtopicBonus;
	}
	if (a.courseRank === b.courseRank && b.foundationalScore !== a.foundationalScore) {
		return b.foundationalScore - a.foundationalScore;
	}
	if (Number(b.audienceMatch) !== Number(a.audienceMatch)) {
		return Number(b.audienceMatch) - Number(a.audienceMatch);
	}
	if (a.startMs !== b.startMs) {
		return a.startMs - b.startMs;
	}
	return String(a.course.title || "").localeCompare(String(b.course.title || ""));
};

const buildCandidateList = () => {
	const topicRule = getActiveTopicRule();
	if (!topicRule) {
		return [];
	}

	const scored = courses
		.map((course) => {
			const scoredData = scoreCourse(course, topicRule);
			const normalizedTitle = normalizeComparableTitle(course.title);
			const seriesKey = normalizeComparableTitle(course.title, { stripSeriesMarkers: true });
			return {
				course,
				normalizedTitle,
				seriesKey,
				subjectKey: getSubjectKeyFromTitle(course.title),
				startMs: getCourseStartMs(course),
				partOrder: extractPartOrder(course.title),
				...scoredData
			};
		})
		.filter((item) => item.topicRelevant && item.topicScore > 0);

	const dedupedByTitle = new Map();
	scored.forEach((item) => {
		const existing = dedupedByTitle.get(item.normalizedTitle);
		if (!existing) {
			dedupedByTitle.set(item.normalizedTitle, item);
			return;
		}
		if (item.startMs < existing.startMs) {
			dedupedByTitle.set(item.normalizedTitle, item);
			return;
		}
		if (item.startMs === existing.startMs && compareCandidateRank(item, existing) < 0) {
			dedupedByTitle.set(item.normalizedTitle, item);
		}
	});

	const deduped = Array.from(dedupedByTitle.values());
	const groupedBySeries = new Map();
	deduped.forEach((item) => {
		if (!groupedBySeries.has(item.seriesKey)) {
			groupedBySeries.set(item.seriesKey, []);
		}
		groupedBySeries.get(item.seriesKey).push(item);
	});

	const seriesCollapsed = [];
	groupedBySeries.forEach((items, seriesKey) => {
		const uniqueByTitle = new Map();
		items.forEach((entry) => {
			const existing = uniqueByTitle.get(entry.normalizedTitle);
			if (!existing || entry.startMs < existing.startMs) {
				uniqueByTitle.set(entry.normalizedTitle, entry);
			}
		});

		const uniqueParts = Array.from(uniqueByTitle.values()).sort((a, b) => {
			if (a.partOrder !== b.partOrder) {
				return a.partOrder - b.partOrder;
			}
			if (a.startMs !== b.startMs) {
				return a.startMs - b.startMs;
			}
			return String(a.course.title || "").localeCompare(String(b.course.title || ""));
		});

		const ranked = [...uniqueParts].sort(compareCandidateRank);
		const top = ranked[0];
		const cleanedNames = uniqueParts
			.map((part) => cleanSeriesDisplayTitle(part.course.title))
			.filter(Boolean)
			.sort((a, b) => a.length - b.length);
		const seriesName = cleanedNames[0] || cleanSeriesDisplayTitle(top.course.title) || "Course Series";

		const allPartUrls = uniqueParts.map((part) => part.course.registrationUrl).filter(Boolean);
		const hasDistinctPartUrls = allPartUrls.length === uniqueParts.length && new Set(allPartUrls).size === uniqueParts.length;

		const experienceValues = new Set(uniqueParts.map((part) => normalizeText(part.course.experienceLevel)).filter(Boolean));
		const deliveryValues = new Set(uniqueParts.map((part) => normalizeText(part.course.deliveryType)).filter(Boolean));

		seriesCollapsed.push({
			seriesKey,
			subjectKey: top.subjectKey,
			course: top.course,
			startMs: top.startMs,
			topicScore: top.topicScore,
			foundationalScore: top.foundationalScore,
			audienceMatch: top.audienceMatch,
			isLevelMatch: top.isLevelMatch,
			isNextStep: top.isNextStep,
			courseRank: top.courseRank,
			reasons: [],
			seriesItems: uniqueParts,
			isSeries: uniqueParts.length > 1,
			seriesName,
			hasDistinctPartUrls,
			seriesExperienceLevel: experienceValues.size === 1 ? uniqueParts[0].course.experienceLevel : "",
			seriesDeliveryType: deliveryValues.size === 1 ? uniqueParts[0].course.deliveryType : ""
		});
	});

	return seriesCollapsed.sort(compareCandidateRank);
};

const buildReasonsForRecommendation = (candidate) => {
	const topicReason = `Matches your ${conversationContext.topic} interest`;
	const selectedRank = levelValue(conversationContext.experience);
	const courseLevel = candidate.course.experienceLevel || "this";
	const reasons = [];

	if (candidate.isLevelMatch) {
		reasons.push(topicReason);
		reasons.push(`Matches your ${conversationContext.experience} experience level`);
		return reasons;
	}

	if (selectedRank === 1 && candidate.courseRank === 2) {
		reasons.push(topicReason);
		reasons.push("Intermediate next-step course");
		reasons.push("Consider after completing foundational learning");
		return reasons;
	}

	if (selectedRank === 1 && candidate.courseRank === 3) {
		reasons.push(topicReason);
		reasons.push("Advanced follow-on course");
		reasons.push("Consider after completing foundational learning");
		return reasons;
	}

	if (candidate.isNextStep) {
		reasons.push(topicReason);
		reasons.push(`${courseLevel} next-step course`);
		reasons.push("Consider after completing foundational learning");
		return reasons;
	}

	reasons.push(topicReason);
	reasons.push(`${courseLevel} follow-on course`);
	return reasons;
};

const pickRecommendations = (candidates) => {
	if (!candidates.length) {
		return {
			currentLevel: [],
			nextSteps: [],
			relatedElectrification: []
		};
	}

	const selectedRank = levelValue(conversationContext.experience);
	let pool = [...candidates].sort(compareCandidateRank);
	const activeSubtopic = getElectrificationSubtopicRule();
	const isElectrificationSubtopicMode =
		conversationContext.topic === "Electrification & Decarbonization" && Boolean(activeSubtopic);

	if (selectedRank === 1) {
		const hasBeginnerOrIntermediate = pool.some((item) => item.courseRank === 1 || item.courseRank === 2);
		if (hasBeginnerOrIntermediate) {
			pool = pool.filter((item) => item.courseRank !== 3);
		}
	}

	const usedSeries = new Set();
	const usedSubjects = new Set();
	const usedTitles = new Set();

	const takeUnique = (bucket, maxCount) => {
		const picks = [];
		for (const candidate of bucket) {
			if (picks.length >= maxCount) {
				break;
			}
			const normalizedTitle = normalizeComparableTitle(candidate.isSeries ? candidate.seriesName : candidate.course.title);
			if (usedSeries.has(candidate.seriesKey) || usedSubjects.has(candidate.subjectKey) || usedTitles.has(normalizedTitle)) {
				continue;
			}
			picks.push({
				type: candidate.isSeries ? "series" : "course",
				item: {
					...candidate,
					reasons: buildReasonsForRecommendation(candidate)
				}
			});
			usedSeries.add(candidate.seriesKey);
			usedSubjects.add(candidate.subjectKey);
			usedTitles.add(normalizedTitle);
		}
		return picks;
	};

	const currentBucket = pool.filter((item) => item.isLevelMatch);
	const nextBucket = pool.filter((item) => !item.isLevelMatch && item.isNextStep);
	const otherBucket = pool.filter((item) => !item.isLevelMatch && !item.isNextStep);
	const directSubtopicCurrent = isElectrificationSubtopicMode
		? currentBucket.filter((item) => item.isSubtopicMatch)
		: currentBucket;
	const relatedCurrent = isElectrificationSubtopicMode
		? currentBucket.filter((item) => !item.isSubtopicMatch)
		: [];

	const currentLevel = takeUnique(directSubtopicCurrent, 3);
	let relatedElectrification = [];

	if (isElectrificationSubtopicMode && currentLevel.length < 3) {
		let relatedPool = relatedCurrent;

		if (activeSubtopic.key === "buildingElectrification") {
			const nonEvOrAg = relatedPool.filter(
				(item) => !item.matchedSubtopics.includes("transportationElectrification") && !item.matchedSubtopics.includes("agriculturalElectrification")
			);
			const hasEnoughBuildingRelevant = directSubtopicCurrent.length >= 3;
			if (hasEnoughBuildingRelevant) {
				relatedPool = nonEvOrAg;
			} else if (nonEvOrAg.length) {
				relatedPool = [...nonEvOrAg, ...relatedPool.filter((item) => !nonEvOrAg.includes(item))];
			}
		}

		relatedElectrification = takeUnique(relatedPool, Math.max(0, 3 - currentLevel.length));
	}

	const maxNext = Math.max(0, 3 - currentLevel.length - relatedElectrification.length);

	const nextSteps = [...takeUnique(nextBucket, maxNext), ...takeUnique(otherBucket, Math.max(0, maxNext - nextBucket.length))].slice(0, maxNext);

	return {
		currentLevel,
		nextSteps,
		relatedElectrification
	};
};

const createCourseCard = (course, reasons = []) => {
	const card = document.createElement("article");
	card.className = "course-card";

	const title = document.createElement("h3");
	title.textContent = course.title || "Untitled Course";

	const category = document.createElement("p");
	category.className = "course-description";
	category.textContent = `Category: ${course.category || "Not listed"}`;

	const metaRow = document.createElement("div");
	metaRow.className = "meta-row";

	const level = document.createElement("span");
	level.className = "meta-pill";
	level.textContent = course.experienceLevel || "Level TBD";

	const location = document.createElement("span");
	location.className = "meta-pill";
	location.textContent = course.location || "Location TBD";

	const delivery = document.createElement("span");
	delivery.className = "meta-pill";
	delivery.textContent = course.deliveryType || "Delivery TBD";

	metaRow.append(level, location, delivery);

	const why = document.createElement("div");
	why.className = "why-recommended";
	const whyTitle = document.createElement("p");
	whyTitle.textContent = "Why Recommended";
	const whyList = document.createElement("ul");

	reasons.slice(0, 4).forEach((reason) => {
		const li = document.createElement("li");
		li.textContent = reason;
		whyList.appendChild(li);
	});

	why.append(whyTitle, whyList);

	const action = document.createElement(course.registrationUrl ? "a" : "button");
	action.className = "register-button";
	action.textContent = "View Class";

	if (course.registrationUrl) {
		action.href = course.registrationUrl;
		action.target = "_blank";
		action.rel = "noopener noreferrer";
	} else {
		action.type = "button";
		action.disabled = true;
	}

	card.append(title, category, metaRow, why, action);
	return card;
};

const createSeriesCard = (seriesRecommendation) => {
	const card = document.createElement("article");
	card.className = "course-card";

	const title = document.createElement("h3");
	title.textContent = seriesRecommendation.item.seriesName;

	const category = document.createElement("p");
	category.className = "course-description";
	category.textContent = `Category: ${seriesRecommendation.item.course.category || "Not listed"}`;

	const metaRow = document.createElement("div");
	metaRow.className = "meta-row";

	if (seriesRecommendation.item.seriesExperienceLevel) {
		const level = document.createElement("span");
		level.className = "meta-pill";
		level.textContent = seriesRecommendation.item.seriesExperienceLevel;
		metaRow.appendChild(level);
	}
	if (seriesRecommendation.item.seriesDeliveryType) {
		const delivery = document.createElement("span");
		delivery.className = "meta-pill";
		delivery.textContent = seriesRecommendation.item.seriesDeliveryType;
		metaRow.appendChild(delivery);
	}

	const list = document.createElement("ul");
	list.className = "series-parts-list";
	list.id = `series-parts-${seriesRecommendation.item.seriesKey.replace(/\s+/g, "-")}`;
	list.tabIndex = -1;

	seriesRecommendation.item.seriesItems.forEach((entry) => {
		const li = document.createElement("li");
		li.className = "series-part-item";
		const text = document.createElement("span");
		text.className = "series-part-title";
		text.textContent = entry.course.title;
		li.appendChild(text);

		if (seriesRecommendation.item.hasDistinctPartUrls && entry.course.registrationUrl) {
			const link = document.createElement("a");
			link.className = "series-part-link";
			link.href = entry.course.registrationUrl;
			link.target = "_blank";
			link.rel = "noopener noreferrer";
			link.textContent = "View Class";
			li.appendChild(link);
		}

		list.appendChild(li);
	});

	const why = document.createElement("div");
	why.className = "why-recommended";
	const whyTitle = document.createElement("p");
	whyTitle.textContent = "Why Recommended";
	const whyList = document.createElement("ul");

	seriesRecommendation.item.reasons.slice(0, 4).forEach((reason) => {
		const li = document.createElement("li");
		li.textContent = reason;
		whyList.appendChild(li);
	});

	why.append(whyTitle, whyList);

	const firstPartWithUrl = seriesRecommendation.item.seriesItems.find((entry) => entry.course.registrationUrl);
	const seriesAction = document.createElement(firstPartWithUrl ? "a" : "button");
	seriesAction.className = "register-button";
	seriesAction.textContent = "View Series";

	if (seriesRecommendation.item.hasDistinctPartUrls) {
		seriesAction.type = "button";
		seriesAction.addEventListener("click", () => {
			list.focus({ preventScroll: false });
			list.scrollIntoView({ behavior: "smooth", block: "nearest" });
		});
	} else if (firstPartWithUrl) {
		seriesAction.href = firstPartWithUrl.course.registrationUrl;
		seriesAction.target = "_blank";
		seriesAction.rel = "noopener noreferrer";
	} else {
		seriesAction.type = "button";
		seriesAction.disabled = true;
	}

	if (metaRow.childNodes.length) {
		card.append(title, category, metaRow, list, why, seriesAction);
	} else {
		card.append(title, category, list, why, seriesAction);
	}
	return card;
};

const appendRecommendationSection = (headingText, recommendations) => {
	if (!recommendations.length) {
		return;
	}

	const group = document.createElement("section");
	group.className = "recommendation-group";

	const heading = document.createElement("h3");
	heading.className = "recommendation-group-heading";
	heading.textContent = headingText;
	group.appendChild(heading);

	const grid = document.createElement("div");
	grid.className = "assistant-recommendation-grid";

	recommendations.forEach((entry) => {
		if (entry.type === "series") {
			grid.appendChild(createSeriesCard(entry));
			return;
		}
		grid.appendChild(createCourseCard(entry.item.course, entry.item.reasons));
	});

	group.appendChild(grid);
	recommendationArea.appendChild(group);
};

const buildNoCurrentLevelMessage = (result) => {
	const hasIntermediateNext = result.nextSteps.some((entry) => levelValue(entry.item.course.experienceLevel) === 2);
	if (conversationContext.topic === "HVAC/R" && normalizeText(conversationContext.experience) === "beginner" && hasIntermediateNext) {
		return "I did not find a Beginner-level HVAC/R offering in the current class schedule. I found Intermediate courses that may be useful next steps after foundational learning.";
	}
	return `I did not find a ${conversationContext.experience}-level ${conversationContext.topic} offering in the current class schedule.`;
};

const renderRecommendations = (result) => {
	recommendationArea.innerHTML = "";

	if (!result.currentLevel.length && !result.nextSteps.length) {
		const emptyState = document.createElement("p");
		emptyState.className = "empty-state";
		emptyState.textContent = "No direct matches were found. Try adding more details about your interests or goals.";
		recommendationArea.appendChild(emptyState);
		return;
	}

	if (!result.currentLevel.length) {
		const noCurrent = document.createElement("p");
		noCurrent.className = "empty-state";
		noCurrent.textContent = buildNoCurrentLevelMessage(result);
		recommendationArea.appendChild(noCurrent);
	}

	appendRecommendationSection("Recommended for Your Current Level", result.currentLevel);
	if (result.relatedElectrification && result.relatedElectrification.length) {
		appendRecommendationSection("Related Electrification Topics", result.relatedElectrification);
	}
	appendRecommendationSection("Suggested Next Steps", result.nextSteps);
};

const buildAssistantReply = (result) => {
	const directCount = result.currentLevel.length;
	const hasNext = result.nextSteps.length > 0;
	const topic = conversationContext.topic;
	const level = conversationContext.experience;
	const hasIntermediateNext = result.nextSteps.some((entry) => levelValue(entry.item.course.experienceLevel) === 2);
	const beginnerHvacIntermediateSentence = "This Intermediate course may be a useful next step after foundational HVAC/R learning.";

	if (topic === "HVAC/R" && normalizeText(level) === "beginner" && directCount === 0 && hasIntermediateNext) {
		return "I did not find a Beginner-level HVAC/R offering in the current class schedule. I found Intermediate courses that may be useful next steps after foundational learning.";
	}

	if (directCount === 1) {
		let response = `I found 1 course that matches your ${topic} interest and ${level} experience, plus additional next-step options.`;
		if (topic === "HVAC/R" && normalizeText(level) === "beginner" && hasIntermediateNext) {
			response += ` ${beginnerHvacIntermediateSentence}`;
		}
		return response;
	}

	if (directCount >= 2) {
		if (hasNext) {
			let response = `I found ${directCount} courses that match your ${topic} interest and ${level} experience, plus additional next-step options.`;
			if (topic === "HVAC/R" && normalizeText(level) === "beginner" && hasIntermediateNext) {
				response += ` ${beginnerHvacIntermediateSentence}`;
			}
			return response;
		}
		return `I found ${directCount} courses that match your ${topic} interest and ${level} experience.`;
	}

	if (hasNext) {
		return `I did not find a ${level}-level ${topic} offering in the current class schedule. I found next-step options that may be useful after foundational learning.`;
	}

	return `I did not find a ${level}-level ${topic} offering in the current class schedule.`;
};

const resetAssistant = () => {
	resetConversationContext();
	assistantMessages.innerHTML = "";
	appendMessage("assistant", initialAssistantGreeting);
	clearRecommendations(initialRecommendationMessage);
	assistantInput.value = "";
	assistantInput.focus();

	if (courses.length) {
		setStatus("Conversation reset. Share your role, topic, and experience level to get recommendations.");
		return;
	}

	setStatus("Conversation reset. Course data is still loading.");
};

const handleMessage = (message) => {
	if (!courses.length) {
		appendMessage("assistant", "Course data is still loading. Please try again in a moment.");
		setStatus("Course data is still loading.");
		return;
	}

	updateContextFromMessage(message);
	renderWhatIUnderstood();

	if (!conversationContext.topic && hasContinuingEducationIntent(message)) {
		appendTopicQuickReplies(
			"What topic would you like continuing education opportunities in?",
			continuingEducationTopicReplies
		);
		setStatus("Waiting for topic selection before generating recommendations.");
		clearRecommendations("Recommendations will appear after both topic and experience level are provided.");
		return;
	}

	if (conversationContext.topic && !conversationContext.experience) {
		conversationContext.awaitingExperience = true;
		appendMessage("assistant", "Would you describe your current knowledge as beginner, intermediate, or advanced?");
		setStatus("Waiting for experience level before generating recommendations.");
		clearRecommendations("Recommendations will appear after both topic and experience level are provided.");
		return;
	}

	if (!conversationContext.topic || !conversationContext.experience) {
		setStatus("Please share a topic and experience level to continue.");
		clearRecommendations("Recommendations will appear after both topic and experience level are provided.");
		return;
	}

	const candidates = buildCandidateList();
	const recommendationResult = pickRecommendations(candidates);
	renderRecommendations(recommendationResult);
	appendMessage("assistant", buildAssistantReply(recommendationResult));
	setStatus(`${recommendationResult.currentLevel.length} direct recommendation${recommendationResult.currentLevel.length === 1 ? "" : "s"} updated.`);
};

assistantForm.addEventListener("submit", (event) => {
	event.preventDefault();

	const message = assistantInput.value.trim();
	if (!message) {
		setStatus("Please enter a message before sending.");
		return;
	}

	appendMessage("user", message);
	assistantInput.value = "";
	setStatus("Generating recommendations...");
	handleMessage(message);
});

promptButtons.forEach((button) => {
	button.addEventListener("click", () => {
		const prompt = button.dataset.prompt || "";
		assistantInput.value = prompt;
		assistantInput.focus();
		setStatus("Suggested prompt added to the message box.");
	});
});

if (assistantReset) {
	assistantReset.addEventListener("click", resetAssistant);
}

const loadCourses = async () => {
	try {
		const response = await fetch("./courses.json");
		if (!response.ok) {
			throw new Error(`Request failed with status ${response.status}`);
		}

		const data = await response.json();
		if (!Array.isArray(data)) {
			throw new Error("courses.json is not an array");
		}

		courses = data;
		setStatus("Course catalog loaded. Ask the assistant to get recommendations.");
	} catch (error) {
		setStatus("Unable to load course catalog. Please refresh and verify courses.json.");
		appendMessage("assistant", "I could not load the course catalog right now. Please verify courses.json and reload the page.");
	}
};

loadCourses();
