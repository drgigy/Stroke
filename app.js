const STORAGE_KEY = "rajagiri-strokecode-cases-v1";

const erStages = [
  ["arrival", "Arrival at ER"],
  ["codeStroke", "Code Stroke Activated"],
  ["neuroInformed", "Neurology Informed"],
  ["initialOrders", "Initial Orders Completed"],
  ["ctInformed", "CT Informed"],
  ["shiftToCt", "Shift to CT"]
];

const ctStages = [
  ["reachedCt", "Reached CT"],
  ["ncctStarted", "NCCT Started"],
  ["ncctCompleted", "NCCT Completed"],
  ["ctaStarted", "CTA/CTP Started"],
  ["ctaCompleted", "CTA/CTP Completed"],
  ["imagingReviewed", "Imaging Reviewed"]
];

const mtStages = [
  ["mtDecided", "Thrombectomy Decided"],
  ["cathlabInformed", "Cathlab Informed"],
  ["shiftedCathlab", "Shifted to Cathlab"],
  ["reachedCathlab", "Reached Cathlab"],
  ["cathlabReady", "Cathlab Ready"],
  ["groinPuncture", "Groin Puncture"],
  ["firstPass", "First Pass"],
  ["recanalisation", "Recanalisation Achieved"]
];

const metricDefs = [
  ["doorCt", "Door -> CT", "arrival", "reachedCt", 25, 35],
  ["doorImaging", "Door -> Imaging Review", "arrival", "imagingReviewed", 45, 60],
  ["doorIvt", "Door -> IVT Started", "arrival", "ivtStarted", 45, 60],
  ["doorCathlab", "Door -> Cathlab", "arrival", "reachedCathlab", 70, 90],
  ["doorGroin", "Door -> Groin Puncture", "arrival", "groinPuncture", 90, 120],
  ["doorRecan", "Door -> Recanalisation", "arrival", "recanalisation", 150, 180],
  ["ctGroin", "CT -> Groin Puncture", "reachedCt", "groinPuncture", 75, 100],
  ["groinRecan", "Groin -> Recanalisation", "groinPuncture", "recanalisation", 60, 90]
];

const delayReasons = ["Transfer Delay", "Notification Delay", "CT Busy", "Consent Delay", "Cathlab Delay", "Other"];
const manualReasons = ["Missed entry", "Observer delayed", "Retrospective correction", "Network issue", "Other"];
const nihssGroups = [
  {
    title: "Level of Consciousness",
    items: [
      ["loc", "LOC", ["0 Alert", "1 Drowsy", "2 Stuporous", "3 Coma"]],
      ["questions", "Questions", ["0 Both correct", "1 One correct", "2 Neither correct"]],
      ["commands", "Commands", ["0 Both obeyed", "1 One obeyed", "2 Neither obeyed"]]
    ]
  },
  {
    title: "Vision, Gaze, Face",
    items: [
      ["gaze", "Best Gaze", ["0 Normal", "1 Partial gaze palsy", "2 Forced deviation"]],
      ["visual", "Visual Fields", ["0 No loss", "1 Partial hemianopia", "2 Complete hemianopia", "3 Bilateral blindness"]],
      ["facial", "Facial Palsy", ["0 Normal", "1 Minor", "2 Partial", "3 Complete"]]
    ]
  },
  {
    title: "Motor",
    items: [
      ["leftArm", "Left Arm", ["0 No drift", "1 Drift", "2 Some effort", "3 No effort", "4 No movement"]],
      ["rightArm", "Right Arm", ["0 No drift", "1 Drift", "2 Some effort", "3 No effort", "4 No movement"]],
      ["leftLeg", "Left Leg", ["0 No drift", "1 Drift", "2 Some effort", "3 No effort", "4 No movement"]],
      ["rightLeg", "Right Leg", ["0 No drift", "1 Drift", "2 Some effort", "3 No effort", "4 No movement"]]
    ]
  },
  {
    title: "Coordination, Sensory, Language",
    items: [
      ["ataxia", "Limb Ataxia", ["0 Absent", "1 One limb", "2 Two limbs"]],
      ["sensory", "Sensory", ["0 Normal", "1 Mild/moderate loss", "2 Severe loss"]],
      ["language", "Language", ["0 Normal", "1 Mild aphasia", "2 Severe aphasia", "3 Mute/global aphasia"]]
    ]
  },
  {
    title: "Speech and Neglect",
    items: [
      ["dysarthria", "Dysarthria", ["0 Normal", "1 Mild/moderate", "2 Severe"]],
      ["neglect", "Extinction/Inattention", ["0 None", "1 Partial", "2 Profound"]]
    ]
  }
];

let state = {
  view: "home",
  cases: loadCases(),
  activeCaseId: null,
  openSections: { er: true, ct: true },
  manualTarget: null,
  tick: Date.now()
};

setInterval(() => {
  state.tick = Date.now();
  if (["timeline", "home", "cases"].includes(state.view)) render();
}, 1000);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}

function loadCases() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCases() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cases));
  // Firestore hook for V1.1: replace this with addDoc/updateDoc calls after Firebase config is supplied.
}

function h(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([key, value]) => {
    if (value === false || value == null) return;
    if (key === "class") node.className = value;
    else if (key === "html") node.innerHTML = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
    else node.setAttribute(key, value);
  });
  (Array.isArray(children) ? children : [children]).forEach((child) => {
    if (child == null) return;
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  });
  return node;
}

function render() {
  const app = document.querySelector("#app");
  app.innerHTML = "";
  app.appendChild(h("main", { class: "app-shell" }, [topbar(), screen(), bottomNav(), manualModal()]));
}

function topbar() {
  const active = currentCase();
  return h("header", { class: "topbar" }, [
    h("div", { class: "brand" }, [
      h("div", { class: "brand-mark" }, "SC"),
      h("div", {}, [h("h1", {}, "Rajagiri StrokeCode"), h("p", {}, "Stroke pathway timing MVP")])
    ]),
    active ? h("span", { class: `tag ${caseStatus(active).className}` }, caseStatus(active).label) : h("span", { class: "status-pill" }, "PWA READY")
  ]);
}

function bottomNav() {
  return h("nav", { class: "bottom-nav" }, [
    navButton("home", "Home"),
    navButton("cases", "Cases"),
    navButton("dashboard", "Dashboard"),
    navButton("more", "More")
  ]);
}

function navButton(view, label) {
  return h("button", { class: `nav-btn ${state.view === view ? "active" : ""}`, onclick: () => go(view) }, label);
}

function screen() {
  if (state.view === "create") return createScreen();
  if (state.view === "timeline") return timelineScreen();
  if (state.view === "ivt") return ivtScreen();
  if (state.view === "mt") return mtScreen();
  if (state.view === "summary") return summaryScreen();
  if (state.view === "dashboard") return dashboardScreen();
  if (state.view === "cases") return casesScreen();
  if (state.view === "more") return moreScreen();
  return homeScreen();
}

function go(view, caseId) {
  state.view = view;
  if (caseId) state.activeCaseId = caseId;
  render();
}

function currentCase() {
  return state.cases.find((item) => item.id === state.activeCaseId) || state.cases[0];
}

function homeScreen() {
  const today = todaysCases();
  const recent = [...state.cases].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  return h("section", {}, [
    h("button", { class: "primary-cta", onclick: () => go("create") }, "START NEW STROKE CASE"),
    heading("Today's Summary Cards"),
    h("div", { class: "grid summary-grid" }, [
      metricCard("Total stroke cases today", today.length || "0"),
      metricCard("Median Door -> CT", medianMetric(today, "doorCt")),
      metricCard("Median Door -> Groin Puncture", medianMetric(today, "doorGroin")),
      metricCard("Median Door -> Recanalisation", medianMetric(today, "doorRecan"))
    ]),
    heading("Recent Cases"),
    recent.length ? h("div", { class: "case-list" }, recent.map(caseRow)) : empty("No stroke cases recorded yet.")
  ]);
}

function createScreen() {
  const now = toLocalInput(new Date());
  return h("section", {}, [
    title("Create Stroke Case", "Minimal typing. Timer starts as soon as the case is created."),
    h("form", {
      class: "form-card",
      onsubmit: (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const arrivalMode = form.get("arrivalMode");
        const arrival = arrivalMode === "manual" ? new Date(form.get("arrivalTime")).toISOString() : new Date().toISOString();
        const nihssBreakdown = getNihssItems().reduce((scores, item) => {
          scores[item[0]] = Number(form.get(`nihss_${item[0]}`) || 0);
          return scores;
        }, {});
        const newCase = {
          id: nextCaseId(),
          patientName: form.get("patientName") || "Unnamed Patient",
          age: form.get("age") || "",
          gender: form.get("gender") || "",
          uhid: form.get("uhid") || "",
          suspicion: form.get("suspicion"),
          nihss: form.get("nihss") || "",
          nihssBreakdown,
          side: form.get("side") || "Unknown",
          territory: form.get("territory") || "Unknown",
          arrivalTime: arrival,
          createdAt: new Date().toISOString(),
          stages: {
            arrival: { time: arrival, mode: arrivalMode === "manual" ? "manual" : "auto", reason: arrivalMode === "manual" ? "Retrospective correction" : "" }
          },
          ivt: { eligible: "", consent: "", notGivenReason: "" },
          mt: { tici: "" },
          delayReason: ""
        };
        state.cases.unshift(newCase);
        state.activeCaseId = newCase.id;
        saveCases();
        go("timeline", newCase.id);
      }
    }, [
      field("Patient Name", h("input", { name: "patientName", placeholder: "Patient name", autocomplete: "off", required: true })),
      h("div", { class: "desktop-two" }, [
        field("Age", select("age", ageOptions())),
        field("Gender", select("gender", ["Male", "Female", "Other"]))
      ]),
      field("UHID (optional)", h("input", { name: "uhid", placeholder: "UHID" })),
      field("Stroke Suspicion", choiceButtons("suspicion", ["Ischemic Stroke", "LVO Suspected", "Hemorrhage", "Unknown"])),
      h("div", { class: "section-heading compact-heading" }, [h("h2", {}, "Clinical Snapshot")]),
      field("NIHSS Score", nihssCalculator()),
      field("Side", choiceButtons("side", ["Left", "Right", "Bilateral", "Unknown"], "Unknown")),
      field("Suspected Territory", choiceButtons("territory", ["MCA", "ACA", "PCA", "Basilar", "Unknown"], "Unknown")),
      field("Arrival Time", h("div", {}, [
        h("div", { class: "segmented" }, [
          h("button", { type: "button", class: "active", onclick: toggleArrival }, "Auto now"),
          h("button", { type: "button", onclick: toggleArrival }, "Manual time")
        ]),
        h("input", { type: "hidden", name: "arrivalMode", value: "auto" }),
        h("input", { type: "datetime-local", name: "arrivalTime", value: now, style: "display:none;margin-top:10px" })
      ])),
      h("button", { class: "primary-cta", type: "submit" }, "START STROKE TIMER")
    ])
  ]);
}

function toggleArrival(event) {
  const wrap = event.currentTarget.closest(".field");
  const buttons = wrap.querySelectorAll(".segmented button");
  buttons.forEach((button) => button.classList.remove("active"));
  event.currentTarget.classList.add("active");
  const manual = event.currentTarget.textContent.includes("Manual");
  wrap.querySelector("[name='arrivalMode']").value = manual ? "manual" : "auto";
  wrap.querySelector("[name='arrivalTime']").style.display = manual ? "block" : "none";
}

function timelineScreen() {
  const item = currentCase();
  if (!item) return homeScreen();
  return h("section", {}, [
    timerCard(item),
    accordion("er", "SECTION 1 - ER PHASE", erStages, item),
    accordion("ct", "SECTION 2 - CT PHASE", ctStages, item),
    h("div", { class: "section-card" }, [
      pathwayCard("IV THROMBOLYSIS", ivtStatus(item), () => go("ivt", item.id)),
      pathwayCard("MECHANICAL THROMBECTOMY", mtStatus(item), () => go("mt", item.id))
    ]),
    h("button", { class: "primary-cta", onclick: () => go("summary", item.id) }, "VIEW CASE SUMMARY")
  ]);
}

function timerCard(item) {
  return h("div", { class: "timer-card" }, [
    h("span", {}, "TOTAL ELAPSED TIME"),
    h("strong", {}, formatDuration(Date.now() - new Date(item.arrivalTime).getTime())),
    h("div", { class: "timer-meta" }, [
      h("div", {}, `${item.id}`),
      h("div", {}, `${item.patientName} | ${item.age || "--"}/${shortGender(item.gender)}`)
    ]),
    h("div", { class: "clinical-strip" }, [
      h("span", {}, `NIHSS ${item.nihss || "--"}`),
      h("span", {}, item.side || "Unknown"),
      h("span", {}, item.territory || "Unknown")
    ])
  ]);
}

function accordion(key, label, stages, item) {
  const open = state.openSections[key];
  return h("div", { class: "section-card" }, [
    h("button", {
      class: "accordion-head",
      onclick: () => {
        state.openSections[key] = !state.openSections[key];
        render();
      }
    }, [h("strong", {}, label), h("span", { class: "tag grey" }, open ? "OPEN" : "CLOSED")]),
    open ? h("div", { class: "accordion-body" }, stages.map(([id, labelText]) => stageRow(item, id, labelText))) : null
  ]);
}

function stageRow(item, id, labelText) {
  const stage = item.stages[id];
  return h("div", { class: "stage" }, [
    h("i", { class: `dot ${stage?.mode || ""}` }),
    h("div", {}, [
      h("div", { class: "stage-copy" }, [
        h("strong", {}, labelText),
        h("span", {}, stage ? `${formatClock(stage.time)}${stage.reason ? ` | ${stage.reason}` : ""}` : "Not yet recorded")
      ]),
      h("div", { class: "stage-actions" }, [
        h("button", { class: `record-btn ${stage ? "done" : ""}`, onclick: () => recordStage(item.id, id, "auto") }, stage ? "RECORDED" : "RECORD NOW"),
        h("button", { class: "manual-btn", onclick: () => openManual(item.id, id, labelText) }, "ENTER MANUAL TIME")
      ])
    ])
  ]);
}

function pathwayCard(titleText, status, onclick) {
  return h("div", { class: "pathway-card" }, [
    h("div", { class: "stage-copy" }, [h("strong", {}, titleText), h("span", {}, status)]),
    h("button", { class: "ghost-btn", onclick }, titleText.includes("IV") ? "OPEN IVT SCREEN" : "OPEN MT SCREEN")
  ]);
}

function ivtScreen() {
  const item = currentCase();
  if (!item) return homeScreen();
  return h("section", {}, [
    title("IV Thrombolysis", `${item.id} | ${item.patientName}`),
    h("div", { class: "form-card" }, [
      optionField("IVT Eligible", "eligible", item.ivt.eligible, ["Yes", "No"], (value) => updateNested(item.id, "ivt", "eligible", value)),
      optionField("IVT Consent Taken", "consent", item.ivt.consent, ["Yes", "No"], (value) => updateNested(item.id, "ivt", "consent", value)),
      stageRow(item, "ivtStarted", "IVT Started / Bolus Given"),
      item.ivt.eligible === "No" || item.ivt.consent === "No" ? field("If IVT not given", select("notGivenReason", ["Outside window", "Hemorrhage", "Anticoagulant", "Family refusal", "Clinical decision", "Other"], item.ivt.notGivenReason, (value) => updateNested(item.id, "ivt", "notGivenReason", value))) : null,
      h("button", { class: "secondary-btn", onclick: () => go("timeline", item.id) }, "BACK TO TIMELINE")
    ])
  ]);
}

function mtScreen() {
  const item = currentCase();
  if (!item) return homeScreen();
  return h("section", {}, [
    title("Mechanical Thrombectomy", `${item.id} | ${item.patientName}`),
    h("div", { class: "form-card" }, [
      ...mtStages.map(([id, labelText]) => stageRow(item, id, labelText)),
      field("Final TICI Score", select("tici", ["", "0", "1", "2A", "2B", "2C", "3"], item.mt.tici, (value) => updateNested(item.id, "mt", "tici", value))),
      h("button", { class: "secondary-btn", onclick: () => go("timeline", item.id) }, "BACK TO TIMELINE")
    ])
  ]);
}

function summaryScreen() {
  const item = currentCase();
  if (!item) return homeScreen();
  return h("section", {}, [
    title("Case Summary", `${item.id} | ${item.patientName}`),
    h("div", { class: "grid summary-grid", style: "margin:14px 0" }, [
      metricCard("NIHSS", item.nihss || "--"),
      metricCard("Side", item.side || "Unknown"),
      metricCard("Territory", item.territory || "Unknown"),
      metricCard("Suspicion", item.suspicion || "Unknown")
    ]),
    field("Primary Delay Reason", select("delayReason", ["", ...delayReasons], item.delayReason, (value) => {
      item.delayReason = value;
      saveCases();
      render();
    })),
    h("div", { class: "metrics-list" }, metricDefs.map((def) => metricLine(item, def))),
    h("div", { class: "grid", style: "margin-top:14px" }, [
      h("button", { class: "primary-cta", onclick: () => go("timeline", item.id) }, "VIEW FULL TIMELINE"),
      h("button", { class: "secondary-btn", onclick: () => go("home") }, "BACK TO HOME")
    ])
  ]);
}

function dashboardScreen() {
  const today = todaysCases();
  const statusCounts = today.reduce((acc, item) => {
    const status = caseStatus(item).label;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  return h("section", {}, [
    title("Quality Dashboard", "Responsive command-center view for 10-day observation."),
    h("div", { class: "grid dashboard-grid" }, [
      metricCard("Total Cases Today", today.length || "0"),
      metricCard("On Track", statusCounts["On Track"] || "0"),
      metricCard("Delayed", statusCounts.Delayed || "0"),
      metricCard("Critical Delay", statusCounts.Critical || "0")
    ]),
    heading("Median Timings Today"),
    h("div", { class: "grid dashboard-grid" }, metricDefs.slice(0, 6).map((def) => metricCard(def[1], medianMetric(today, def[0])))),
    heading("Recent Cases Table"),
    recentTable(),
    h("div", { class: "desktop-two", style: "margin-top:14px" }, [delayChart(), trendChart()])
  ]);
}

function casesScreen() {
  return h("section", {}, [
    title("Cases", "Open any observed stroke case."),
    state.cases.length ? h("div", { class: "case-list" }, state.cases.map(caseRow)) : empty("No cases yet.")
  ]);
}

function moreScreen() {
  return h("section", {}, [
    title("More", "MVP configuration"),
    h("div", { class: "form-card" }, [
      metricCard("Storage", "Local PWA"),
      metricCard("Firestore", "Ready for config"),
      h("button", { class: "secondary-btn", onclick: exportCases }, "EXPORT CASES JSON"),
      h("button", { class: "danger-btn", style: "background:#fff0f0;color:#e5484d", onclick: clearCases }, "CLEAR LOCAL CASES")
    ])
  ]);
}

function recordStage(caseId, stageId, mode, manualTime, reason = "") {
  const item = state.cases.find((entry) => entry.id === caseId);
  item.stages[stageId] = { time: manualTime || new Date().toISOString(), mode, reason };
  saveCases();
  render();
}

function openManual(caseId, stageId, labelText) {
  state.manualTarget = { caseId, stageId, labelText };
  render();
}

function manualModal() {
  if (!state.manualTarget) return null;
  const target = state.manualTarget;
  return h("div", { class: "modal-backdrop" }, [
    h("form", {
      class: "modal",
      onsubmit: (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        state.manualTarget = null;
        recordStage(target.caseId, target.stageId, "manual", new Date(form.get("manualTime")).toISOString(), form.get("reason"));
      }
    }, [
      h("h3", {}, target.labelText),
      field("Select actual time", h("input", { type: "datetime-local", name: "manualTime", value: toLocalInput(new Date()), required: true })),
      field("Reason", select("reason", manualReasons)),
      h("div", { class: "modal-actions" }, [
        h("button", { type: "button", class: "secondary-btn", onclick: () => { state.manualTarget = null; render(); } }, "CANCEL"),
        h("button", { class: "record-btn", type: "submit" }, "SAVE TIME")
      ])
    ])
  ]);
}

function field(label, input) {
  return h("div", { class: "field" }, [h("label", {}, label), input]);
}

function optionField(label, key, active, options, onChange) {
  return field(label, h("div", { class: "segmented" }, options.map((option) => h("button", {
    type: "button",
    class: option === active ? "active" : "",
    onclick: () => onChange(option)
  }, option))));
}

function choiceButtons(name, options, active = options[0]) {
  return h("div", {}, [
    h("input", { type: "hidden", name, value: active }),
    h("div", { class: "segmented option-grid" }, options.map((option) => h("button", {
      type: "button",
      class: option === active ? "active" : "",
      onclick: (event) => {
        const wrap = event.currentTarget.closest(".field");
        wrap.querySelector(`[name='${name}']`).value = option;
        wrap.querySelectorAll(".option-grid button").forEach((button) => button.classList.remove("active"));
        event.currentTarget.classList.add("active");
      }
    }, option)))
  ]);
}

function ageOptions() {
  return ["", ...Array.from({ length: 111 }, (_, age) => String(age))];
}

function getNihssItems() {
  return nihssGroups.flatMap((group) => group.items);
}

function nihssCalculator() {
  return h("div", { class: "nihss-card" }, [
    h("input", { type: "hidden", name: "nihss", value: "0" }),
    h("div", { class: "nihss-total-card" }, [
      h("span", {}, "TOTAL NIHSS"),
      h("strong", { class: "nihss-total" }, "0"),
      h("em", { class: "nihss-category" }, nihssCategory(0)),
      h("button", { type: "button", class: "nihss-toggle", onclick: toggleNihssDetails }, "OPEN NIHSS DETAILS")
    ]),
    h("div", { class: "nihss-details", hidden: true }, nihssGroups.map((group) => h("div", { class: "nihss-group" }, [
      h("h3", {}, group.title),
      ...group.items.map(([id, label, options]) => h("label", { class: "nihss-item" }, [
        h("span", {}, label),
        h("select", { name: `nihss_${id}`, "data-nihss-item": id, onchange: updateNihssTotal }, options.map((option) => {
          const value = option.split(" ")[0];
          return h("option", { value }, option);
        }))
      ]))
    ])))
  ]);
}

function toggleNihssDetails(event) {
  const card = event.currentTarget.closest(".nihss-card");
  const details = card.querySelector(".nihss-details");
  const opening = details.hidden;
  details.hidden = !opening;
  event.currentTarget.textContent = opening ? "HIDE NIHSS DETAILS" : "OPEN NIHSS DETAILS";
}

function updateNihssTotal(event) {
  const card = event.currentTarget.closest(".nihss-card");
  const total = Array.from(card.querySelectorAll("[data-nihss-item]")).reduce((sum, input) => sum + Number(input.value || 0), 0);
  card.querySelector("[name='nihss']").value = String(total);
  card.querySelector(".nihss-total").textContent = String(total);
  card.querySelector(".nihss-category").textContent = nihssCategory(total);
}

function nihssCategory(score) {
  if (score === 0) return "No stroke symptoms";
  if (score <= 4) return "Minor stroke";
  if (score <= 15) return "Moderate stroke";
  if (score <= 20) return "Moderate to severe stroke";
  return "Severe stroke";
}

function select(name, options, value = "", onChange) {
  return h("select", { name, onchange: onChange ? (event) => onChange(event.target.value) : null }, options.map((option) => h("option", { value: option, selected: option === value }, option || "Select")));
}

function title(head, sub) {
  return h("div", { class: "screen-title" }, [h("h1", {}, head), h("p", {}, sub)]);
}

function heading(text) {
  return h("div", { class: "section-heading" }, [h("h2", {}, text)]);
}

function metricCard(label, value) {
  return h("div", { class: "metric-card" }, [h("span", {}, label), h("strong", {}, String(value))]);
}

function empty(text) {
  return h("div", { class: "empty" }, text);
}

function caseRow(item) {
  const status = caseStatus(item);
  return h("button", { class: "case-row", onclick: () => go("timeline", item.id) }, [
    h("div", { class: "case-main" }, [
      h("strong", {}, `${item.id} - ${item.patientName}`),
      h("span", {}, `${formatDuration(Date.now() - new Date(item.arrivalTime).getTime())} | ${item.suspicion}`)
    ]),
    h("span", { class: `tag ${status.className}` }, status.label)
  ]);
}

function metricLine(item, def) {
  const minutes = metricMinutes(item, def);
  const status = metricStatus(minutes, def[4], def[5]);
  const width = minutes == null ? 0 : Math.min(100, Math.round((minutes / def[5]) * 100));
  return h("div", { class: "metric-line" }, [
    h("div", {}, [
      h("strong", {}, def[1]),
      h("div", { class: `bar ${status.bar}` }, h("i", { style: `width:${width}%` }))
    ]),
    h("span", { class: `tag ${status.className}` }, minutes == null ? "Pending" : `${minutes} min`)
  ]);
}

function recentTable() {
  if (!state.cases.length) return empty("No cases recorded yet.");
  const rows = state.cases.slice(0, 8).map((item) => {
    const status = caseStatus(item);
    return h("tr", {}, [
      h("td", {}, item.id),
      h("td", {}, item.patientName),
      h("td", {}, `${item.age || "--"}/${shortGender(item.gender)}`),
      h("td", {}, formatClock(item.arrivalTime)),
      h("td", {}, metricText(item, "doorCt")),
      h("td", {}, metricText(item, "doorGroin")),
      h("td", {}, metricText(item, "doorRecan")),
      h("td", {}, h("span", { class: `tag ${status.className}` }, status.label))
    ]);
  });
  return h("div", { class: "table-wrap" }, h("table", {}, [
    h("thead", {}, h("tr", {}, ["Case ID", "Patient Name", "Age/Gender", "Arrival Time", "Door -> CT", "Door -> Groin", "Door -> Recanalisation", "Status"].map((text) => h("th", {}, text)))),
    h("tbody", {}, rows)
  ]));
}

function delayChart() {
  const counts = delayReasons.map((reason) => [reason, state.cases.filter((item) => item.delayReason === reason).length]);
  const total = counts.reduce((sum, [, count]) => sum + count, 0);
  return h("div", { class: "chart-card" }, [
    h("h3", {}, "Top Delay Reasons"),
    h("div", { class: "pie", style: total ? "" : "background:#edf0f6" }),
    h("div", { class: "legend" }, counts.map(([reason, count], index) => h("div", { class: "legend-row" }, [
      h("span", {}, [h("i", { class: "legend-swatch", style: `background:${["#b5121b", "#21a66b", "#f59e0b", "#e5484d", "#8891a5", "#c2c7d4"][index]}` }), reason]),
      h("strong", {}, String(count))
    ])))
  ]);
}

function trendChart() {
  const defs = metricDefs.slice(0, 6);
  const recentCases = state.cases.filter((item) => Date.now() - new Date(item.arrivalTime).getTime() <= 7 * 24 * 60 * 60 * 1000);
  return h("div", { class: "chart-card" }, [
    h("h3", {}, "Last 7 Days Trends"),
    h("div", { class: "trend" }, defs.map((def) => {
      const value = medianMetricNumber(recentCases, def[0]);
      return h("div", { class: "trend-row" }, [
        h("span", {}, def[1].replace("Door -> ", "D -> ")),
        h("div", { class: "trend-track" }, h("i", { style: `width:${value == null ? 0 : Math.min(100, Math.round((value / def[5]) * 100))}%` })),
        h("strong", {}, value == null ? "--" : `${value}m`)
      ]);
    }))
  ]);
}

function updateNested(caseId, group, key, value) {
  const item = state.cases.find((entry) => entry.id === caseId);
  item[group][key] = value;
  saveCases();
  render();
}

function metricMinutes(item, def) {
  const start = item.stages[def[2]]?.time;
  const end = item.stages[def[3]]?.time;
  if (!start || !end) return null;
  return Math.max(0, Math.round((new Date(end) - new Date(start)) / 60000));
}

function metricText(item, id) {
  const def = metricDefs.find((entry) => entry[0] === id);
  const minutes = metricMinutes(item, def);
  return minutes == null ? "--" : `${minutes} min`;
}

function medianMetric(cases, id) {
  const value = medianMetricNumber(cases, id);
  return value == null ? "--" : `${value} min`;
}

function medianMetricNumber(cases, id) {
  const def = metricDefs.find((entry) => entry[0] === id);
  const values = cases.map((item) => metricMinutes(item, def)).filter((value) => value != null).sort((a, b) => a - b);
  if (!values.length) return null;
  const middle = Math.floor(values.length / 2);
  return values.length % 2 ? values[middle] : Math.round((values[middle - 1] + values[middle]) / 2);
}

function metricStatus(minutes, target, critical) {
  if (minutes == null) return { className: "grey", bar: "good" };
  if (minutes <= target) return { className: "", bar: "good" };
  if (minutes <= critical) return { className: "orange", bar: "warn" };
  return { className: "red", bar: "bad" };
}

function caseStatus(item) {
  const values = metricDefs.slice(0, 6).map((def) => {
    const minutes = metricMinutes(item, def);
    return minutes == null ? null : metricStatus(minutes, def[4], def[5]).className;
  }).filter(Boolean);
  if (values.includes("red")) return { label: "Critical", className: "red" };
  if (values.includes("orange")) return { label: "Delayed", className: "orange" };
  return { label: "On Track", className: "" };
}

function todaysCases() {
  const today = new Date().toDateString();
  return state.cases.filter((item) => new Date(item.arrivalTime).toDateString() === today);
}

function nextCaseId() {
  const next = state.cases.length + 1;
  return `SC-${String(next).padStart(3, "0")}`;
}

function ivtStatus(item) {
  if (item.stages.ivtStarted) return "Completed";
  if (item.ivt.eligible || item.ivt.consent) return "In Progress";
  return "Not Recorded";
}

function mtStatus(item) {
  if (item.stages.recanalisation) return "Completed";
  if (mtStages.some(([id]) => item.stages[id])) return "In progress";
  return "Not started";
}

function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function formatClock(value) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function toLocalInput(date) {
  const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return copy.toISOString().slice(0, 16);
}

function shortGender(value) {
  return value ? value.charAt(0).toUpperCase() : "-";
}

function exportCases() {
  const blob = new Blob([JSON.stringify(state.cases, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = h("a", { href: url, download: "rajagiri-strokecode-cases.json" });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function clearCases() {
  if (!confirm("Clear all locally stored stroke cases?")) return;
  state.cases = [];
  state.activeCaseId = null;
  saveCases();
  go("home");
}

render();
