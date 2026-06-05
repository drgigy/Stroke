const STORAGE_KEY = "rajagiri-strokecode-cases-v1";
const DEVICE_ID_KEY = "rajagiri-strokecode-device-id-v1";
const DEVICE_CODE_KEY = "rajagiri-strokecode-device-code-v1";
const DEVICE_COOKIE_ID = "rsc_device_id";
const DEVICE_COOKIE_CODE = "rsc_device_code";
const ACCESS_SETTINGS_KEY = "rajagiri-strokecode-access-v1";
const FIRESTORE_COLLECTION = "strokeCases";
const DEVICE_COLLECTION = "deviceApprovals";
const defaultAccessSettings = {
  centreName: "Rajagiri Hospital",
  adminPin: "9999",
  updatedAt: ""
};

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
const signoffStageRequirements = [
  ["arrival", "Arrival at ER", "er"],
  ["codeStroke", "Code Stroke Activated", "er"],
  ["neuroInformed", "Neurology Informed", "er"],
  ["ctInformed", "CT Informed", "er"],
  ["shiftToCt", "Shift to CT", "er"],
  ["reachedCt", "Reached CT", "ct"],
  ["ncctStarted", "NCCT Started", "ct"],
  ["ncctCompleted", "NCCT Completed", "ct"],
  ["imagingReviewed", "Imaging Reviewed", "ct"]
];
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
  noteTarget: null,
  stopTarget: null,
  device: loadDeviceIdentity(),
  deviceStatus: "checking",
  deviceRecord: null,
  devices: [],
  adminUnlocked: false,
  authError: "",
  settingsMessage: "",
  adminMessage: "",
  installMessage: "",
  deferredInstallPrompt: null,
  tick: Date.now()
};

let accessSettings = loadAccessSettings();

let cloudSync = {
  initialized: false,
  enabled: false,
  db: null,
  applyingRemote: false,
  casesListening: false,
  devicesListening: false,
  status: "Local only",
  lastSyncAt: "",
  error: "",
  projectId: window.STROKECODE_FIREBASE_CONFIG?.projectId || "--"
};

setInterval(() => {
  state.tick = Date.now();
  if (["timeline", "home", "cases", "dashboard"].includes(state.view) && !state.manualTarget && !state.noteTarget && !state.stopTarget) render();
}, 1000);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  state.deferredInstallPrompt = event;
  render();
});

window.addEventListener("appinstalled", () => {
  state.deferredInstallPrompt = null;
  state.installMessage = "App installed successfully";
  render();
});

initCloudSync();

function loadCases() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function loadAccessSettings() {
  try {
    return { ...defaultAccessSettings, ...(JSON.parse(localStorage.getItem(ACCESS_SETTINGS_KEY)) || {}) };
  } catch {
    return { ...defaultAccessSettings };
  }
}

function loadDeviceIdentity() {
  let id = safeStorageGet(DEVICE_ID_KEY) || readCookie(DEVICE_COOKIE_ID);
  let code = safeStorageGet(DEVICE_CODE_KEY) || readCookie(DEVICE_COOKIE_CODE);
  if (!id) {
    id = `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
  if (!code) {
    code = generateDeviceCode();
  }
  persistDeviceIdentity(id, code);
  return { id, code };
}

function persistDeviceIdentity(id, code) {
  safeStorageSet(DEVICE_ID_KEY, id);
  safeStorageSet(DEVICE_CODE_KEY, code);
  writeCookie(DEVICE_COOKIE_ID, id);
  writeCookie(DEVICE_COOKIE_CODE, code);
}

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return "";
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function writeCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=31536000; path=/; SameSite=Lax`;
}

function generateDeviceCode() {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RSC-${part()}-${part()}`;
}

function saveAccessSettings() {
  localStorage.setItem(ACCESS_SETTINGS_KEY, JSON.stringify(accessSettings));
}

function saveCases() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cases));
  if (cloudSync.enabled && !cloudSync.applyingRemote) {
    syncCasesToCloud();
  }
}

function initCloudSync() {
  if (cloudSync.initialized) return;
  const config = window.STROKECODE_FIREBASE_CONFIG;
  if (!config?.apiKey || !config?.projectId) {
    cloudSync.status = "Config missing";
    cloudSync.error = "firebase-config.js is missing project settings";
    state.deviceStatus = "error";
    return;
  }
  if (!window.firebase?.initializeApp) {
    cloudSync.status = "SDK not loaded";
    cloudSync.error = "Firebase scripts did not load";
    state.deviceStatus = "error";
    return;
  }
  try {
    cloudSync.initialized = true;
    firebase.initializeApp(config);
    cloudSync.db = firebase.firestore();
    cloudSync.enabled = true;
    cloudSync.status = "Connecting...";
    cloudSync.error = "";
    initDeviceApproval();
    setTimeout(() => {
      if (cloudSync.status === "Connecting...") {
        cloudSync.status = "Cloud sync slow";
        cloudSync.error = "Still waiting for Firestore. Check internet, Firestore rules, and hosted HTTPS URL.";
        render();
      }
    }, 8000);
  } catch (error) {
    cloudSync.enabled = false;
    cloudSync.status = "Cloud sync error";
    cloudSync.error = error.message || "Firebase initialization failed";
    state.deviceStatus = "error";
  }
}

function initDeviceApproval() {
  const ref = cloudSync.db.collection(DEVICE_COLLECTION).doc(state.device.id);
  const now = new Date().toISOString();
  ref.get().then((doc) => {
    if (!doc.exists) {
      return ref.set({
        deviceId: state.device.id,
        deviceCode: state.device.code,
        status: "pending",
        deviceLabel: "",
        firstSeenAt: now,
        lastSeenAt: now,
        approvedAt: "",
        blockedAt: "",
        revokedAt: ""
      });
    }
    return ref.set({ lastSeenAt: now, deviceCode: doc.data().deviceCode || state.device.code }, { merge: true });
  }).catch((error) => {
    state.deviceStatus = "error";
    cloudSync.error = `${error.code || "error"}: Device approval request failed`;
    render();
  });
  ref.onSnapshot((doc) => {
    if (!doc.exists) return;
    state.deviceRecord = doc.data();
    if (state.deviceRecord.deviceCode) {
      state.device.code = state.deviceRecord.deviceCode;
      persistDeviceIdentity(state.device.id, state.device.code);
    }
    state.deviceStatus = state.deviceRecord.status || "pending";
    if (state.deviceStatus === "approved") startCaseSync();
    render();
  }, (error) => {
    state.deviceStatus = "error";
    cloudSync.error = `${error.code || "error"}: Device approval listener failed`;
    render();
  });
}

function startCaseSync() {
  if (cloudSync.casesListening) return;
  cloudSync.casesListening = true;
  cloudSync.db.collection(FIRESTORE_COLLECTION).orderBy("createdAt", "desc").onSnapshot((snapshot) => {
      const remoteCases = snapshot.docs.map((doc) => doc.data());
      cloudSync.applyingRemote = true;
      state.cases = remoteCases;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cases));
      cloudSync.applyingRemote = false;
      cloudSync.status = "Cloud sync on";
      cloudSync.error = "";
      cloudSync.lastSyncAt = new Date().toISOString();
      if (state.activeCaseId && !state.cases.some((item) => item.id === state.activeCaseId)) {
        state.activeCaseId = state.cases[0]?.id || null;
      }
      render();
    }, (error) => {
      cloudSync.status = "Cloud sync error";
      cloudSync.error = `${error.code || "error"}: ${error.message || "Firestore listener failed"}`;
      render();
    });
}

function syncCasesToCloud() {
  state.cases.forEach((item) => {
    cloudSync.db.collection(FIRESTORE_COLLECTION).doc(item.id).set(item, { merge: true }).catch(() => {
      cloudSync.status = "Cloud sync error";
      cloudSync.error = "Write failed. Check Firestore rules.";
    }).then(() => {
      if (cloudSync.status !== "Cloud sync error") {
        cloudSync.status = "Cloud sync on";
        cloudSync.error = "";
        cloudSync.lastSyncAt = new Date().toISOString();
      }
    });
  });
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
  if (state.deviceStatus !== "approved") {
    app.appendChild(h("main", { class: "app-shell lock-shell" }, deviceApprovalScreen()));
    return;
  }
  app.appendChild(h("main", { class: "app-shell" }, [topbar(), screen(), bottomNav(), manualModal(), noteModal(), stopModal()]));
}

function deviceApprovalScreen() {
  const status = state.deviceStatus;
  const record = state.deviceRecord || {};
  return h("section", { class: "lock-screen" }, [
    h("div", { class: "brand lock-brand" }, [
      h("div", { class: "brand-mark" }, "SC"),
      h("div", {}, [
        h("h1", {}, "Rajagiri Stroke Code"),
        h("p", {}, accessSettings.centreName)
      ])
    ]),
    h("div", { class: "lock-card" }, [
      h("span", {}, status === "blocked" ? "DEVICE BLOCKED" : status === "error" ? "DEVICE CHECK ERROR" : "DEVICE APPROVAL REQUIRED"),
      h("div", { class: "device-code" }, record.deviceCode || state.device.code),
      h("p", { class: "settings-help centered" }, status === "blocked"
        ? "This device has been blocked. Contact admin if this is a mistake."
        : status === "error"
          ? "Unable to check approval. Check internet, Firebase, and Firestore rules."
          : "Share this code with admin. The app will open automatically after this device is approved."),
      cloudSync.error ? h("div", { class: "settings-message" }, cloudSync.error) : null,
      installButton(),
      state.installMessage ? h("div", { class: "install-help" }, state.installMessage) : null,
      h("button", { class: "secondary-btn", type: "button", onclick: () => { initCloudSync(); render(); } }, "CHECK AGAIN")
    ])
  ]);
}

function topbar() {
  const active = currentCase();
  return h("header", { class: "topbar" }, [
    h("div", { class: "brand" }, [
      h("div", { class: "brand-mark" }, "SC"),
      h("div", {}, [h("h1", {}, "Rajagiri Stroke Code")])
    ]),
    active ? h("span", { class: `tag ${caseStatus(active).className}` }, caseStatus(active).label) : null
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
  if (state.view === "edit") return editCaseScreen();
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
    title("Create Stroke Case", ""),
    h("form", {
      class: "form-card",
      novalidate: true,
      onsubmit: (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const arrivalMode = form.get("arrivalMode");
        const arrival = arrivalMode === "manual" ? new Date(form.get("arrivalTime")).toISOString() : new Date().toISOString();
        const nihssBreakdown = getNihssItems().reduce((scores, item) => {
          const value = form.get(`nihss_${item[0]}`);
          scores[item[0]] = value === "" ? "" : Number(value);
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
          mt: { evtConsent: "", tici: "" },
          stageNotes: {},
          delayReason: "",
          caseComment: "",
          caseStopped: false,
          caseStoppedAt: "",
          caseStoppedReason: "",
          caseStoppedComment: "",
          centreName: accessSettings.centreName,
          observerName: "",
          signedOffAt: "",
          signoffAttempted: false
        };
        state.cases.unshift(newCase);
        state.activeCaseId = newCase.id;
        saveCases();
        go("timeline", newCase.id);
      }
    }, [
      field("Patient Name", h("input", { name: "patientName", placeholder: "Patient name", autocomplete: "off" })),
      h("div", { class: "desktop-two" }, [
        field("Age", select("age", ageOptions(), "50")),
        field("Gender", select("gender", ["Male", "Female", "Other"]))
      ]),
      field("UHID (optional)", h("input", { name: "uhid", placeholder: "UHID" })),
      field("Stroke Suspicion", choiceButtons("suspicion", ["Ischemic Stroke", "LVO Suspected", "Hemorrhage", "Unknown"])),
      h("div", { class: "section-heading compact-heading" }, [h("h2", {}, "Clinical Snapshot")]),
      field("NIHSS Score", nihssCalculator()),
      field("Side", choiceButtons("side", ["Left", "Right", "Bilateral", "Unknown"], "Unknown")),
      field("Suspected Territory", choiceButtons("territory", ["MCA", "ACA", "PCA", "Basilar", "Carotid", "Unknown"], "Unknown")),
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
    h("button", { class: "secondary-btn full-width-action", onclick: () => go("edit", item.id) }, "EDIT CASE DETAILS / NIHSS"),
    accordion("er", "SECTION 1 - ER PHASE", erStages, item),
    accordion("ct", "SECTION 2 - CT PHASE", ctStages, item),
    h("div", { class: "section-card" }, [
      pathwayCard("IV THROMBOLYSIS", ivtStatus(item), () => go("ivt", item.id)),
      pathwayCard("MECHANICAL THROMBECTOMY", mtStatus(item), () => go("mt", item.id))
    ]),
    h("button", { class: "primary-cta", onclick: () => go("summary", item.id) }, "VIEW CASE SUMMARY")
  ]);
}

function liveTracker(item, placement = "compact") {
  const trackerSteps = [
    ["arrival", "Door", "ER"],
    ["codeStroke", "Code", "ER"],
    ["neuroInformed", "Neuro", "ER"],
    ["shiftToCt", "To CT", "ER"],
    ["reachedCt", "CT", "CT"],
    ["ncctStarted", "NCCT", "CT"],
    ["imagingReviewed", "Review", "CT"],
    ["ivtStarted", "IVT", "Rx"],
    ["groinPuncture", "Groin", "MT"],
    ["recanalisation", "Recan", "MT"]
  ];
  const completed = trackerSteps.filter(([id]) => item.stages[id]?.time).length;
  const percent = Math.round((completed / trackerSteps.length) * 100);
  const nextStep = trackerSteps.find(([id]) => !item.stages[id]?.time);
  const elapsed = formatDuration(caseEndTime(item).getTime() - new Date(item.arrivalTime).getTime());
  const status = caseStatus(item);
  return h("div", { class: `tracker-card ${placement === "dashboard" ? "dashboard-tracker" : ""} ${status.className ? `tracker-${status.className}` : ""}` }, [
    h("div", { class: "tracker-head" }, [
      h("div", {}, [
        h("span", {}, "LIVE STROKE TRACKER"),
        h("strong", {}, `${item.id} | ${item.patientName}`),
        h("small", {}, item.caseStopped ? `Stopped: ${item.caseStoppedReason || "Reason pending"}` : item.signedOffAt ? "Case signed off" : nextStep ? `Next: ${nextStep[1]}` : "Pathway complete")
      ]),
      h("div", { class: "tracker-score" }, [
        h("em", {}, elapsed),
        h("span", {}, item.caseStopped || item.signedOffAt ? "Final duration" : status.label)
      ])
    ]),
    h("div", { class: "tracker-progress" }, h("i", { style: `width:${percent}%` })),
    h("div", { class: "tracker-rail" }, trackerSteps.map(([id, label, group], index) => {
      const done = Boolean(item.stages[id]?.time);
      const current = !done && nextStep?.[0] === id;
      return h("button", {
        type: "button",
        class: `tracker-step ${done ? "done" : ""} ${current ? "current" : ""}`,
        onclick: () => jumpToTrackerStep(item.id, id)
      }, [
        h("b", {}, done ? "OK" : String(index + 1)),
        h("span", {}, label),
        h("small", {}, done ? formatClock(item.stages[id].time) : group)
      ]);
    }))
  ]);
}

function liveCasesPanel() {
  const items = liveCases();
  return h("div", { class: "live-cases-stack" }, [
    h("div", { class: "section-heading compact-heading live-heading" }, [
      h("h2", {}, "Live Stroke Cases"),
      h("span", { class: "tag grey" }, `${items.length} active`)
    ]),
    items.length ? h("div", { class: "live-case-list" }, items.map((item) => liveTracker(item, "dashboard"))) : empty("No active live stroke cases.")
  ]);
}

function jumpToTrackerStep(caseId, stageId) {
  if (erStages.some(([id]) => id === stageId)) state.openSections.er = true;
  if (ctStages.some(([id]) => id === stageId)) state.openSections.ct = true;
  go("timeline", caseId);
}

function editCaseScreen() {
  const item = currentCase();
  if (!item) return homeScreen();
  return h("section", {}, [
    title("Edit Case Details", `${item.id} | Timer continues in background`),
    h("form", {
      class: "form-card",
      novalidate: true,
      onsubmit: (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        item.patientName = form.get("patientName") || "Unnamed Patient";
        item.age = form.get("age") || "";
        item.gender = form.get("gender") || "";
        item.uhid = form.get("uhid") || "";
        item.suspicion = form.get("suspicion") || "Ischemic Stroke";
        item.nihssBreakdown = getNihssItems().reduce((scores, nihssItem) => {
          const value = form.get(`nihss_${nihssItem[0]}`);
          scores[nihssItem[0]] = value === "" ? "" : Number(value);
          return scores;
        }, {});
        item.nihss = form.get("nihss") || "";
        item.side = form.get("side") || "Unknown";
        item.territory = form.get("territory") || "Unknown";
        saveCases();
        go("timeline", item.id);
      }
    }, [
      field("Patient Name", h("input", { name: "patientName", placeholder: "Patient name", autocomplete: "off", value: item.patientName === "Unnamed Patient" ? "" : item.patientName })),
      h("div", { class: "desktop-two" }, [
        field("Age", select("age", ageOptions(), item.age || "50")),
        field("Gender", select("gender", ["Male", "Female", "Other"], item.gender || "Male"))
      ]),
      field("UHID (optional)", h("input", { name: "uhid", placeholder: "UHID", value: item.uhid || "" })),
      field("Stroke Suspicion", choiceButtons("suspicion", ["Ischemic Stroke", "LVO Suspected", "Hemorrhage", "Unknown"], item.suspicion || "Ischemic Stroke")),
      h("div", { class: "section-heading compact-heading" }, [h("h2", {}, "Clinical Snapshot")]),
      field("NIHSS Score", nihssCalculator(item.nihssBreakdown || {})),
      field("Side", choiceButtons("side", ["Left", "Right", "Bilateral", "Unknown"], item.side || "Unknown")),
      field("Suspected Territory", choiceButtons("territory", ["MCA", "ACA", "PCA", "Basilar", "Carotid", "Unknown"], item.territory || "Unknown")),
      h("button", { class: "primary-cta", type: "submit" }, "SAVE DETAILS"),
      h("button", { class: "secondary-btn", type: "button", onclick: () => go("timeline", item.id) }, "BACK TO TIMELINE")
    ])
  ]);
}

function timerCard(item) {
  const closed = Boolean(item.caseStopped || item.signedOffAt);
  const elapsed = formatDuration(caseEndTime(item).getTime() - new Date(item.arrivalTime).getTime());
  return h("div", { class: "timer-card" }, [
    h("div", { class: "timer-headline" }, [
      h("div", {}, [
        h("span", {}, closed ? "FINAL CASE DURATION" : "TOTAL ELAPSED TIME"),
        h("strong", {}, elapsed)
      ]),
      closed
        ? h("span", { class: `tag ${item.caseStopped ? "grey" : ""}` }, item.caseStopped ? "STOPPED" : "SIGNED OFF")
        : h("button", { class: "stop-case-btn", onclick: () => openStopCase(item.id) }, "STOP CASE")
    ]),
    h("div", { class: "timer-meta" }, [
      h("div", {}, `${item.id}`),
      h("div", {}, `${item.patientName} | ${item.age || "--"}/${shortGender(item.gender)}`)
    ]),
    h("div", { class: "clinical-strip" }, [
      h("button", { type: "button", onclick: () => go("edit", item.id), title: "Open NIHSS entry" }, `NIHSS ${item.nihss || "--"}`),
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
  const note = item.stageNotes?.[id] || "";
  const closed = Boolean(item.caseStopped || item.signedOffAt);
  return h("div", { class: "stage" }, [
    h("i", { class: `dot ${stage?.mode || ""}` }),
    h("div", {}, [
      h("div", { class: "stage-copy" }, [
        h("strong", {}, labelText),
        h("span", {}, stage ? `${formatClock(stage.time)}${stage.reason ? ` | ${stage.reason}` : ""}` : "Not yet recorded")
      ]),
      h("div", { class: "stage-actions" }, [
        h("button", { class: `record-btn ${stage ? "done" : ""}`, disabled: closed, onclick: () => recordStage(item.id, id, "auto") }, stage ? "RECORDED" : "RECORD NOW"),
        h("button", { class: "manual-btn", disabled: closed, onclick: () => openManual(item.id, id, labelText) }, "ENTER MANUAL TIME"),
        h("button", { class: `note-btn ${note ? "has-note" : ""}`, onclick: () => openNote(item.id, id, labelText) }, note ? "VIEW NOTE" : "NOTES")
      ]),
      note ? h("p", { class: "stage-note-preview" }, note) : null
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
      stageRow(item, "ivtConsent", "IVT Consent Taken"),
      stageRow(item, "ivtStarted", "IVT Started / Bolus Given"),
      item.ivt.eligible === "No" ? field("If IVT not given", select("notGivenReason", ["Outside window", "Hemorrhage", "Anticoagulant", "Family refusal", "Clinical decision", "Other"], item.ivt.notGivenReason, (value) => updateNested(item.id, "ivt", "notGivenReason", value))) : null,
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
      stageRow(item, "evtConsent", "EVT Consent Taken"),
      ...mtStages.map(([id, labelText]) => stageRow(item, id, labelText)),
      field("Final TICI Score", select("tici", ["", "0", "1", "2A", "2B", "2C", "3"], item.mt.tici, (value) => updateNested(item.id, "mt", "tici", value))),
      h("button", { class: "secondary-btn", onclick: () => go("timeline", item.id) }, "BACK TO TIMELINE")
    ])
  ]);
}

function summaryScreen() {
  const item = currentCase();
  if (!item) return homeScreen();
  const missing = signoffMissingItems(item);
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
    notesPanel(item),
    signoffPanel(item, missing),
    h("div", { class: "grid", style: "margin-top:14px" }, [
      h("button", { class: "primary-cta", onclick: () => go("timeline", item.id) }, "VIEW FULL TIMELINE"),
      h("button", { class: "secondary-btn", onclick: () => go("home") }, "BACK TO HOME")
    ])
  ]);
}

function signoffPanel(item, missing) {
  return h("form", {
    class: "signoff-card",
    onsubmit: (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      item.observerName = form.get("observerName").trim();
      item.caseComment = form.get("caseComment").trim();
      item.signoffAttempted = true;
      const currentMissing = signoffMissingItems(item);
      if (!currentMissing.length && !item.signedOffAt) item.signedOffAt = new Date().toISOString();
      saveCases();
      render();
    }
  }, [
    h("div", { class: "section-heading compact-heading" }, [h("h2", {}, "Final Sign-off")]),
    field("Data entered by", h("input", { name: "observerName", placeholder: "Name of observer / intern / coordinator", value: item.observerName || "" })),
    field("Overall case comments", h("textarea", { name: "caseComment", placeholder: "Add final comments about delays, clinical decision, consent, transfer, or pathway issues" }, item.caseComment || "")),
    missing.length
      ? h("div", { class: `missing-panel ${item.signoffAttempted ? "show" : ""}` }, [
          h("strong", {}, "Mandatory items pending"),
          ...missing.map((entry) => h("button", {
            type: "button",
            class: "pending-link",
            onclick: () => handlePendingClick(item.id, entry)
          }, entry.label))
        ])
      : h("div", { class: "complete-panel" }, item.signedOffAt ? `Signed off at ${formatClock(item.signedOffAt)}` : "All mandatory items completed"),
    h("button", { class: "primary-cta", type: "submit" }, item.signedOffAt ? "UPDATE SIGN-OFF" : "SIGN OFF CASE")
  ]);
}

function handlePendingClick(caseId, entry) {
  if (entry.type === "observer") {
    const input = document.querySelector("[name='observerName']");
    if (input) input.focus();
    return;
  }
  if (entry.type === "details") {
    go("edit", caseId);
    return;
  }
  if (entry.type === "stage") {
    state.openSections[entry.section] = true;
    go("timeline", caseId);
  }
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
    liveCasesPanel(),
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
    heading("Case Notes / Stop Reasons"),
    dashboardNotes(),
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
    title("More", "Configuration"),
    h("div", { class: "form-card" }, [
      metricCard("Storage", "Local PWA"),
      metricCard("Firestore", cloudSync.status),
      metricCard("Firebase project", cloudSync.projectId),
      metricCard("Last cloud sync", cloudSync.lastSyncAt ? formatClock(cloudSync.lastSyncAt) : "--"),
      metricCard("Centre", accessSettings.centreName),
      metricCard("This device", state.deviceRecord?.deviceCode || state.device.code),
      cloudSync.error ? metricCard("Sync error", cloudSync.error) : null,
      installButton(),
      state.installMessage ? h("div", { class: "install-help" }, state.installMessage) : null,
      h("button", { class: "secondary-btn", onclick: testCloudSync }, "TEST FIREBASE CONNECTION"),
      h("button", { class: "secondary-btn", onclick: exportCases }, "EXPORT CASES JSON"),
      h("button", { class: "danger-btn", style: "background:#fff0f0;color:#e5484d", onclick: clearCases }, "CLEAR LOCAL CASES")
    ]),
    state.adminUnlocked ? accessSettingsPanel() : adminUnlockPanel()
  ]);
}

function adminUnlockPanel() {
  return h("form", {
    class: "signoff-card access-card",
    onsubmit: (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      if (form.get("adminPin").trim() === accessSettings.adminPin) {
        state.adminUnlocked = true;
        state.adminMessage = "";
        state.settingsMessage = "";
        listenDeviceApprovals();
        render();
        return;
      }
      state.adminMessage = "Admin PIN is incorrect";
      render();
    }
  }, [
    h("div", { class: "section-heading compact-heading" }, [h("h2", {}, "Admin Settings")]),
    h("p", { class: "settings-help" }, "Enter admin PIN to view or change access settings."),
    field("Admin PIN", h("input", { name: "adminPin", type: "password", inputmode: "numeric", maxlength: "4", pattern: "[0-9]*", placeholder: "Enter admin PIN" })),
    state.adminMessage ? h("div", { class: "settings-message" }, state.adminMessage) : null,
    h("button", { class: "secondary-btn", type: "submit" }, "OPEN ADMIN SETTINGS")
  ]);
}

function accessSettingsPanel() {
  return h("form", {
    class: "signoff-card access-card",
    onsubmit: (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const centreName = form.get("centreName").trim();
      const newAdminPin = form.get("newAdminPin").trim();
      if (newAdminPin && !isFourDigitPin(newAdminPin)) {
        state.settingsMessage = "Admin PIN must be exactly 4 digits";
        render();
        return;
      }
      accessSettings = {
        ...accessSettings,
        centreName: centreName || accessSettings.centreName,
        adminPin: newAdminPin || accessSettings.adminPin,
        updatedAt: new Date().toISOString()
      };
      saveAccessSettings();
      state.settingsMessage = "Access settings updated";
      render();
    }
  }, [
    h("div", { class: "section-heading compact-heading" }, [h("h2", {}, "Access PIN Settings")]),
    h("p", { class: "settings-help" }, "Approved devices open directly. Admin PIN is only for admin settings and device approvals."),
    field("Centre name", h("input", { name: "centreName", value: accessSettings.centreName, placeholder: "Centre / hospital name" })),
    field("New admin PIN (optional)", h("input", { name: "newAdminPin", type: "password", inputmode: "numeric", maxlength: "4", pattern: "[0-9]*", placeholder: "Leave blank to keep current" })),
    state.settingsMessage ? h("div", { class: `settings-message ${state.settingsMessage.includes("updated") ? "ok" : ""}` }, state.settingsMessage) : null,
    h("button", { class: "secondary-btn", type: "button", onclick: () => { state.adminUnlocked = false; state.settingsMessage = ""; render(); } }, "CLOSE ADMIN SETTINGS"),
    h("button", { class: "primary-cta", type: "submit" }, "SAVE ACCESS SETTINGS"),
    adminDevicesPanel()
  ]);
}

function isFourDigitPin(value) {
  return /^\d{4}$/.test(value);
}

function installButton() {
  if (isStandaloneApp()) return metricCard("Installed app", "Ready");
  return h("button", { class: "install-btn", type: "button", onclick: installApp }, "INSTALL APP");
}

function isStandaloneApp() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function installApp() {
  if (state.deferredInstallPrompt) {
    const promptEvent = state.deferredInstallPrompt;
    state.deferredInstallPrompt = null;
    promptEvent.prompt();
    promptEvent.userChoice.then((choice) => {
      state.installMessage = choice.outcome === "accepted" ? "Installing Rajagiri Stroke Code..." : "";
      render();
    });
    return;
  }
  state.installMessage = "On iPhone: tap Share, then Add to Home Screen. On Android/Chrome: use browser menu, then Install app.";
  render();
}

function listenDeviceApprovals() {
  if (!cloudSync.enabled || !cloudSync.db || cloudSync.devicesListening) return;
  cloudSync.devicesListening = true;
  cloudSync.db.collection(DEVICE_COLLECTION).orderBy("lastSeenAt", "desc").onSnapshot((snapshot) => {
    state.devices = snapshot.docs.map((doc) => doc.data());
    render();
  }, (error) => {
    state.adminMessage = `${error.code || "error"}: Device list failed`;
    render();
  });
}

function adminDevicesPanel() {
  listenDeviceApprovals();
  const groups = [
    ["pending", "Pending Devices"],
    ["approved", "Approved Devices"],
    ["blocked", "Blocked Devices"]
  ];
  return h("div", { class: "admin-devices" }, [
    h("div", { class: "section-heading compact-heading" }, [h("h2", {}, "Admin Devices")]),
    h("p", { class: "settings-help" }, "Approve only phones or computers that should access Rajagiri Stroke Code."),
    ...groups.map(([status, label]) => {
      const devices = state.devices.filter((device) => (device.status || "pending") === status);
      return h("div", { class: "device-group" }, [
        h("h3", {}, `${label} (${devices.length})`),
        devices.length ? h("div", { class: "device-list" }, devices.map(deviceCard)) : h("p", { class: "muted-line" }, "None")
      ]);
    })
  ]);
}

function deviceCard(device) {
  const isThisDevice = device.deviceId === state.device.id;
  const status = device.status || "pending";
  return h("div", { class: `device-card device-${status}` }, [
    h("div", {}, [
      h("strong", {}, `${device.deviceCode || device.deviceId}${isThisDevice ? " (this device)" : ""}`),
      h("span", {}, `Status: ${status}`),
      h("span", {}, `First seen: ${device.firstSeenAt ? formatClock(device.firstSeenAt) : "--"}`),
      h("span", {}, `Last seen: ${device.lastSeenAt ? formatClock(device.lastSeenAt) : "--"}`)
    ]),
    h("div", { class: "device-actions" }, [
      status !== "approved" ? h("button", { type: "button", class: "record-btn", onclick: () => updateDeviceStatus(device.deviceId, "approved") }, "APPROVE") : null,
      status !== "blocked" ? h("button", { type: "button", class: "manual-btn", onclick: () => updateDeviceStatus(device.deviceId, "blocked") }, status === "approved" ? "REVOKE" : "BLOCK") : null,
      status === "blocked" ? h("button", { type: "button", class: "manual-btn", onclick: () => updateDeviceStatus(device.deviceId, "pending") }, "UNBLOCK") : null
    ])
  ]);
}

function updateDeviceStatus(deviceId, status) {
  if (!cloudSync.enabled || !cloudSync.db) return;
  const now = new Date().toISOString();
  const updates = { status, lastAdminActionAt: now };
  if (status === "approved") {
    updates.approvedAt = now;
    updates.blockedAt = "";
    updates.revokedAt = "";
  }
  if (status === "blocked") {
    updates.blockedAt = now;
    updates.revokedAt = now;
  }
  cloudSync.db.collection(DEVICE_COLLECTION).doc(deviceId).set(updates, { merge: true }).catch((error) => {
    state.adminMessage = `${error.code || "error"}: Device update failed`;
    render();
  });
}

function testCloudSync() {
  if (!cloudSync.enabled || !cloudSync.db) {
    cloudSync.status = cloudSync.status === "Local only" ? "Local only" : cloudSync.status;
    cloudSync.error = cloudSync.error || "Firebase is not connected in this browser";
    render();
    return;
  }
  const id = `diag-${Date.now()}`;
  cloudSync.status = "Testing cloud...";
  cloudSync.error = "";
  render();
  withTimeout(cloudSync.db.collection("_diagnostics").doc(id).set({
    app: "Rajagiri Stroke Code",
    createdAt: new Date().toISOString()
  }).then(() => cloudSync.db.collection("_diagnostics").doc(id).get()), 10000)
    .then((doc) => {
      cloudSync.status = doc.exists ? "Cloud sync on" : "Cloud sync error";
      cloudSync.error = doc.exists ? "" : "Diagnostic document was not readable";
      cloudSync.lastSyncAt = new Date().toISOString();
      render();
    })
    .catch((error) => {
      cloudSync.status = "Cloud sync error";
      cloudSync.error = `${error.code || "error"}: ${error.message || "Diagnostic write/read failed"}`;
      render();
    });
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timed out waiting for Firestore response. Use hosted HTTPS URL, check internet, and verify Firestore rules.")), ms);
    })
  ]);
}

function recordStage(caseId, stageId, mode, manualTime, reason = "") {
  const item = state.cases.find((entry) => entry.id === caseId);
  if (!item || item.caseStopped || item.signedOffAt) return;
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

function openNote(caseId, stageId, labelText) {
  state.noteTarget = { caseId, stageId, labelText };
  render();
}

function noteModal() {
  if (!state.noteTarget) return null;
  const target = state.noteTarget;
  const item = state.cases.find((entry) => entry.id === target.caseId);
  const currentNote = item?.stageNotes?.[target.stageId] || "";
  return h("div", { class: "modal-backdrop" }, [
    h("form", {
      class: "modal",
      onsubmit: (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const note = form.get("stageNote").trim();
        if (item) {
          item.stageNotes = item.stageNotes || {};
          if (note) item.stageNotes[target.stageId] = note;
          else delete item.stageNotes[target.stageId];
          saveCases();
        }
        state.noteTarget = null;
        render();
      }
    }, [
      h("h3", {}, `${target.labelText} Notes`),
      field("Comments", h("textarea", { name: "stageNote", placeholder: "Enter reason, delay details, or operational comment" }, currentNote)),
      h("div", { class: "modal-actions" }, [
        h("button", { type: "button", class: "secondary-btn", onclick: () => { state.noteTarget = null; render(); } }, "CANCEL"),
        h("button", { class: "record-btn", type: "submit" }, "SAVE NOTE")
      ])
    ])
  ]);
}

function openStopCase(caseId) {
  state.stopTarget = { caseId };
  render();
}

function stopModal() {
  if (!state.stopTarget) return null;
  const item = state.cases.find((entry) => entry.id === state.stopTarget.caseId);
  return h("div", { class: "modal-backdrop" }, [
    h("form", {
      class: "modal",
      onsubmit: (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        if (item) {
          item.caseStopped = true;
          item.caseStoppedAt = item.caseStoppedAt || new Date().toISOString();
          item.caseStoppedReason = form.get("caseStoppedReason");
          item.caseStoppedComment = form.get("caseStoppedComment").trim();
          saveCases();
        }
        state.stopTarget = null;
        render();
      }
    }, [
      h("h3", {}, "Stop Case Entry"),
      h("p", { class: "modal-help" }, "Use this only when the pathway is abandoned or no further stroke treatment is planned."),
      field("Reason", select("caseStoppedReason", ["Stroke mimic", "Hemorrhage", "No further treatment planned", "Patient unstable", "Family refused", "Shifted elsewhere", "Other"], item?.caseStoppedReason || "")),
      field("Comments", h("textarea", { name: "caseStoppedComment", placeholder: "Enter why the pathway was stopped" }, item?.caseStoppedComment || "")),
      h("div", { class: "modal-actions" }, [
        h("button", { type: "button", class: "secondary-btn", onclick: () => { state.stopTarget = null; render(); } }, "CANCEL"),
        h("button", { class: "danger-btn stop-confirm-btn", type: "submit" }, "STOP CASE")
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

function nihssCalculator(breakdown = {}) {
  const existingValues = Object.values(breakdown).filter((value) => value !== "" && value != null);
  const initialTotal = existingValues.reduce((sum, value) => sum + Number(value || 0), 0);
  const hasInitialScore = existingValues.length > 0;
  return h("div", { class: "nihss-card" }, [
    h("input", { type: "hidden", name: "nihss", value: hasInitialScore ? String(initialTotal) : "" }),
    h("div", { class: "nihss-total-card" }, [
      h("span", {}, "TOTAL NIHSS"),
      h("strong", { class: "nihss-total" }, hasInitialScore ? String(initialTotal) : "--"),
      h("em", { class: "nihss-category" }, hasInitialScore ? nihssCategory(initialTotal) : "Not scored"),
      h("button", { type: "button", class: "nihss-toggle", onclick: toggleNihssDetails }, "OPEN NIHSS DETAILS")
    ]),
    h("div", { class: "nihss-details", hidden: true }, nihssGroups.map((group) => h("div", { class: "nihss-group" }, [
      h("h3", {}, group.title),
      ...group.items.map(([id, label, options]) => h("label", { class: "nihss-item" }, [
        h("span", {}, label),
        h("select", { name: `nihss_${id}`, "data-nihss-item": id, onchange: updateNihssTotal }, [
          h("option", { value: "", selected: breakdown[id] === "" || breakdown[id] == null }, "Select"),
          ...options.map((option) => {
            const value = option.split(" ")[0];
            return h("option", { value, selected: String(breakdown[id]) === value }, option);
          })
        ])
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
  const inputs = Array.from(card.querySelectorAll("[data-nihss-item]"));
  const hasScore = inputs.some((input) => input.value !== "");
  const total = inputs.reduce((sum, input) => sum + Number(input.value || 0), 0);
  card.querySelector("[name='nihss']").value = hasScore ? String(total) : "";
  card.querySelector(".nihss-total").textContent = hasScore ? String(total) : "--";
  card.querySelector(".nihss-category").textContent = hasScore ? nihssCategory(total) : "Not scored";
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
  return h("div", { class: "screen-title" }, [h("h1", {}, head), sub ? h("p", {}, sub) : null]);
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
  const elapsed = formatDuration(caseEndTime(item).getTime() - new Date(item.arrivalTime).getTime());
  return h("button", { class: "case-row", onclick: () => go("timeline", item.id) }, [
    h("div", { class: "case-main" }, [
      h("strong", {}, `${item.id} - ${item.patientName}`),
      h("span", {}, `${elapsed} | ${item.suspicion}`)
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
    const noteCount = Object.values(item.stageNotes || {}).filter(Boolean).length + (item.caseComment ? 1 : 0) + (item.caseStoppedComment ? 1 : 0);
    return h("tr", {}, [
      h("td", {}, item.id),
      h("td", {}, item.patientName),
      h("td", {}, `${item.age || "--"}/${shortGender(item.gender)}`),
      h("td", {}, formatClock(item.arrivalTime)),
      h("td", {}, metricText(item, "doorCt")),
      h("td", {}, metricText(item, "doorGroin")),
      h("td", {}, metricText(item, "doorRecan")),
      h("td", {}, noteCount ? h("span", { class: "note-count" }, `${noteCount} note${noteCount === 1 ? "" : "s"}`) : "--"),
      h("td", {}, h("span", { class: `tag ${status.className}` }, status.label))
    ]);
  });
  return h("div", { class: "table-wrap" }, h("table", {}, [
    h("thead", {}, h("tr", {}, ["Case ID", "Patient Name", "Age/Gender", "Arrival Time", "Door -> CT", "Door -> Groin", "Door -> Recanalisation", "Notes", "Status"].map((text) => h("th", {}, text)))),
    h("tbody", {}, rows)
  ]));
}

function notesPanel(item) {
  const notes = Object.entries(item.stageNotes || {}).filter(([, note]) => note);
  if (!notes.length && !item.caseStoppedComment && !item.caseComment) return null;
  return h("div", { class: "notes-panel" }, [
    h("strong", {}, "Case Notes"),
    ...notes.map(([stageId, note]) => h("div", { class: "note-line" }, [
      h("span", {}, stageLabel(stageId)),
      h("p", {}, note)
    ])),
    item.caseStoppedComment ? h("div", { class: "note-line stop-note" }, [
      h("span", {}, `Stopped: ${item.caseStoppedReason || "Reason"}`),
      h("p", {}, item.caseStoppedComment)
    ]) : null,
    item.caseComment ? h("div", { class: "note-line" }, [
      h("span", {}, "Final Case Comment"),
      h("p", {}, item.caseComment)
    ]) : null
  ]);
}

function dashboardNotes() {
  const rows = state.cases
    .filter((item) => Object.values(item.stageNotes || {}).some(Boolean) || item.caseComment || item.caseStopped)
    .slice(0, 8);
  if (!rows.length) return empty("No notes or stopped cases yet.");
  return h("div", { class: "dashboard-notes" }, rows.map((item) => {
    const stageNotes = Object.entries(item.stageNotes || {}).filter(([, note]) => note);
    const preview = item.caseStopped
      ? `${item.caseStoppedReason || "Stopped"}${item.caseStoppedComment ? ` - ${item.caseStoppedComment}` : ""}`
      : item.caseComment || stageNotes[0]?.[1] || "";
    return h("button", { class: "dashboard-note-row", onclick: () => go("summary", item.id) }, [
      h("span", {}, item.id),
      h("strong", {}, item.patientName),
      h("p", {}, preview || "Notes added"),
      h("em", {}, item.caseStopped ? "Stopped" : `${stageNotes.length + (item.caseComment ? 1 : 0)} note${stageNotes.length + (item.caseComment ? 1 : 0) === 1 ? "" : "s"}`)
    ]);
  }));
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

function signoffMissingItems(item) {
  const missing = [];
  if (!item.observerName?.trim()) missing.push({ label: "Data entered by", type: "observer" });
  if (!item.patientName || item.patientName === "Unnamed Patient") missing.push({ label: "Patient Name", type: "details" });
  if (!item.suspicion) missing.push({ label: "Stroke Suspicion", type: "details" });
  signoffStageRequirements.forEach(([id, label, section]) => {
    if (!item.stages[id]?.time) missing.push({ label, type: "stage", stageId: id, section });
  });
  return missing;
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
  if (item.caseStopped) return { label: "Stopped", className: "grey" };
  if (item.signedOffAt) return { label: "Signed Off", className: "" };
  const values = metricDefs.slice(0, 6).map((def) => {
    const minutes = metricMinutes(item, def);
    return minutes == null ? null : metricStatus(minutes, def[4], def[5]).className;
  }).filter(Boolean);
  if (values.includes("red")) return { label: "Critical", className: "red" };
  if (values.includes("orange")) return { label: "Delayed", className: "orange" };
  return { label: "On Track", className: "" };
}

function caseEndTime(item) {
  if (item.caseStoppedAt) return new Date(item.caseStoppedAt);
  if (item.signedOffAt) return new Date(item.signedOffAt);
  return new Date();
}

function stageLabel(stageId) {
  const allStages = [...erStages, ...ctStages, ["ivtConsent", "IVT Consent Taken"], ["ivtStarted", "IVT Started / Bolus Given"], ["evtConsent", "EVT Consent Taken"], ...mtStages];
  return allStages.find(([id]) => id === stageId)?.[1] || stageId;
}

function todaysCases() {
  const today = new Date().toDateString();
  return state.cases.filter((item) => new Date(item.arrivalTime).toDateString() === today);
}

function liveCases() {
  const priority = { Critical: 0, Delayed: 1, "On Track": 2 };
  return state.cases
    .filter((item) => !item.caseStopped && !item.signedOffAt)
    .sort((a, b) => {
      const statusDiff = (priority[caseStatus(a).label] ?? 3) - (priority[caseStatus(b).label] ?? 3);
      if (statusDiff) return statusDiff;
      return new Date(a.arrivalTime) - new Date(b.arrivalTime);
    });
}

function nextCaseId() {
  const now = new Date();
  const day = now.toISOString().slice(2, 10).replaceAll("-", "");
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map((value) => String(value).padStart(2, "0")).join("");
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `SC-${day}-${time}-${suffix}`;
}

function ivtStatus(item) {
  if (item.stages.ivtStarted) return "Completed";
  if (item.ivt.eligible || item.stages.ivtConsent || item.ivt.consent) return "In Progress";
  return "Not Recorded";
}

function mtStatus(item) {
  if (item.stages.recanalisation) return "Completed";
  if (item.stages.evtConsent || item.mt.evtConsent || mtStages.some(([id]) => item.stages[id])) return "In progress";
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
