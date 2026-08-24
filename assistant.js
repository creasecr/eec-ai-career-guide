const assistantMessages = document.getElementById("assistantMessages");
const assistantForm = document.getElementById("assistantForm");
const assistantInput = document.getElementById("assistantInput");
const assistantStatus = document.getElementById("assistantStatus");
const recommendationArea = document.getElementById("assistantRecommendations");
const assistantReset = document.getElementById("assistantReset");

const initialAssistantGreeting =
	"Hello. I can help you explore EEC classes and build a learning path. Tell me what you are hoping to learn or accomplish.";
const initialRecommendationMessage = "Recommendations will appear after you send a message.";

const suggestedPrompts = [
	"I am new to building electrification and would like beginner-level classes.",
	"I am an HVAC professional looking for intermediate-level HVAC/R training.",
	"I work in agriculture and want beginner-level courses related to irrigation and energy efficiency.",
	"I am a building professional looking for continuing education opportunities in energy codes and standards."
];

const experienceQuickReplies = ["Beginner", "Intermediate", "Advanced"];

const continuingEducationTopicReplies = [
	"Energy Codes & Standards",
	"Building Performance",
	"HVAC/R",
	"Electrification & Decarbonization",
	"Lighting",
	"Agriculture & Irrigation"
];

const topicQuickReplies = [
	"Electrification & Decarbonization",
	"HVAC/R",
	"Energy Codes & Standards",
	"Building Performance",
	"Agriculture & Irrigation",
	"Foodservice",
	"Lighting",
	"Industrial Automation"
];

const suggestedPromptContainer = document.querySelector(".prompt-list");

let courses = [];
let activeQuickReplyButtons = [];

const conversationState = {
	topic: null,
	subtopic: null,
	experienceLevel: null,
	audience: null,
	learningGoal: null
};

const interactionState = {
	latestUserMessage: ""
};

const levelRank = {
	beginner: 1,
	intermediate: 2,
	advanced: 3
};

const topicRules = [
	{
		label: "Electrification & Decarbonization",
		topicAliases: ["electrification & decarbonization", "electrification", "decarbonization"],
		titleTerms: ["electrification", "decarbonization", "heat pump", "electric", "emissions reduction"],
		searchKeywords: ["electrification", "decarbonization", "heat pump", "electric", "emissions reduction"]
	},
	{
		label: "HVAC/R",
		topicAliases: ["hvac/r", "hvac", "refrigeration"],
		titleTerms: [
			"hvac",
			"refrigeration",
			"chiller",
			"air conditioning",
			"heat pump retrofit",
			"duct",
			"ventilation",
			"air balancing",
			"hydronic",
			"hvac controls"
		],
		searchKeywords: [
			"hvac",
			"refrigeration",
			"chiller",
			"air conditioning",
			"heat pump retrofit",
			"duct",
			"ventilation",
			"air balancing",
			"hydronic",
			"hvac controls"
		]
	},
	{
		label: "Energy Codes & Standards",
		topicAliases: ["energy codes & standards", "energy code", "title 24", "building codes", "calgreen", "cbecc", "energypro"],
		titleTerms: ["energy code", "energy codes", "standards", "title 24", "calgreen", "cbecc", "energypro", "code compliance"],
		searchKeywords: ["energy code", "energy codes", "standards", "title 24", "calgreen", "cbecc", "energypro", "code compliance"]
	},
	{
		label: "Building Performance",
		topicAliases: ["building performance", "energy efficiency & building operations"],
		titleTerms: ["building performance", "building operations", "benchmarking", "boc"],
		searchKeywords: ["building performance", "building operations", "benchmarking", "boc"]
	},
	{
		label: "Agriculture & Irrigation",
		topicAliases: ["agriculture, pumps & irrigation", "agriculture & irrigation", "agriculture", "irrigation"],
		titleTerms: ["agriculture", "agricultural", "farm", "irrigation", "pump", "pumping", "groundwater", "water efficiency"],
		searchKeywords: ["agriculture", "agricultural", "farm", "irrigation", "pump", "pumping", "groundwater", "water efficiency"]
	},
	{
		label: "Foodservice",
		topicAliases: ["foodservice"],
		titleTerms: ["foodservice", "kitchen", "culinary"],
		searchKeywords: ["foodservice", "kitchen", "culinary"]
	},
	{
		label: "Lighting",
		topicAliases: ["lighting"],
		titleTerms: ["lighting", "daylighting", "luminaire"],
		searchKeywords: ["lighting", "daylighting", "luminaire"]
	},
	{
		label: "Industrial Automation",
		topicAliases: ["industrial automation", "energy processes & technology"],
		titleTerms: ["industrial", "automation", "plc", "manufacturing", "robotics", "industrial controls"],
		searchKeywords: ["industrial", "automation", "plc", "manufacturing", "robotics", "industrial controls"]
	}
];

const topicPhraseRules = [
	{ phrase: "energy codes and standards", topic: "Energy Codes & Standards" },
	{ phrase: "energy codes & standards", topic: "Energy Codes & Standards" },
	{ phrase: "agricultural energy efficiency", topic: "Agriculture & Irrigation" },
	{ phrase: "energy solutions for agriculture", topic: "Agriculture & Irrigation" },
	{ phrase: "agricultural energy solutions", topic: "Agriculture & Irrigation" },
	{ phrase: "building decarbonization", topic: "Electrification & Decarbonization", subtopic: "Building Electrification" },
	{ phrase: "facilities electrification", topic: "Electrification & Decarbonization", subtopic: "Building Electrification" },
	{ phrase: "facility electrification", topic: "Electrification & Decarbonization", subtopic: "Building Electrification" },
	{ phrase: "all-electric building", topic: "Electrification & Decarbonization", subtopic: "Building Electrification" },
	{ phrase: "electric building", topic: "Electrification & Decarbonization", subtopic: "Building Electrification" },
	{ phrase: "building electrification", topic: "Electrification & Decarbonization", subtopic: "Building Electrification" },
	{ phrase: "heat pump retrofit", topic: "HVAC/R" },
	{ phrase: "code compliance", topic: "Energy Codes & Standards" },
	{ phrase: "building codes", topic: "Energy Codes & Standards" },
	{ phrase: "energy standards", topic: "Energy Codes & Standards" },
	{ phrase: "agricultural customer", topic: "Agriculture & Irrigation" },
	{ phrase: "irrigation systems", topic: "Agriculture & Irrigation" },
	{ phrase: "crop irrigation", topic: "Agriculture & Irrigation" },
	{ phrase: "water efficiency", topic: "Agriculture & Irrigation" },
	{ phrase: "hvac professional", topic: "HVAC/R" },
	{ phrase: "hvac controls", topic: "HVAC/R" },
	{ phrase: "air conditioning", topic: "HVAC/R" },
	{ phrase: "air balancing", topic: "HVAC/R" },
	{ phrase: "groundwater", topic: "Agriculture & Irrigation" },
	{ phrase: "building performance", topic: "Building Performance" },
	{ phrase: "industrial automation", topic: "Industrial Automation" },
	{ phrase: "electrification", topic: "Electrification & Decarbonization" },
	{ phrase: "decarbonization", topic: "Electrification & Decarbonization" },
	{ phrase: "emissions reduction", topic: "Electrification & Decarbonization" },
	{ phrase: "heat pump", topic: "Electrification & Decarbonization" },
	{ phrase: "hvac/r", topic: "HVAC/R" },
	{ phrase: "hvac", topic: "HVAC/R" },
	{ phrase: "refrigeration", topic: "HVAC/R" },
	{ phrase: "chiller", topic: "HVAC/R" },
	{ phrase: "duct", topic: "HVAC/R" },
	{ phrase: "ventilation", topic: "HVAC/R" },
	{ phrase: "hydronic", topic: "HVAC/R" },
	{ phrase: "agriculture", topic: "Agriculture & Irrigation" },
	{ phrase: "agricultural", topic: "Agriculture & Irrigation" },
	{ phrase: "farming", topic: "Agriculture & Irrigation" },
	{ phrase: "farm", topic: "Agriculture & Irrigation" },
	{ phrase: "irrigation", topic: "Agriculture & Irrigation" },
	{ phrase: "pumping", topic: "Agriculture & Irrigation" },
	{ phrase: "pumps", topic: "Agriculture & Irrigation" },
	{ phrase: "pump", topic: "Agriculture & Irrigation" },
	{ phrase: "energy codes", topic: "Energy Codes & Standards" },
	{ phrase: "title 24", topic: "Energy Codes & Standards" },
	{ phrase: "calgreen", topic: "Energy Codes & Standards" },
	{ phrase: "energypro", topic: "Energy Codes & Standards" },
	{ phrase: "cbecc", topic: "Energy Codes & Standards" },
	{ phrase: "lighting", topic: "Lighting" },
	{ phrase: "foodservice", topic: "Foodservice" }
].sort((a, b) => b.phrase.length - a.phrase.length);

const audiencePhraseRules = [
	{ phrase: "hvac professional", audience: "HVAC Professional" },
	{ phrase: "building professional", audience: "Building Professional" },
	{ phrase: "i work in agriculture", audience: "Agricultural Customer" },
	{ phrase: "agricultural customer", audience: "Agricultural Customer" },
	{ phrase: "agriculture", audience: "Agricultural Customer" },
	{ phrase: "farmer", audience: "Agricultural Customer" }
].sort((a, b) => b.phrase.length - a.phrase.length);

const ceLearningGoalTerms = [
	"continuing education",
	"continued education",
	"ceu",
	"ceus",
	"professional credits",
	"learning units",
	"aia credits",
	"icc credits",
	"certification credits"
];

const cePriorityTerms = ["ceu", "ceus", "aia", "icc", "learning unit", "learning units", "professional credits", "certification credits"];

const hvacTitleTerms = ["hvac", "refrigeration", "chiller", "air conditioning", "heat pump retrofit", "duct", "ventilation", "air balancing", "hydronic", "hvac controls"];
const industrialIntentTerms = ["automation", "plc", "manufacturing", "industrial controls", "robotics", "industrial"];
const beginnerIntentTerms = ["beginner", "new", "basics", "fundamentals", "introduction", "introductory", "getting started", "start"];
const foundationalBonusRules = [
	{ term: "fundamentals", points: 8 },
	{ term: "introduction", points: 7 },
	{ term: "introductory", points: 7 },
	{ term: "101", points: 6 },
	{ term: "basics", points: 6 }
];

const deliveryLabelPattern = /\((?:\s*(?:via\s+zoom|webinar|adobe\s+connect|zoom|microsoft\s+teams|virtual|in[\s-]?person|online(?:\s*-\s*webinar)?)\s*)\)/gi;

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
		text = text.replace(/\bday\s*\d+\s*of\s*\d+\b/g, " ").replace(/\bpart\s*\d+\b/g, " ");
	}

	return text.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
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

const getSubjectKeyFromTitle = (title) => {
	return normalizeComparableTitle(title, { stripSeriesMarkers: true })
		.replace(/\b(certification|program|module|course|courses|training|workshop|day)\b/g, " ")
		.replace(/\s+/g, " ")
		.trim();
};

const getUserIntentText = () => normalizeText(`${interactionState.latestUserMessage} ${conversationState.learningGoal || ""}`);

const isBeginnerIntent = () => {
	if (normalizeText(conversationState.experienceLevel) === "beginner") {
		return true;
	}
	return includesAny(getUserIntentText(), beginnerIntentTerms);
};

const setStatus = (message) => {
	assistantStatus.textContent = message;
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

const resetConversationState = () => {
	conversationState.topic = null;
	conversationState.subtopic = null;
	conversationState.experienceLevel = null;
	conversationState.audience = null;
	conversationState.learningGoal = null;
	interactionState.latestUserMessage = "";
};

const snapshotConversationState = () => JSON.stringify(conversationState);

const renderWhatIUnderstood = () => {
	const items = [];
	if (conversationState.audience) {
		items.push(`Role or audience: ${conversationState.audience}`);
	}
	if (conversationState.topic) {
		items.push(`Topic or interest: ${conversationState.topic}`);
	}
	if (conversationState.subtopic) {
		items.push(`Subtopic: ${conversationState.subtopic}`);
	}
	if (conversationState.experienceLevel) {
		items.push(`Experience level: ${conversationState.experienceLevel}`);
	}
	if (conversationState.learningGoal) {
		items.push(`Learning goal: ${conversationState.learningGoal}`);
	}

	if (!items.length) {
		return;
	}

	appendAssistantMessage((article) => {
		const heading = document.createElement("p");
		heading.style.margin = "0 0 0.35rem";
		heading.style.fontWeight = "700";
		heading.textContent = "What I understood";
		article.appendChild(heading);

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

const clearActiveQuickReplies = () => {
	activeQuickReplyButtons = [];
};

const setButtonsDisabled = (buttons, disabled) => {
	buttons.forEach((button) => {
		button.disabled = disabled;
	});
};

const detectTopicAndSubtopic = (message) => {
	const normalized = normalizeText(message);
	for (const rule of topicPhraseRules) {
		if (normalized.includes(rule.phrase)) {
			return {
				topic: rule.topic,
				subtopic: rule.subtopic || null
			};
		}
	}
	return { topic: null, subtopic: null };
};

const detectAudience = (message) => {
	const normalized = normalizeText(message);
	for (const rule of audiencePhraseRules) {
		if (normalized.includes(rule.phrase)) {
			return rule.audience;
		}
	}
	return null;
};

const detectExperienceLevel = (message) => {
	const normalized = normalizeText(message);
	if (/^\s*(beginner|intermediate|advanced)\s*$/i.test(message)) {
		return normalized.charAt(0).toUpperCase() + normalized.slice(1);
	}
	if (/\bbeginner\b|\bbeginner-level\b|\bnew\b|\bintro\b|\bintroduction\b|\bintroductory\b|\bbasics\b|\bfundamentals\b/.test(normalized)) {
		return "Beginner";
	}
	if (/\bintermediate\b|\bintermediate-level\b|\bsome experience\b|\bmid\b/.test(normalized)) {
		return "Intermediate";
	}
	if (/\badvanced\b|\badvanced-level\b|\bexpert\b|\bexperienced\b/.test(normalized)) {
		return "Advanced";
	}
	return null;
};

const detectLearningGoal = (message) => {
	const normalized = normalizeText(message);
	if (includesAny(normalized, ceLearningGoalTerms)) {
		return "Continuing Education";
	}
	if (normalized.includes("irrigation") && normalized.includes("energy efficiency")) {
		return "Irrigation and energy efficiency";
	}
	if (normalized.includes("beginner-level classes") || normalized.includes("foundational") || normalized.includes("fundamentals")) {
		return "Foundational learning";
	}
	if (normalized.includes("training")) {
		return "Professional training";
	}
	if (normalized.includes("would like beginner-level classes")) {
		return "Foundational learning";
	}
	return null;
};

const shouldForceIntermediateForPrompt = (message) => normalizeText(message) === normalizeText(suggestedPrompts[3]);

const updateStateFromMessage = (message, options = {}) => {
	const { source = "user" } = options;
	interactionState.latestUserMessage = message;

	if (source === "experienceQuickReply") {
		conversationState.experienceLevel = detectExperienceLevel(message);
		return;
	}

	if (source === "topicQuickReply") {
		const detected = detectTopicAndSubtopic(message);
		if (detected.topic) {
			conversationState.topic = detected.topic;
			conversationState.subtopic = detected.subtopic;
		}
		return;
	}

	if (/^\s*(beginner|intermediate|advanced)\s*$/i.test(message)) {
		conversationState.experienceLevel = detectExperienceLevel(message);
		return;
	}

	const detectedTopic = detectTopicAndSubtopic(message);
	const detectedAudience = detectAudience(message);
	const detectedExperience = detectExperienceLevel(message);
	const detectedGoal = detectLearningGoal(message);

	if (detectedTopic.topic) {
		conversationState.topic = detectedTopic.topic;
		conversationState.subtopic = detectedTopic.subtopic;
	}
	if (detectedAudience) {
		conversationState.audience = detectedAudience;
	}
	if (detectedExperience) {
		conversationState.experienceLevel = detectedExperience;
	}
	if (detectedGoal) {
		conversationState.learningGoal = detectedGoal;
	}

	if (!detectedTopic.topic && conversationState.topic !== "Electrification & Decarbonization") {
		conversationState.subtopic = null;
	}

	if (shouldForceIntermediateForPrompt(message)) {
		conversationState.experienceLevel = "Intermediate";
	}
};

const appendQuickReplyQuestion = (question, options, type) => {
	appendAssistantMessage((article) => {
		const prompt = document.createElement("p");
		prompt.style.margin = "0 0 0.55rem";
		prompt.textContent = question;
		article.appendChild(prompt);

		const wrapper = document.createElement("div");
		wrapper.style.display = "grid";
		wrapper.style.gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
		wrapper.style.gap = "0.45rem";

		const localButtons = [];
		options.forEach((value) => {
			const button = document.createElement("button");
			button.type = "button";
			button.className = "prompt-chip";
			button.textContent = value;
			button.addEventListener("click", () => {
				if (button.disabled) {
					return;
				}
				setButtonsDisabled(localButtons, true);
				clearActiveQuickReplies();
				submitUserMessage(value, { source: type });
			});
			localButtons.push(button);
			wrapper.appendChild(button);
		});

		activeQuickReplyButtons = localButtons;
		article.appendChild(wrapper);
	});
};

const hasContinuingEducationGoalWithoutTopic = () => {
	return conversationState.learningGoal === "Continuing Education" && !conversationState.topic;
};

const getActiveTopicRule = () => topicRules.find((rule) => rule.label === conversationState.topic) || null;

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

	const exactTopicMatch = topics.some((topicValue) => topicRule.topicAliases.some((alias) => topicValue === normalizeText(alias)));
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
			const allowIndustrial = includesAny(getUserIntentText(), industrialIntentTerms);
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

const getFoundationalBonus = (titleText) => {
	let points = 0;
	foundationalBonusRules.forEach((rule) => {
		if (titleText.includes(rule.term)) {
			points += rule.points;
		}
	});
	return points;
};

const getContinuingEducationPriority = (course) => {
	if (conversationState.learningGoal !== "Continuing Education") {
		return 0;
	}

	const learningUnits = normalizeText(course.learningUnits);
	if (!learningUnits) {
		return 0;
	}

	let score = 10;
	if (includesAny(learningUnits, cePriorityTerms)) {
		score += 8;
	}
	return score;
};

const courseMatchesAudience = (course) => {
	if (!conversationState.audience) {
		return false;
	}

	return normalizeArray(course.audiences).some((audience) => normalizeText(audience) === normalizeText(conversationState.audience));
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

	const cePriority = getContinuingEducationPriority(course);
	topicScore += cePriority;

	const selectedRank = levelValue(conversationState.experienceLevel);
	const courseRank = levelValue(course.experienceLevel);
	const levelMatch = courseRank === selectedRank;
	const isNextStep = courseRank === Math.min(3, selectedRank + 1);
	const audienceMatch = courseMatchesAudience(course);
	const foundationalScore = isBeginnerIntent() ? getFoundationalBonus(normalizeComparableTitle(course.title)) : 0;

	return {
		topicRelevant: true,
		topicScore,
		cePriority,
		foundationalScore,
		audienceMatch,
		isLevelMatch: levelMatch,
		isNextStep,
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
	if (b.cePriority !== a.cePriority) {
		return b.cePriority - a.cePriority;
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
		.filter((course) => !normalizeText(course.status).startsWith("hold"))
		.map((course) => {
			const scoredData = scoreCourse(course, topicRule);
			return {
				course,
				normalizedTitle: normalizeComparableTitle(course.title),
				seriesKey: normalizeComparableTitle(course.title, { stripSeriesMarkers: true }),
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
		if (item.startMs < existing.startMs || (item.startMs === existing.startMs && compareCandidateRank(item, existing) < 0)) {
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

		seriesCollapsed.push({
			seriesKey,
			subjectKey: top.subjectKey,
			course: top.course,
			startMs: top.startMs,
			topicScore: top.topicScore,
			cePriority: top.cePriority,
			foundationalScore: top.foundationalScore,
			audienceMatch: top.audienceMatch,
			isLevelMatch: top.isLevelMatch,
			isNextStep: top.isNextStep,
			courseRank: top.courseRank,
			reasons: [],
			seriesItems: uniqueParts,
			isSeries: uniqueParts.length > 1,
			seriesName,
			hasDistinctPartUrls: allPartUrls.length === uniqueParts.length && new Set(allPartUrls).size === uniqueParts.length,
			seriesExperienceLevel:
				new Set(uniqueParts.map((part) => normalizeText(part.course.experienceLevel)).filter(Boolean)).size === 1
					? uniqueParts[0].course.experienceLevel
					: "",
			seriesDeliveryType:
				new Set(uniqueParts.map((part) => normalizeText(part.course.deliveryType)).filter(Boolean)).size === 1
					? uniqueParts[0].course.deliveryType
					: ""
		});
	});

	return seriesCollapsed.sort(compareCandidateRank);
};

const buildReasonsForRecommendation = (candidate) => {
	const topicReason = `Matches your ${conversationState.topic} interest`;
	const selectedRank = levelValue(conversationState.experienceLevel);
	const courseLevel = candidate.course.experienceLevel || "this";
	const reasons = [];

	if (candidate.isLevelMatch) {
		reasons.push(topicReason);
		reasons.push(`Matches your ${conversationState.experienceLevel} experience level`);
	} else if (selectedRank === 1 && candidate.courseRank === 2) {
		reasons.push(topicReason);
		reasons.push("Intermediate next-step course");
		reasons.push("Consider after completing foundational learning");
	} else if (selectedRank === 1 && candidate.courseRank === 3) {
		reasons.push(topicReason);
		reasons.push("Advanced follow-on course");
		reasons.push("Consider after completing foundational learning");
	} else if (candidate.isNextStep) {
		reasons.push(topicReason);
		reasons.push(`${courseLevel} next-step course`);
		reasons.push("Consider after completing foundational learning");
	} else {
		reasons.push(topicReason);
		reasons.push(`${courseLevel} follow-on course`);
	}

	if (conversationState.learningGoal === "Continuing Education" && normalizeText(candidate.course.learningUnits)) {
		reasons.push("Includes documented learning units");
	}

	return reasons;
};

const pickRecommendations = (candidates) => {
	if (!candidates.length) {
		return {
			currentLevel: [],
			nextSteps: []
		};
	}

	const selectedRank = levelValue(conversationState.experienceLevel);
	let pool = [...candidates].sort(compareCandidateRank);

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

	const currentLevel = takeUnique(currentBucket, 3);
	const maxNext = Math.max(0, 3 - currentLevel.length);
	const nextSteps = [...takeUnique(nextBucket, maxNext), ...takeUnique(otherBucket, Math.max(0, maxNext - nextBucket.length))].slice(0, maxNext);

	return {
		currentLevel,
		nextSteps
	};
};

const addLearningUnitsIfNeeded = (container, course) => {
	if (conversationState.learningGoal !== "Continuing Education") {
		return;
	}
	const learningUnits = String(course.learningUnits || "").trim();
	if (!learningUnits) {
		return;
	}

	const units = document.createElement("p");
	units.className = "course-description";
	units.textContent = `Learning Units: ${learningUnits}`;
	container.appendChild(units);
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

	card.append(title, category, metaRow);
	addLearningUnitsIfNeeded(card, course);
	card.append(why, action);
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
		let titleText = entry.course.title;
		if (conversationState.learningGoal === "Continuing Education" && String(entry.course.learningUnits || "").trim()) {
			titleText += ` (${entry.course.learningUnits})`;
		}
		text.textContent = titleText;
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
	if (conversationState.topic === "HVAC/R" && normalizeText(conversationState.experienceLevel) === "beginner" && hasIntermediateNext) {
		return "I did not find a Beginner-level HVAC/R offering in the current class schedule. I found Intermediate courses that may be useful next steps after foundational learning.";
	}
	return `I did not find a ${conversationState.experienceLevel}-level ${conversationState.topic} offering in the current class schedule.`;
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
	appendRecommendationSection("Suggested Next Steps", result.nextSteps);
};

const buildAssistantReply = (result) => {
	const directCount = result.currentLevel.length;
	const hasNext = result.nextSteps.length > 0;
	const topic = conversationState.topic;
	const level = conversationState.experienceLevel;
	const hasIntermediateNext = result.nextSteps.some((entry) => levelValue(entry.item.course.experienceLevel) === 2);

	if (topic === "HVAC/R" && normalizeText(level) === "beginner" && directCount === 0 && hasIntermediateNext) {
		return "I did not find a Beginner-level HVAC/R offering in the current class schedule. I found Intermediate courses that may be useful next steps after foundational learning.";
	}

	if (directCount === 1) {
		return `I found 1 course that matches your ${topic} interest and ${level} experience, plus additional next-step options.`;
	}
	if (directCount >= 2) {
		if (hasNext) {
			return `I found ${directCount} courses that match your ${topic} interest and ${level} experience, plus additional next-step options.`;
		}
		return `I found ${directCount} courses that match your ${topic} interest and ${level} experience.`;
	}
	if (hasNext) {
		return `I did not find a ${level}-level ${topic} offering in the current class schedule. I found next-step options that may be useful after foundational learning.`;
	}
	return `I did not find a ${level}-level ${topic} offering in the current class schedule.`;
};

const requestExperienceLevel = () => {
	appendQuickReplyQuestion(
		"Would you describe your current knowledge as beginner, intermediate, or advanced?",
		experienceQuickReplies,
		"experienceQuickReply"
	);
	setStatus("Waiting for experience level.");
	clearRecommendations("Recommendations will appear after both topic and experience level are provided.");
};

const requestTopicForContinuingEducation = () => {
	appendQuickReplyQuestion(
		"What topic would you like continuing education opportunities in?",
		continuingEducationTopicReplies,
		"topicQuickReply"
	);
	setStatus("Waiting for topic selection.");
	clearRecommendations("Recommendations will appear after both topic and experience level are provided.");
};

const requestTopic = () => {
	appendQuickReplyQuestion(
		"Which area are you interested in learning about?",
		topicQuickReplies,
		"topicQuickReply"
	);
	setStatus("Waiting for topic selection.");
	clearRecommendations("Recommendations will appear after both topic and experience level are provided.");
};

const maybeRenderWhatIUnderstood = (beforeSnapshot) => {
	if (beforeSnapshot !== snapshotConversationState()) {
		renderWhatIUnderstood();
	}
};

const processConversation = () => {
	if (!conversationState.topic && conversationState.learningGoal === "Continuing Education") {
		requestTopicForContinuingEducation();
		return;
	}

	if (conversationState.topic && !conversationState.experienceLevel) {
		requestExperienceLevel();
		return;
	}

	if (!conversationState.topic && conversationState.experienceLevel) {
		requestTopic();
		return;
	}

	if (!conversationState.topic && !conversationState.experienceLevel) {
		requestTopic();
		return;
	}

	clearActiveQuickReplies();
	const candidates = buildCandidateList();
	const recommendationResult = pickRecommendations(candidates);
	renderRecommendations(recommendationResult);
	appendMessage("assistant", buildAssistantReply(recommendationResult));
	setStatus(`${recommendationResult.currentLevel.length} direct recommendation${recommendationResult.currentLevel.length === 1 ? "" : "s"} updated.`);
};

const submitUserMessage = (message, options = {}) => {
	if (!courses.length) {
		appendMessage("assistant", "Course data is still loading. Please try again in a moment.");
		setStatus("Course data is still loading.");
		return;
	}

	appendMessage("user", message);
	const beforeSnapshot = snapshotConversationState();
	updateStateFromMessage(message, options);
	maybeRenderWhatIUnderstood(beforeSnapshot);
	setStatus("Generating recommendations...");
	processConversation();
};

const resetSuggestedPrompts = () => {
	if (!suggestedPromptContainer) {
		return;
	}
	const buttons = Array.from(suggestedPromptContainer.querySelectorAll(".prompt-chip"));
	buttons.forEach((button, index) => {
		button.textContent = suggestedPrompts[index] || "";
		button.dataset.prompt = suggestedPrompts[index] || "";
		button.disabled = false;
	});
};

const resetAssistant = () => {
	resetConversationState();
	assistantMessages.innerHTML = "";
	appendMessage("assistant", initialAssistantGreeting);
	clearRecommendations(initialRecommendationMessage);
	clearActiveQuickReplies();
	resetSuggestedPrompts();
	assistantInput.value = "";
	setStatus("");
	assistantInput.focus();
};

assistantForm.addEventListener("submit", (event) => {
	event.preventDefault();
	const message = assistantInput.value.trim();
	if (!message) {
		setStatus("Please enter a message before sending.");
		return;
	}
	assistantInput.value = "";
	submitUserMessage(message, { source: "user" });
});

const bindSuggestedPromptButtons = () => {
	const buttons = Array.from(document.querySelectorAll(".prompt-list .prompt-chip"));
	buttons.forEach((button, index) => {
		button.addEventListener("click", () => {
			if (button.disabled) {
				return;
			}
			setButtonsDisabled(buttons, true);
			const prompt = button.dataset.prompt || button.textContent || suggestedPrompts[index];
			submitUserMessage(prompt, { source: "suggestedPrompt" });
			window.setTimeout(() => {
				setButtonsDisabled(buttons, false);
			}, 350);
		});
	});
};

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

bindSuggestedPromptButtons();
loadCourses();
