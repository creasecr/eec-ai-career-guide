/**
 * EEC AI Career Pathway Guide
 * ---------------------------
 * Vanilla JavaScript conversational guide that collects a learner profile,
 * scores the EEC course catalog and renders a beginner -> advanced pathway.
 *
 * The conversation is driven by `AIService`, an abstraction with a local
 * rule-based provider today and a prepared (but inactive) OpenAI provider so a
 * hosted model can be dropped in later without touching the UI layer.
 */
(function () {
  "use strict";

  var CATALOG_URL = "courses.json";
  var LEVEL_ORDER = ["beginner", "intermediate", "advanced"];

  /* ------------------------------------------------------------------ *
   * Conversation script
   * ------------------------------------------------------------------ */

  var STEPS = [
    {
      id: "interest",
      taxonomy: "interests",
      multiple: true,
      question:
        "Welcome to the Energy Education Center. I'm your AI career pathway guide.\n\nTo get started, which part of the energy industry interests you most?",
      synonyms: {
        electrical: ["electric", "electrical", "power", "grid", "lineworker", "distribution", "wiring"],
        renewables: ["renewable", "solar", "wind", "battery", "storage", "pv", "clean energy", "green"],
        efficiency: ["efficiency", "efficient", "building", "hvac", "weatherization", "audit", "retrofit"],
        safety: ["safety", "safe", "compliance", "osha", "nfpa", "arc flash", "regulation"],
        data: ["data", "analytics", "ai", "machine learning", "software", "metering", "reporting"],
        leadership: ["leadership", "management", "manager", "project", "supervisor", "program"]
      }
    },
    {
      id: "level",
      taxonomy: "levels",
      question: "Great choice. How would you describe your current experience level?",
      synonyms: {
        beginner: ["beginner", "new", "none", "entry", "student", "starting", "no experience"],
        intermediate: ["intermediate", "some experience", "few years", "mid", "2 years", "3 years", "5 years"],
        advanced: ["advanced", "senior", "expert", "specialist", "lead", "many years", "decade"]
      }
    },
    {
      id: "industry",
      taxonomy: "industries",
      question: "Which industry are you working in (or hoping to work in)?",
      synonyms: {
        utility: ["utility", "utilities", "electric company", "gas company", "grid operator", "co-op"],
        construction: ["construction", "trade", "trades", "contractor", "electrician", "field", "installer"],
        commercial: ["commercial", "industrial", "facility", "facilities", "manufacturing", "plant"],
        public: ["government", "city", "municipal", "school", "education", "non-profit", "nonprofit", "public"],
        other: ["other", "not sure", "exploring", "unsure", "none"]
      }
    },
    {
      id: "goal",
      taxonomy: "goals",
      question: "What's your main learning goal right now?",
      synonyms: {
        "career-change": ["career change", "start", "new career", "break into", "switch", "get a job"],
        certification: ["certification", "certificate", "certified", "credential", "license", "exam"],
        upskill: ["upskill", "improve", "current role", "skills", "grow", "better at"],
        leadership: ["leadership", "lead", "manage", "management", "supervisor", "promotion"]
      }
    },
    {
      id: "format",
      taxonomy: "formats",
      question: "Last question - do you prefer online or in-person classes?",
      synonyms: {
        online: ["online", "virtual", "remote", "self paced", "self-paced", "web"],
        "in-person": ["in person", "in-person", "onsite", "on-site", "classroom", "hands on", "hands-on", "campus"],
        either: ["either", "both", "any", "no preference", "doesn't matter", "does not matter", "flexible"]
      }
    }
  ];

  /* ------------------------------------------------------------------ *
   * Recommendation engine (pure functions - easy to unit test)
   * ------------------------------------------------------------------ */

  var RecommendationEngine = {
    /**
     * Scores a single course against the collected learner profile.
     * @returns {{score:number, reasons:string[]}}
     */
    scoreCourse: function (course, profile) {
      var score = 0;
      var reasons = [];
      var interests = profile.interest || [];

      var matchedInterests = interests.filter(function (interest) {
        return course.interests.indexOf(interest) !== -1;
      });
      if (matchedInterests.length) {
        score += 4 * matchedInterests.length;
        reasons.push("matches your interest area");
      }

      if (profile.industry && course.industries.indexOf(profile.industry) !== -1) {
        score += 2;
        reasons.push("used in your industry");
      }

      if (profile.goal && course.goals.indexOf(profile.goal) !== -1) {
        score += 3;
        reasons.push("supports your goal");
      }

      if (profile.format && profile.format !== "either") {
        if (course.formats.indexOf(profile.format) !== -1) {
          score += 3;
          reasons.push("available " + profile.format);
        } else {
          score -= 4;
        }
      }

      var learnerLevel = LEVEL_ORDER.indexOf(profile.level);
      var courseLevel = LEVEL_ORDER.indexOf(course.level);
      if (learnerLevel !== -1 && courseLevel !== -1) {
        var distance = courseLevel - learnerLevel;
        if (distance === 0) {
          score += 3;
          reasons.push("fits your experience level");
        } else if (distance === 1) {
          score += 2;
          reasons.push("a natural next step");
        } else if (distance < 0) {
          score += 0.5;
        } else {
          score -= 1;
        }
      }

      return { score: score, reasons: reasons };
    },

    /**
     * Ranks the catalog and builds a beginner -> advanced pathway.
     */
    recommend: function (catalog, profile, limit) {
      var scored = catalog.courses
        .map(function (course) {
          var result = RecommendationEngine.scoreCourse(course, profile);
          return { course: course, score: result.score, reasons: result.reasons };
        })
        .filter(function (entry) {
          return entry.score > 0;
        })
        .sort(function (a, b) {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return LEVEL_ORDER.indexOf(a.course.level) - LEVEL_ORDER.indexOf(b.course.level);
        });

      var top = scored.slice(0, limit || 3);
      return { recommended: top, pathway: RecommendationEngine.buildPathway(catalog, scored) };
    },

    /**
     * Picks the best-scoring course at each level, adding prerequisites so the
     * pathway always reads beginner -> intermediate -> advanced.
     */
    buildPathway: function (catalog, scored) {
      var byId = {};
      catalog.courses.forEach(function (course) {
        byId[course.id] = course;
      });

      var pathway = [];
      var seen = {};

      var add = function (course) {
        if (!course || seen[course.id]) {
          return;
        }
        seen[course.id] = true;
        (course.prerequisites || []).forEach(function (prereqId) {
          add(byId[prereqId]);
        });
        pathway.push(course);
      };

      LEVEL_ORDER.forEach(function (level) {
        var best = scored.filter(function (entry) {
          return entry.course.level === level;
        })[0];
        if (best) {
          add(best.course);
        }
      });

      return pathway.sort(function (a, b) {
        return LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level);
      });
    }
  };

  /* ------------------------------------------------------------------ *
   * Answer interpretation
   * ------------------------------------------------------------------ */

  var Interpreter = {
    /**
     * Maps free-form text (or a quick-reply label) onto taxonomy option ids.
     * @returns {string[]} matched option ids, best match first
     */
    match: function (text, options, synonyms) {
      var normalized = String(text || "").toLowerCase();
      if (!normalized.trim()) {
        return [];
      }

      var matches = [];
      options.forEach(function (option, index) {
        var terms = [option.label.toLowerCase(), option.id.toLowerCase()].concat(
          (synonyms && synonyms[option.id]) || []
        );
        var hit = terms.some(function (term) {
          return normalized.indexOf(term) !== -1;
        });
        // Allow answering with the option number, e.g. "2".
        if (!hit && normalized.trim() === String(index + 1)) {
          hit = true;
        }
        if (hit) {
          matches.push(option.id);
        }
      });
      return matches;
    }
  };

  /* ------------------------------------------------------------------ *
   * AI service abstraction (local today, OpenAI ready)
   * ------------------------------------------------------------------ */

  var AIService = {
    provider: "local",
    /**
     * OpenAI settings are intentionally empty in the browser build. A future
     * integration should call a server-side proxy that injects the API key;
     * never ship a key in client-side code.
     */
    openai: { proxyUrl: "", model: "gpt-4o-mini" },

    configureOpenAI: function (settings) {
      this.openai = Object.assign({}, this.openai, settings || {});
      this.provider = this.openai.proxyUrl ? "openai" : "local";
      return this.provider;
    },

    /**
     * Turns a learner profile + recommendations into a conversational summary.
     * @returns {Promise<string>}
     */
    summarize: function (context) {
      if (this.provider === "openai" && this.openai.proxyUrl) {
        return this.summarizeWithOpenAI(context).catch(function () {
          return LocalProvider.summarize(context);
        });
      }
      return Promise.resolve(LocalProvider.summarize(context));
    },

    /**
     * Prepared OpenAI path. Requests go to a server-side proxy so the API key
     * stays out of the browser. Falls back to the local provider on failure.
     */
    summarizeWithOpenAI: function (context) {
      var payload = {
        model: this.openai.model,
        messages: [
          {
            role: "system",
            content:
              "You are an Energy Education Center advisor. Summarize the learner profile and " +
              "explain the recommended courses and pathway in two short paragraphs."
          },
          { role: "user", content: JSON.stringify(context) }
        ]
      };

      return fetch(this.openai.proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("OpenAI proxy request failed: " + response.status);
          }
          return response.json();
        })
        .then(function (data) {
          var message = data && data.choices && data.choices[0] && data.choices[0].message;
          if (!message || !message.content) {
            throw new Error("Unexpected OpenAI response shape");
          }
          return message.content;
        });
    }
  };

  var LocalProvider = {
    summarize: function (context) {
      var profile = context.profileLabels;
      var lines = [
        "Thanks! Here's what I heard: you're interested in " +
          joinList(profile.interest) +
          ", you're at a " +
          lowerFirst(profile.level || "beginner") +
          " level in " +
          (profile.industry || "the energy industry") +
          ", your goal is to " +
          lowerFirst(profile.goal || "grow your skills") +
          ", and you prefer " +
          lowerFirst(profile.format || "either format") +
          " learning."
      ];

      if (!context.recommended.length) {
        lines.push(
          "I couldn't find a close match in the current catalog. An EEC advisor can help you " +
            "build a custom plan - try starting over with a broader interest area."
        );
        return lines.join("\n\n");
      }

      lines.push(
        "Based on the EEC catalog, I've picked " +
          context.recommended.length +
          " course" +
          (context.recommended.length === 1 ? "" : "s") +
          " for you, plus a beginner to advanced pathway you can follow at your own pace."
      );
      return lines.join("\n\n");
    }
  };

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */

  function joinList(values) {
    var list = [].concat(values || []).filter(Boolean);
    if (!list.length) {
      return "the energy field";
    }
    if (list.length === 1) {
      return list[0];
    }
    return list.slice(0, -1).join(", ") + " and " + list[list.length - 1];
  }

  function lowerFirst(text) {
    return text ? text.charAt(0).toLowerCase() + text.slice(1) : text;
  }

  function labelFor(catalog, taxonomyKey, id) {
    var options = catalog.taxonomy[taxonomyKey] || [];
    for (var i = 0; i < options.length; i++) {
      if (options[i].id === id) {
        return options[i].label;
      }
    }
    return id;
  }

  function titleCase(text) {
    return String(text || "").replace(/(^|[\s-])([a-z])/g, function (match, prefix, letter) {
      return prefix + letter.toUpperCase();
    });
  }

  /** Only allow http(s) links to be rendered as registration buttons. */
  function safeUrl(url) {
    try {
      var parsed = new URL(url, window.location.href);
      return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : null;
    } catch (error) {
      return null;
    }
  }

  /* ------------------------------------------------------------------ *
   * UI
   * ------------------------------------------------------------------ */

  var dom = {
    messages: document.getElementById("messages"),
    scroll: document.getElementById("chat-scroll"),
    quickReplies: document.getElementById("quick-replies"),
    form: document.getElementById("composer-form"),
    input: document.getElementById("composer-input"),
    send: document.getElementById("send-button"),
    restart: document.getElementById("restart-button")
  };

  var state = {
    catalog: null,
    stepIndex: 0,
    profile: {},
    busy: false,
    finished: false
  };

  function scrollToBottom() {
    dom.scroll.scrollTop = dom.scroll.scrollHeight;
  }

  function createMessage(role) {
    var item = document.createElement("li");
    item.className = "message " + role;

    var avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.textContent = role === "user" ? "You" : "EEC";
    avatar.setAttribute("aria-hidden", "true");

    var bubble = document.createElement("div");
    bubble.className = "bubble";

    item.appendChild(avatar);
    item.appendChild(bubble);
    dom.messages.appendChild(item);
    return { item: item, bubble: bubble };
  }

  function addMessage(role, text) {
    var message = createMessage(role);
    String(text)
      .split("\n\n")
      .forEach(function (paragraph) {
        var p = document.createElement("p");
        p.textContent = paragraph;
        message.bubble.appendChild(p);
      });
    scrollToBottom();
    return message;
  }

  function showTyping() {
    var message = createMessage("assistant");
    var typing = document.createElement("span");
    typing.className = "typing";
    typing.setAttribute("aria-label", "Guide is typing");
    for (var i = 0; i < 3; i++) {
      typing.appendChild(document.createElement("span"));
    }
    message.bubble.appendChild(typing);
    scrollToBottom();
    return message.item;
  }

  function assistantSay(text, delay) {
    var typingNode = showTyping();
    return new Promise(function (resolve) {
      window.setTimeout(function () {
        typingNode.remove();
        addMessage("assistant", text);
        resolve();
      }, delay === undefined ? 500 : delay);
    });
  }

  function renderQuickReplies(options) {
    dom.quickReplies.innerHTML = "";
    (options || []).forEach(function (option) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = option.label;
      chip.addEventListener("click", function () {
        handleAnswer(option.label);
      });
      dom.quickReplies.appendChild(chip);
    });
  }

  function setBusy(busy) {
    state.busy = busy;
    dom.send.disabled = busy;
    dom.input.disabled = busy;
  }

  function courseCard(course, reasons) {
    var card = document.createElement("article");
    card.className = "course-card";

    var heading = document.createElement("h3");
    heading.textContent = course.title;
    card.appendChild(heading);

    var tags = document.createElement("div");
    tags.className = "tags";
    [
      { text: titleCase(course.level), extra: "level-" + course.level },
      { text: course.durationHours + " hours" },
      { text: course.formats.map(titleCase).join(" / ") }
    ].forEach(function (tag) {
      var span = document.createElement("span");
      span.className = "tag" + (tag.extra ? " " + tag.extra : "");
      span.textContent = tag.text;
      tags.appendChild(span);
    });
    card.appendChild(tags);

    var description = document.createElement("p");
    description.textContent = course.description;
    card.appendChild(description);

    if (reasons && reasons.length) {
      var why = document.createElement("p");
      why.textContent = "Why this course: " + reasons.join(", ") + ".";
      card.appendChild(why);
    }

    var url = safeUrl(course.registrationUrl);
    if (url) {
      var link = document.createElement("a");
      link.className = "register-button";
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Register for " + course.id;
      card.appendChild(link);
    }

    return card;
  }

  function renderResults(result) {
    var message = createMessage("assistant");
    message.bubble.remove();

    var wrapper = document.createElement("div");
    wrapper.className = "results";

    var coursesSection = document.createElement("section");
    coursesSection.className = "results-section";
    var coursesHeading = document.createElement("h2");
    coursesHeading.textContent = "Recommended courses";
    var coursesHint = document.createElement("p");
    coursesHint.className = "section-hint";
    coursesHint.textContent = "Ranked by how closely they match your profile.";
    coursesSection.appendChild(coursesHeading);
    coursesSection.appendChild(coursesHint);
    result.recommended.forEach(function (entry) {
      coursesSection.appendChild(courseCard(entry.course, entry.reasons));
    });
    wrapper.appendChild(coursesSection);

    if (result.pathway.length) {
      var pathwaySection = document.createElement("section");
      pathwaySection.className = "results-section";
      var pathwayHeading = document.createElement("h2");
      pathwayHeading.textContent = "Your learning pathway";
      var pathwayHint = document.createElement("p");
      pathwayHint.className = "section-hint";
      pathwayHint.textContent = "Beginner to advanced, in the order we suggest taking them.";
      pathwaySection.appendChild(pathwayHeading);
      pathwaySection.appendChild(pathwayHint);

      var list = document.createElement("ol");
      list.className = "pathway";
      result.pathway.forEach(function (course) {
        var step = document.createElement("li");
        step.className = "pathway-step";

        var title = document.createElement("h3");
        title.textContent = course.id + " - " + course.title;
        step.appendChild(title);

        var meta = document.createElement("p");
        meta.className = "step-meta";
        meta.textContent =
          titleCase(course.level) +
          " - " +
          course.durationHours +
          " hours - " +
          course.formats.map(titleCase).join(" / ");
        step.appendChild(meta);

        var description = document.createElement("p");
        description.className = "step-meta";
        description.textContent = course.description;
        step.appendChild(description);

        var url = safeUrl(course.registrationUrl);
        if (url) {
          var link = document.createElement("a");
          link.className = "register-button";
          link.href = url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = "Register";
          link.style.marginTop = "8px";
          step.appendChild(link);
        }

        list.appendChild(step);
      });
      pathwaySection.appendChild(list);
      wrapper.appendChild(pathwaySection);
    }

    message.item.appendChild(wrapper);
    scrollToBottom();
  }

  /* ------------------------------------------------------------------ *
   * Conversation flow
   * ------------------------------------------------------------------ */

  function currentStep() {
    return STEPS[state.stepIndex];
  }

  function askCurrentStep() {
    var step = currentStep();
    if (!step) {
      return Promise.resolve();
    }
    var options = state.catalog.taxonomy[step.taxonomy] || [];
    return assistantSay(step.question).then(function () {
      renderQuickReplies(options);
    });
  }

  function handleAnswer(text) {
    if (state.busy || state.finished) {
      return;
    }
    var value = String(text || "").trim();
    if (!value) {
      return;
    }

    var step = currentStep();
    if (!step) {
      return;
    }

    addMessage("user", value);
    dom.input.value = "";
    renderQuickReplies([]);
    setBusy(true);

    var options = state.catalog.taxonomy[step.taxonomy] || [];
    var matches = Interpreter.match(value, options, step.synonyms);

    if (!matches.length) {
      assistantSay(
        "I want to make sure I get this right - could you pick one of the options below, or " +
          "describe it another way?"
      ).then(function () {
        renderQuickReplies(options);
        setBusy(false);
        dom.input.focus();
      });
      return;
    }

    state.profile[step.id] = step.multiple ? matches : matches[0];
    state.stepIndex += 1;

    if (state.stepIndex < STEPS.length) {
      askCurrentStep().then(function () {
        setBusy(false);
        dom.input.focus();
      });
    } else {
      finish();
    }
  }

  function profileLabels() {
    var catalog = state.catalog;
    return {
      interest: (state.profile.interest || []).map(function (id) {
        return labelFor(catalog, "interests", id);
      }),
      level: labelFor(catalog, "levels", state.profile.level),
      industry: labelFor(catalog, "industries", state.profile.industry),
      goal: labelFor(catalog, "goals", state.profile.goal),
      format: labelFor(catalog, "formats", state.profile.format)
    };
  }

  function finish() {
    state.finished = true;
    var result = RecommendationEngine.recommend(state.catalog, state.profile, 3);
    var context = {
      profile: state.profile,
      profileLabels: profileLabels(),
      recommended: result.recommended.map(function (entry) {
        return { id: entry.course.id, title: entry.course.title, reasons: entry.reasons };
      }),
      pathway: result.pathway.map(function (course) {
        return { id: course.id, title: course.title, level: course.level };
      })
    };

    var typingNode = showTyping();
    AIService.summarize(context)
      .then(function (summary) {
        typingNode.remove();
        addMessage("assistant", summary);
        if (result.recommended.length) {
          renderResults(result);
        }
        return assistantSay(
          "Want to explore a different direction? Select \"Start over\" above and I'll build a " +
            "new pathway for you."
        );
      })
      .then(function () {
        setBusy(false);
      });
  }

  function reset() {
    state.stepIndex = 0;
    state.profile = {};
    state.finished = false;
    dom.messages.innerHTML = "";
    renderQuickReplies([]);
    setBusy(true);
    askCurrentStep().then(function () {
      setBusy(false);
    });
  }

  /* ------------------------------------------------------------------ *
   * Bootstrap
   * ------------------------------------------------------------------ */

  dom.form.addEventListener("submit", function (event) {
    event.preventDefault();
    handleAnswer(dom.input.value);
  });

  dom.input.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleAnswer(dom.input.value);
    }
  });

  dom.input.addEventListener("input", function () {
    dom.input.style.height = "auto";
    dom.input.style.height = Math.min(dom.input.scrollHeight, 140) + "px";
  });

  dom.restart.addEventListener("click", reset);

  setBusy(true);
  fetch(CATALOG_URL)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Unable to load the course catalog (" + response.status + ")");
      }
      return response.json();
    })
    .then(function (catalog) {
      state.catalog = catalog;
      return askCurrentStep();
    })
    .then(function () {
      setBusy(false);
    })
    .catch(function (error) {
      addMessage(
        "assistant",
        "I couldn't load the course catalog right now. Please refresh the page, or serve the " +
          "site over HTTP if you opened it directly from the file system."
      );
      window.console.error(error);
    });

  // Exposed for future integrations and tests.
  window.EECCareerGuide = {
    RecommendationEngine: RecommendationEngine,
    Interpreter: Interpreter,
    AIService: AIService,
    steps: STEPS
  };
})();
