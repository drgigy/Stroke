const STORAGE_KEY = "rajagiri-strokecode-cases-v1";
const DEVICE_ID_KEY = "rajagiri-strokecode-device-id-v1";
const DEVICE_CODE_KEY = "rajagiri-strokecode-device-code-v1";
const DEVICE_COOKIE_ID = "rsc_device_id";
const DEVICE_COOKIE_CODE = "rsc_device_code";
const ACCESS_SETTINGS_KEY = "rajagiri-strokecode-access-v1";
const KPI_ADMIN_KEY = "rajagiri-strokecode-kpi-admin-v1";
const FIRESTORE_COLLECTION = "strokeCases";
const DEVICE_COLLECTION = "deviceApprovals";
const DASHBOARD_PRINT_PAGE_SIZE = 15;
const defaultAccessSettings = {
  centreName: "Rajagiri Hospital",
  adminPin: "9999",
  updatedAt: ""
};

const admittingConsultants = [
  ["not-admitted", "Not admitted", "NA"],
  ["gigy-kuruttukulam", "Dr Gigy Kuruttukulam", "GG"],
  ["pratheep-kottam", "Dr Pratheep Kottam", "PK"],
  ["jithin-bose", "Dr Jithin Bose", "JB"],
  ["nimish-vijayakumar", "Dr Nimish Vijayakumar", "NV"],
  ["suneesh-er", "Dr Suneesh ER", "SE"],
  ["arjun-chacko", "Dr Arjun Chacko", "AC"],
  ["jagathlal-gangadharan", "Dr Jagathlal Gangadharan", "JG"],
  ["manoj-narayana-panicker", "Dr Manoj Narayana Panicker", "MN"],
  ["sreeram-prasad", "Dr Sreeram Prasad", "SP"]
];

const imagingModalityOptions = [
  "CT Brain",
  "CT Brain + CT Angiography",
  "MRI Brain Screening",
  "MRI Brain + MR Angiography"
];

const erStages = [
  ["arrival", "Arrival at ER"],
  ["codeStroke", "Code Stroke Activated"],
  ["neuroInformed", "Neurology Informed"],
  ["initialOrders", "Completed Neurological Examination"],
  ["dysphagiaScreening", "Initial Dysphagia Screening Completed"],
  ["ctInformed", "Brain Imaging Requested"],
  ["shiftToCt", "Shift to Imaging"]
];

const ctStages = [
  ["reachedCt", "Reached CT"],
  ["ncctStarted", "First Brain Imaging / NCCT Started"],
  ["ncctCompleted", "NCCT Completed"],
  ["ctaStarted", "CT Angiography Started"],
  ["ctaCompleted", "CT Angiography Completed"],
  ["imagingReviewed", "Imaging Reviewed"]
];

const mriStages = [
  ["shiftToMri", "Shift to MRI"],
  ["reachedMri", "Reached MRI"],
  ["mriStarted", "MRI Started"],
  ["mriCompleted", "MRI Completed"],
  ["mraStarted", "MR Angiography Started"],
  ["mraCompleted", "MR Angiography Completed"],
  ["mriImagingReviewed", "Imaging Reviewed"]
];

const wardStages = [
  ["strokeUnitAdmission", "Admitted to Stroke Unit"],
  ["physiotherapyAssessment", "Physiotherapy / Rehabilitation Assessment"],
  ["speechTherapyAssessment", "Speech Therapy Dysphagia Reassessment"],
  ["strokeUnitDischarge", "Discharged from Stroke Unit"],
  ["hospitalDischarge", "Hospital Discharge"]
];

const mtStages = [
  ["cathlabInformed", "Cathlab Informed"],
  ["shiftedCathlab", "Shifted to Cathlab"],
  ["reachedCathlab", "Reached Cathlab"],
  ["cathlabReady", "Cathlab Ready"],
  ["groinPuncture", "Groin Puncture"],
  ["firstPass", "First Pass"],
  ["recanalisation", "Recanalisation Achieved"]
];

const metricDefs = [
  ["doorCt", "Door -> First Brain Imaging", "arrival", "firstImagingStarted", 25, 35],
  ["doorImaging", "Door -> Imaging Review", "arrival", "firstImagingReviewed", 45, 60],
  ["doorIvt", "Door -> IVT Started", "arrival", "ivtStarted", 45, 60],
  ["doorCathlab", "Door -> Cathlab", "arrival", "reachedCathlab", 70, 90],
  ["doorGroin", "Door -> Groin Puncture", "arrival", "groinPuncture", 90, 120],
  ["doorRecan", "Door -> Recanalisation", "arrival", "recanalisation", 150, 180],
  ["ctGroin", "First Imaging -> Groin Puncture", "firstImagingStarted", "groinPuncture", 75, 100],
  ["groinRecan", "Groin -> Recanalisation", "groinPuncture", "recanalisation", 60, 90]
];

const delayReasons = ["Transfer Delay", "Notification Delay", "CT Busy", "Consent Delay", "Cathlab Delay", "Other"];
const manualReasons = ["Missed entry", "Observer delayed", "Retrospective correction", "Network issue", "Other"];
const evtNotPerformedReasons = [
  "Clinical improvement",
  "No treatable occlusion",
  "Unfavourable imaging",
  "Vessel recanalised",
  "Consent declined",
  "Technical / logistical limitation",
  "Other"
];
const kpiTimestampFields = [
  ["hospitalAdmissionTime", "Hospital Admission Time"],
  ["strokeRecognitionTime", "Stroke Recognition Time (for Inpatient Stroke)"],
  ["physiotherapyAssessmentTime", "Physiotherapy Assessment Time"],
  ["speechTherapyAssessmentTime", "Speech Therapy Assessment Time"],
  ["dischargeTime", "Discharge Time"],
  ["diagnosticImagingRequestTime", "Diagnostic Imaging Request Time"],
  ["diagnosticImagingPresentationTime", "Presented to Imaging Service Time"],
  ["diagnosticImagingStartTime", "Diagnostic Imaging Start Time"],
  ["strokeUnitAdmissionTime", "Stroke Unit Admission Time"],
  ["strokeUnitDischargeTime", "Stroke Unit Discharge Time"],
  ["sichAfterIvtTime", "sICH Event Time after IVT"],
  ["sichAfterEvtTime", "sICH Event Time after EVT"],
  ["deathTime", "Date and Time of Death"],
  ["carotidProcedureTime", "CEA/Carotid Procedure Time"],
  ["carotidStrokeDeathTime", "Stroke/Death Time after CEA/Carotid Procedure"],
  ["diagnosticAngiographyTime", "Diagnostic Cerebral Angiography Time"],
  ["diagnosticAngiographyStrokeDeathTime", "Stroke/Death Time after Diagnostic Angiography"],
  ["intracranialProcedureTime", "Intracranial Angioplasty/Stenting Time"],
  ["intracranialStrokeDeathTime", "Stroke/Death Time after Intracranial Procedure"]
];
const timelineSyncedKpiTimestampKeys = new Set([
  "strokeRecognitionTime",
  "diagnosticImagingRequestTime",
  "diagnosticImagingPresentationTime"
]);
const kpiYesNoFields = [
  ["evtIndicated", "EVT Indicated"],
  ["largeVesselOcclusion", "Large Vessel Occlusion"],
  ["ivtGiven", "IV Thrombolysis Given"],
  ["evtPerformed", "EVT Performed"],
  ["sichAfterIvt", "Symptomatic Intracranial Hemorrhage after IVT"],
  ["sichAfterIvtNihssIncrease", "NIHSS Deterioration of 4 or More after IVT"],
  ["sichAfterIvtImagingConfirmed", "Hemorrhage Confirmed on Imaging after IVT"],
  ["sichAfterEvt", "Symptomatic Intracranial Hemorrhage after EVT"],
  ["sichAfterEvtNihssIncrease", "NIHSS Deterioration of 4 or More after EVT"],
  ["sichAfterEvtImagingConfirmed", "Hemorrhage Confirmed on Imaging after EVT"],
  ["medicationError", "Medication Error"],
  ["deathWithin7Days", "Death within 7 Days of Admission"],
  ["deathInHospital", "Death Occurred in Hospital"],
  ["ceaPerformed", "CEA Performed"],
  ["carotidAngioplastyStentingPerformed", "Carotid Angioplasty/Stenting Performed"],
  ["strokeDeath30DaysAfterCea", "Stroke or Death within 30 Days after CEA/Carotid Procedure"],
  ["diagnosticAngiographyPerformed", "Diagnostic Cerebral Angiography Performed"],
  ["strokeDeath24HoursAfterAngiography", "Stroke or Death within 24 Hours after Diagnostic Angiography"],
  ["intracranialAngioplastyStentingPerformed", "Intracranial Angioplasty/Stenting Performed"],
  ["strokeDeath30DaysAfterAngioplastyStenting", "Stroke or Death within 30 Days after Intracranial Angioplasty/Stenting"],
  ["evdInserted", "EVD Inserted"],
  ["ventriculitisAfterEvd", "Ventriculitis after EVD"],
  ["dvtAfterAdmission", "Deep Venous Thrombosis after Admission"],
  ["pressureUlcerNewWorsening", "New/Worsening Pressure Ulcer after Admission"],
  ["patientFall", "Patient Fall"],
  ["diagnosticImagingPerformed", "Diagnostic Imaging Performed"],
  ["intraArterialThrombolysis", "Intra-Arterial Thrombolysis Performed"],
  ["rehabilitationRequired", "Rehabilitation Required"],
  ["rehabilitationProvided", "Rehabilitation Provided"],
  ["followup90DayCompleted", "90-Day Follow-up Completed"]
];
const workflowKpiKeys = new Set(["evtIndicated", "largeVesselOcclusion", "ivtGiven", "evtPerformed"]);
const kpiAnswerOptions = ["Yes", "No", "Pending", "Not applicable"];
const kpiNumberFields = [
  ["patientFallCount", "Number of Patient Falls", "0"],
  ["medicationErrorCount", "Number of Medication Errors", "0"]
];
const kpiScoreFields = [
  ["strokePresentationType", "Stroke Presentation Type", ["", "ER arrival", "Inpatient stroke"]],
  ["mrsDischarge", "Modified Rankin Score at Discharge", ["", "0", "1", "2", "3", "4", "5", "6"]],
  ["mrs90Days", "Modified Rankin Score at 90 Days", ["", "0", "1", "2", "3", "4", "5", "6"]],
  ["evtArrivalType", "EVT Arrival Type", ["", "Direct arrival", "Transfer"]],
  ["pressureUlcerStage", "Pressure Ulcer Stage", ["", "No ulcer", "Stage 1", "Stage 2", "Stage 3", "Stage 4", "Unstageable", "Deep tissue injury"]]
];
const kpiAdminDefaults = {
  medicationErrorOpportunities: "",
  thrombolyticStockouts: "",
  thrombolyticFormularyDrugs: ""
};
const signoffStageRequirements = [
  ["arrival", "Arrival at ER", "er"],
  ["codeStroke", "Code Stroke Activated", "er"],
  ["neuroInformed", "Neurology Informed", "er"],
  ["ctInformed", "Brain Imaging Requested", "er"],
  ["shiftToCt", "Shift to Imaging", "er"]
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
  openSections: { er: true, ct: true, ward: false },
  manualTarget: null,
  noteTarget: null,
  stopTarget: null,
  kpiTarget: null,
  device: loadDeviceIdentity(),
  deviceStatus: "checking",
  deviceRecord: null,
  deviceRequestDraft: {},
  devices: [],
  adminUnlocked: false,
  authError: "",
  settingsMessage: "",
  adminMessage: "",
  installMessage: "",
  deferredInstallPrompt: null,
  kpiAdminMonth: monthKey(new Date()),
  kpiAdminData: loadKpiAdminData(),
  kpiView: "summary",
  kpiDrilldownNo: null,
  kpiRangePreset: "month",
  kpiRangeStart: dateInputValue(startOfMonth(new Date())),
  kpiRangeEnd: dateInputValue(new Date()),
  analysisMode: "menu",
  analysisSlide: 0,
  casesRangeMode: "month",
  casesKpiOnly: false,
  casesIvtOnly: false,
  casesMtOnly: false,
  casesDoctorFilterOpen: false,
  casesDoctorFilters: [],
  casesMonth: monthKey(new Date()),
  casesRangeStart: dateInputValue(startOfMonth(new Date())),
  casesRangeEnd: dateInputValue(new Date()),
  dashboardCasesRangeMode: "month",
  dashboardCasesRangeStart: dateInputValue(startOfMonth(new Date())),
  dashboardCasesRangeEnd: dateInputValue(new Date()),
  dashboardKpiOnly: false,
  dashboardIvtOnly: false,
  dashboardMtOnly: false,
  dashboardDoctorFilterOpen: false,
  dashboardDoctorFilters: [],
  dashboardNotesRangeMode: "month",
  dashboardNotesRangeStart: dateInputValue(startOfMonth(new Date())),
  dashboardNotesRangeEnd: dateInputValue(new Date()),
  selectedKpiNo: 1,
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
  if (state.deviceStatus === "approved" && ["timeline", "home"].includes(state.view) && !state.manualTarget && !state.noteTarget && !state.stopTarget && !state.kpiTarget) render();
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

window.addEventListener("keydown", (event) => {
  if (state.view !== "analysis" || state.analysisMode !== "kpi") return;
  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
  const total = buildNabhKpiReport(kpiIncludedCases(casesForRange(selectedKpiRange().start, selectedKpiRange().end)), kpiAdminForRange(selectedKpiRange().start, selectedKpiRange().end)).length;
  if (!total) return;
  event.preventDefault();
  state.analysisSlide = event.key === "ArrowRight"
    ? Math.min(total - 1, state.analysisSlide + 1)
    : Math.max(0, state.analysisSlide - 1);
  render();
});

document.addEventListener("fullscreenchange", () => {
  if (state.view === "analysis" && state.analysisMode === "kpi") render();
});

document.addEventListener("webkitfullscreenchange", () => {
  if (state.view === "analysis" && state.analysisMode === "kpi") render();
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

function loadKpiAdminData() {
  try {
    return JSON.parse(localStorage.getItem(KPI_ADMIN_KEY)) || {};
  } catch {
    return {};
  }
}

function saveKpiAdminData() {
  localStorage.setItem(KPI_ADMIN_KEY, JSON.stringify(state.kpiAdminData));
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
        doctorName: "",
        department: "",
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
    node.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  });
  return node;
}

function render() {
  const app = document.querySelector("#app");
  const active = document.activeElement;
  if (state.deviceStatus !== "approved" && active?.closest?.(".device-request-form")) return;
  app.innerHTML = "";
  if (state.deviceStatus !== "approved") {
    app.appendChild(h("main", { class: "app-shell lock-shell" }, deviceApprovalScreen()));
    return;
  }
  app.appendChild(h("main", { class: `app-shell ${state.view === "dashboard" ? "dashboard-wide" : ""}` }, [topbar(), screen(), bottomNav(), manualModal(), noteModal(), stopModal(), kpiModal()]));
}

function deviceApprovalScreen() {
  const status = state.deviceStatus;
  const record = state.deviceRecord || {};
  const pending = !["blocked", "error"].includes(status);
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
          : "Enter the user details and share this code with admin. The app will open automatically after approval."),
      pending ? deviceRequestForm(record) : null,
      cloudSync.error ? h("div", { class: "settings-message" }, cloudSync.error) : null,
      installButton(),
      state.installMessage ? h("div", { class: "install-help" }, state.installMessage) : null,
      h("button", { class: "secondary-btn", type: "button", onclick: () => { initCloudSync(); render(); } }, "CHECK AGAIN")
    ])
  ]);
}

function deviceRequestForm(record) {
  const draft = { ...record, ...state.deviceRequestDraft };
  return h("form", {
    class: "device-request-form",
    onsubmit: (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      saveDeviceRequestDetails({
        doctorName: form.get("doctorName").trim(),
        department: form.get("department").trim(),
        deviceLabel: form.get("deviceLabel").trim()
      });
    }
  }, [
    field("Doctor / user name", h("input", {
      name: "doctorName",
      value: draft.doctorName || "",
      required: true,
      autocomplete: "name",
      oninput: (event) => { state.deviceRequestDraft.doctorName = event.target.value; }
    })),
    field("Department / role", h("input", {
      name: "department",
      value: draft.department || "",
      required: true,
      oninput: (event) => { state.deviceRequestDraft.department = event.target.value; }
    })),
    field("Device name", h("input", {
      name: "deviceLabel",
      value: draft.deviceLabel || "",
      oninput: (event) => { state.deviceRequestDraft.deviceLabel = event.target.value; }
    })),
    h("button", { class: "primary-cta", type: "submit" }, record.doctorName || record.department ? "UPDATE APPROVAL REQUEST" : "SEND APPROVAL REQUEST")
  ]);
}

function saveDeviceRequestDetails(details) {
  if (!cloudSync.enabled || !cloudSync.db) return;
  if (!details.doctorName || !details.department) {
    cloudSync.error = "Doctor / user name and department are required";
    render();
    return;
  }
  const now = new Date().toISOString();
  cloudSync.db.collection(DEVICE_COLLECTION).doc(state.device.id).set({
    deviceId: state.device.id,
    deviceCode: state.device.code,
    doctorName: details.doctorName,
    department: details.department,
    deviceLabel: details.deviceLabel,
    status: state.deviceRecord?.status || "pending",
    requestUpdatedAt: now,
    lastSeenAt: now
  }, { merge: true }).then(() => {
    cloudSync.error = "";
    state.deviceRequestDraft = {};
  }).catch((error) => {
    cloudSync.error = `${error.code || "error"}: Device approval request failed`;
    render();
  });
}

function topbar() {
  const active = currentCase();
  const context = topbarContext();
  return h("header", { class: "topbar" }, [
    h("div", { class: "brand" }, [
      h("div", { class: "brand-mark" }, "SC"),
      h("div", {}, [h("h1", {}, "Rajagiri Stroke Code")])
    ]),
    context ? h("div", { class: "topbar-context" }, [
      h("strong", {}, context.title),
      context.sub ? h("span", {}, context.sub) : null
    ]) : null,
    active ? h("span", { class: `tag ${caseStatus(active).className}` }, caseStatus(active).label) : null
  ]);
}

function topbarContext() {
  if (state.view === "cases") return { title: "Cases" };
  if (state.view === "dashboard") return { title: "Dashboard" };
  if (state.view === "analysis") return { title: "Analysis" };
  if (state.view === "kpi") {
    const range = selectedKpiRange();
    return { title: "NABH KPI Analysis", sub: `Reporting period: ${formatReportDate(range.start)} to ${formatReportDate(range.end)}` };
  }
  return null;
}

function bottomNav() {
  return h("nav", { class: "bottom-nav" }, [
    navButton("home", "Home"),
    navButton("cases", "Cases"),
    navButton("dashboard", "Dashboard"),
    navButton("kpi", "KPI"),
    navButton("analysis", "Analysis"),
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
  if (state.view === "kpi") return kpiScreen();
  if (state.view === "analysis") return analysisScreen();
  if (state.view === "cases") return casesScreen();
  if (state.view === "more") return moreScreen();
  return homeScreen();
}

function go(view, caseId) {
  if (view === "analysis" && state.view !== "analysis") {
    state.analysisMode = "menu";
    state.analysisSlide = 0;
  }
  state.view = view;
  if (caseId) state.activeCaseId = caseId;
  render();
}

function currentCase() {
  return state.cases.find((item) => item.id === state.activeCaseId) || state.cases[0];
}

function homeScreen() {
  return h("section", {}, [
    h("button", { class: "primary-cta", onclick: () => go("create") }, "START NEW CODE 7 CASE"),
    liveCasesPanel()
  ]);
}

function createScreen() {
  const now = toLocalInput(new Date());
  return h("section", {}, [
    title("Create Code 7 Case", ""),
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
          mri: { needed: "" },
          mt: { evtConsent: "", tici: "", notPerformedReason: "" },
          kpi: {
            ...defaultKpiData(),
            strokePresentationType: form.get("strokePresentationType") || "ER arrival",
            hospitalAdmissionTime: arrival
          },
          stageNotes: {},
          imagingModalities: [],
          delayReason: "",
          caseComment: "",
          caseStopped: false,
          caseStoppedAt: "",
          caseStoppedReason: "",
          caseStoppedComment: "",
          centreName: accessSettings.centreName,
          observerName: "",
          admittingConsultant: "",
          includeInCodeStrokeKpi: "",
          signedOffAt: "",
          signedOffUpdatedAt: "",
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
      field("Stroke Presentation Type", choiceButtons("strokePresentationType", ["ER arrival", "Inpatient stroke"], "ER arrival")),
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
    erAccordion(item),
    imagingPhaseAccordion("ct", "SECTION 2 - CT PHASE", ctStages, item),
    mriAccordion(item),
    accordion("ward", "SECTION 4 - WARD / DISCHARGE", wardStages, item),
    h("div", { class: "section-card" }, [
      pathwayCard("IV THROMBOLYSIS", ivtStatus(item), () => go("ivt", item.id)),
      pathwayCard("MECHANICAL THROMBECTOMY", mtStatus(item), () => go("mt", item.id))
    ]),
    h("button", { class: "primary-cta", onclick: () => go("summary", item.id) }, "VIEW CASE SUMMARY")
  ]);
}

function liveTracker(item, placement = "compact") {
  const imagingLabel = trackerImagingShortLabel(item);
  const trackerSteps = [
    ["arrival", "Door", "ER"],
    ["codeStroke", "Code", "ER"],
    ["neuroInformed", "Neuro", "ER"],
    ["shiftToCt", "To Imaging", "ER"],
    ["firstImagingReached", "Reached Imaging", imagingLabel],
    ["firstImagingStarted", "First Brain Imaging", imagingLabel],
    ["firstImagingReviewed", "Imaging Reviewed", imagingLabel],
    ["ivtStarted", "IVT", "Rx"],
    ["reachedCathlab", "Cathlab", "MT"],
    ["groinPuncture", "Groin", "MT"],
    ["recanalisation", "Recan", "MT"]
  ];
  const completed = trackerSteps.filter(([id]) => trackerStageResolved(item, id)).length;
  const percent = Math.round((completed / trackerSteps.length) * 100);
  const nextStep = trackerSteps.find(([id]) => !trackerStageResolved(item, id));
  const elapsed = formatDuration(caseEndTime(item).getTime() - new Date(item.arrivalTime).getTime());
  const status = caseStatus(item);
  return h("div", { class: `tracker-card ${placement === "dashboard" ? "dashboard-tracker" : ""} ${status.className ? `tracker-${status.className}` : ""}` }, [
    h("div", { class: "tracker-head" }, [
      h("div", {}, [
        h("strong", {}, item.patientName),
        h("small", {}, item.caseStopped ? `Stopped: ${item.caseStoppedReason || "Reason pending"}` : item.signedOffAt ? "Case signed off" : nextStep ? `Next: ${nextStep[1]}` : "Pathway complete")
      ]),
      h("div", { class: "tracker-score" }, [
        h("em", {}, elapsed),
        h("span", {}, item.caseStopped || item.signedOffAt ? "Final duration" : status.label)
      ])
    ]),
    h("div", { class: "tracker-progress" }, h("i", { style: `width:${percent}%` })),
    h("div", { class: "tracker-rail" }, trackerSteps.map(([id, label, group], index) => {
      const skipped = trackerStageSkipped(item, id);
      const stepTime = trackerStageTime(item, id);
      const done = Boolean(stepTime) && !skipped;
      const current = !done && !skipped && nextStep?.[0] === id;
      return h("button", {
        type: "button",
        class: `tracker-step ${done ? "done" : ""} ${skipped ? "skipped" : ""} ${current ? "current" : ""}`,
        onclick: () => jumpToTrackerStep(item.id, id)
      }, [
        h("b", {}, done ? "OK" : skipped ? "N/A" : String(index + 1)),
        h("span", {}, label),
        h("small", {}, done ? formatClock(stepTime) : skipped ? "Skipped" : group)
      ]);
    }))
  ]);
}

function trackerImagingShortLabel(item) {
  const profile = imagingProfile(item);
  if (profile.ct && profile.mri) return "CT/MRI";
  if (profile.ct) return "CT";
  if (profile.mri) return "MRI";
  const selected = selectedImagingModalities(item);
  if (selected.some((entry) => entry.includes("CT")) && selected.some((entry) => entry.includes("MRI"))) return "CT/MRI";
  if (selected.some((entry) => entry.includes("CT"))) return "CT";
  if (selected.some((entry) => entry.includes("MRI"))) return "MRI";
  return "IMG";
}

function trackerStageSkipped(item, stageId) {
  if (stageId === "ivtStarted") return isIvtSkipped(item);
  if (["reachedCathlab", "groinPuncture", "recanalisation"].includes(stageId)) {
    const workflow = mtWorkflowState(item);
    return workflow.indicated === "No" || workflow.performed === "No";
  }
  if (["firstImagingReached", "firstImagingStarted", "firstImagingReviewed"].includes(stageId)) {
    const selected = selectedImagingModalities(item);
    return selected.length > 0 && !imagingProfile(item).ct && !imagingProfile(item).mri;
  }
  return false;
}

function trackerStageTime(item, stageId) {
  if (stageId === "firstImagingReached") return firstRecordedTime(item, ["reachedCt", "reachedMri"]);
  if (stageId === "firstImagingStarted") return firstBrainImagingStartTime(item);
  if (stageId === "firstImagingReviewed") return firstRecordedTime(item, ["imagingReviewed", "mriImagingReviewed"]);
  return stageTime(item, stageId);
}

function trackerStageResolved(item, stageId) {
  return Boolean(trackerStageTime(item, stageId)) || trackerStageSkipped(item, stageId);
}

function liveCasesPanel() {
  const items = liveCases();
  return h("div", { class: "live-cases-stack" }, [
    h("div", { class: "section-heading compact-heading live-heading" }, [
      h("h2", {}, "Live Stroke Cases"),
      h("span", { class: "tag grey" }, `${items.length} active`)
    ]),
    items.length ? h("div", { class: "live-case-list" }, items.map(liveCaseBlock)) : empty("No active live stroke cases.")
  ]);
}

function liveCaseBlock(item) {
  return h("article", { class: "live-case-block" }, [
    liveTracker(item, "dashboard"),
    liveCaseDetails(item)
  ]);
}

function liveCaseDetails(item) {
  const recordedCount = Object.values(item.stages || {}).filter((stage) => stage?.time).length;
  const mtWorkflow = mtWorkflowState(item);
  const liveMtStages = mtWorkflow.indicated === "No"
    ? []
    : mtWorkflow.performed === "Yes"
      ? [["evtConsent", "EVT Consent Taken"], ...mtStages]
      : [["evtConsent", "EVT Consent Taken"], ["cathlabInformed", "Cathlab Informed"]];
  const stageGroups = [
    ["ER Phase", erStages],
    ...(imagingProfile(item).ct ? [["CT Phase", ctStages]] : []),
    ...(imagingProfile(item).mri ? [["MRI Phase", mriStages]] : []),
    ["Ward / Discharge", wardStages],
    ["IV Thrombolysis", [["ivtConsent", "IVT Consent Taken"], ["ivtStarted", "IVT Started / Bolus Given"]]],
    ...(liveMtStages.length ? [["Mechanical Thrombectomy", liveMtStages]] : [])
  ];
  return h("details", { class: "live-case-details", open: true }, [
    h("summary", {}, [
      h("strong", {}, "Active Case Details"),
      h("span", {}, `${recordedCount} timing${recordedCount === 1 ? "" : "s"} recorded`)
    ]),
    h("div", { class: "live-detail-body" }, [
      h("div", { class: "live-patient-grid" }, [
        liveDetailValue("Patient", item.patientName),
        liveDetailValue("Age / Gender", `${item.age || "--"} / ${shortGender(item.gender)}`),
        liveDetailValue("Arrival", formatCaseDateTime(item.arrivalTime)),
        liveDetailValue("Suspicion", item.suspicion || "Unknown"),
        liveDetailValue("NIHSS", item.nihss || "Not recorded"),
        liveDetailValue("Side / Territory", `${item.side || "Unknown"} / ${item.territory || "Unknown"}`),
        liveDetailValue("Imaging Plan", selectedImagingModalities(item).join(", ") || "Not selected"),
        liveDetailValue("IVT", ivtStatus(item)),
        liveDetailValue("Thrombectomy", mtStatus(item))
      ]),
      h("div", { class: "live-metric-grid" }, metricDefs.map((def) => {
        const minutes = metricMinutes(item, def);
        return liveDetailValue(def[1], metricNotApplicable(item, def[0]) ? "Not applicable" : minutes == null ? "Pending" : `${minutes} min`);
      })),
      h("div", { class: "live-phase-grid" }, stageGroups.map(([label, stages]) => liveStageGroup(item, label, stages))),
      liveCaseNotes(item),
      h("button", { class: "secondary-btn live-open-timeline", onclick: () => go("timeline", item.id) }, "OPEN FULL TIMELINE")
    ])
  ]);
}

function liveDetailValue(label, value) {
  return h("div", { class: "live-detail-value" }, [
    h("span", {}, label),
    h("strong", {}, String(value || "--"))
  ]);
}

function liveStageGroup(item, label, stages) {
  return h("section", { class: "live-phase-group" }, [
    h("h3", {}, label),
    ...stages.map(([id, stageName]) => {
      const stage = item.stages?.[id];
      const note = item.stageNotes?.[id] || "";
      const value = stage?.notApplicable ? "Not applicable" : stage?.time ? formatClock(stage.time) : "Pending";
      return h("div", { class: `live-stage-line ${stage?.time ? "recorded" : ""} ${stage?.notApplicable ? "not-applicable" : ""}` }, [
        h("span", {}, stageName),
        h("strong", {}, value),
        note ? h("small", {}, note) : null
      ]);
    })
  ]);
}

function liveCaseNotes(item) {
  const notes = Object.entries(item.stageNotes || {}).filter(([, note]) => note);
  if (!notes.length && !item.caseComment) {
    return h("div", { class: "live-notes-panel empty-notes" }, "No notes or overall case comments entered.");
  }
  return h("div", { class: "live-notes-panel" }, [
    h("h3", {}, "Notes and Comments"),
    ...notes.map(([stageId, note]) => h("div", {}, [
      h("strong", {}, stageLabel(stageId)),
      h("p", {}, note)
    ])),
    item.caseComment ? h("div", {}, [
      h("strong", {}, "Overall Case Comments"),
      h("p", {}, item.caseComment)
    ]) : null
  ]);
}

function jumpToTrackerStep(caseId, stageId) {
  if (stageId === "ivtStarted") {
    go("ivt", caseId);
    return;
  }
  if (mtStages.some(([id]) => id === stageId)) {
    go("mt", caseId);
    return;
  }
  if (["firstImagingReached", "firstImagingStarted", "firstImagingReviewed"].includes(stageId)) {
    const item = state.cases.find((entry) => entry.id === caseId);
    const profile = item ? imagingProfile(item) : { ct: true, mri: false };
    if (profile.ct) state.openSections.ct = true;
    else if (profile.mri) state.openSections.mri = true;
    go("timeline", caseId);
    return;
  }
  if (erStages.some(([id]) => id === stageId)) state.openSections.er = true;
  if (ctStages.some(([id]) => id === stageId)) state.openSections.ct = true;
  if (mriStages.some(([id]) => id === stageId)) state.openSections.mri = true;
  if (wardStages.some(([id]) => id === stageId)) state.openSections.ward = true;
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
        item.kpi = { ...defaultKpiData(), ...(item.kpi || {}), strokePresentationType: form.get("strokePresentationType") || "ER arrival" };
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
      field("Stroke Presentation Type", choiceButtons("strokePresentationType", ["ER arrival", "Inpatient stroke"], kpiValue(item, "strokePresentationType") || "ER arrival")),
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

function erAccordion(item) {
  const open = state.openSections.er;
  return h("div", { class: "section-card" }, [
    h("button", {
      class: "accordion-head",
      onclick: () => {
        state.openSections.er = !state.openSections.er;
        render();
      }
    }, [h("strong", {}, "SECTION 1 - ER PHASE"), h("span", { class: "tag grey" }, open ? "OPEN" : "CLOSED")]),
    open ? h("div", { class: "accordion-body" }, [
      ...erStages.slice(0, 5).map(([id, labelText]) => stageRow(item, id, labelText)),
      imagingModalityField(item),
      ...erStages.slice(5).map(([id, labelText]) => stageRow(item, id, labelText))
    ]) : null
  ]);
}

function imagingModalityField(item) {
  const selected = selectedImagingModalities(item);
  return field("Decided Imaging Modality (select one or more)", h("div", { class: "segmented option-grid imaging-modality-grid" },
    imagingModalityOptions.map((option) => h("button", {
      type: "button",
      class: selected.includes(option) ? "active" : "",
      onclick: () => toggleImagingModality(item.id, option)
    }, option))
  ));
}

function imagingPhaseAccordion(key, label, stages, item) {
  const open = state.openSections[key];
  const profile = imagingProfile(item);
  const explicitlySelected = Array.isArray(item.imagingModalities) && item.imagingModalities.length > 0;
  const skipped = explicitlySelected && !profile.ct;
  return h("div", { class: `section-card ${skipped ? "phase-skipped" : ""}` }, [
    h("button", {
      class: "accordion-head",
      onclick: () => {
        state.openSections[key] = !state.openSections[key];
        render();
      }
    }, [
      h("strong", {}, label),
      h("span", { class: `tag ${skipped ? "grey" : ""}` }, skipped ? "SKIPPED" : open ? "OPEN" : "CLOSED")
    ]),
    open ? h("div", { class: "accordion-body" }, [
      skipped
        ? phaseSkippedPanel("CT phase skipped", "The selected imaging pathway does not include CT.")
        : h("div", { class: "phase-stage-list" }, stages.map(([id, labelText]) => stageRow(item, id, labelText)))
    ]) : null
  ]);
}

function mriAccordion(item) {
  const open = state.openSections.mri;
  const profile = imagingProfile(item);
  const explicitlySelected = Array.isArray(item.imagingModalities) && item.imagingModalities.length > 0;
  const skipped = explicitlySelected ? !profile.mri : item.mri?.needed === "No";
  return h("div", { class: `section-card ${skipped ? "phase-skipped" : ""}` }, [
    h("button", {
      class: "accordion-head",
      onclick: () => {
        state.openSections.mri = !state.openSections.mri;
        render();
      }
    }, [
      h("strong", {}, "SECTION 3 - MRI PHASE"),
      h("span", { class: `tag ${skipped ? "grey" : ""}` }, skipped ? "SKIPPED" : open ? "OPEN" : "CLOSED")
    ]),
    open ? h("div", { class: "accordion-body" }, [
      skipped
        ? phaseSkippedPanel("MRI phase skipped", "The selected imaging pathway does not include MRI.")
        : explicitlySelected || item.mri?.needed === "Yes"
          ? h("div", { class: "phase-stage-list" }, mriStages.map(([id, labelText]) => stageRow(item, id, labelText)))
          : h("div", { class: "phase-choice-prompt" }, "Select the decided imaging modality in the ER phase to continue.")
    ]) : null
  ]);
}

function stageRow(item, id, labelText, options = {}) {
  const stage = item.stages[id];
  const notApplicable = Boolean(stage?.notApplicable);
  const recorded = Boolean(stage?.time);
  const supportsNotApplicable = ["ctaStarted", "ctaCompleted", "mraStarted", "mraCompleted"].includes(id);
  const note = item.stageNotes?.[id] || "";
  const closed = Boolean(item.caseStopped);
  const pathwayLocked = notApplicable && stage?.reason === "Not applicable for selected imaging pathway";
  const workflowLocked = Boolean(options.disabled);
  const locked = closed || pathwayLocked || workflowLocked;
  const pendingText = options.pendingText || "Not yet recorded";
  return h("div", { class: "stage" }, [
    h("i", { class: `dot ${notApplicable ? "na" : stage?.mode || ""}` }),
    h("div", {}, [
      h("div", { class: "stage-copy" }, [
        h("strong", {}, labelText),
        h("span", {}, notApplicable ? "Not applicable" : recorded ? `${formatClock(stage.time)}${stage.reason ? ` | ${stage.reason}` : ""}` : workflowLocked ? pendingText : "Not yet recorded")
      ]),
      h("div", { class: `stage-actions ${supportsNotApplicable ? "with-na" : ""}` }, [
        h("button", { class: `record-btn ${recorded ? "done" : ""}`, disabled: locked, onclick: () => recordStage(item.id, id, "auto") }, recorded ? "RECORDED" : "RECORD NOW"),
        h("button", { class: "manual-btn", disabled: locked, onclick: () => openManual(item.id, id, labelText) }, "ENTER MANUAL TIME"),
        h("button", { class: `note-btn ${note ? "has-note" : ""}`, onclick: () => openNote(item.id, id, labelText) }, note ? "VIEW NOTE" : "NOTES"),
        supportsNotApplicable ? h("button", {
          class: `na-btn ${notApplicable ? "active" : ""}`,
          disabled: locked,
          onclick: () => toggleStageNotApplicable(item.id, id)
        }, pathwayLocked ? "NOT IN PLAN" : notApplicable ? "MARK APPLICABLE" : "NOT APPLICABLE") : null
      ]),
      note ? h("p", { class: "stage-note-preview" }, note) : null
    ])
  ]);
}

function phaseSkippedPanel(titleText, detail) {
  return h("div", { class: "phase-skipped-panel" }, [
    h("strong", {}, titleText),
    h("span", {}, detail)
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
  const skipped = isIvtSkipped(item);
  return h("section", {}, [
    title("IV Thrombolysis", `${item.id} | ${item.patientName}`),
    h("div", { class: "form-card" }, [
      optionField("IVT Eligible", "eligible", item.ivt.eligible, ["Yes", "No"], (value) => updateNested(item.id, "ivt", "eligible", value)),
      optionField("IV Thrombolysis Given", "ivtGiven", kpiValue(item, "ivtGiven"), ["Yes", "No"], (value) => updateKpiField(item.id, "ivtGiven", value)),
      skipped
        ? phaseSkippedPanel("IV thrombolysis skipped / not applicable", "The patient was marked IVT ineligible and IV thrombolysis was not given.")
        : h("div", { class: "phase-stage-list" }, [
            stageRow(item, "ivtConsent", "IVT Consent Taken"),
            stageRow(item, "ivtStarted", "IVT Started / Bolus Given")
          ]),
      item.ivt.eligible === "No" ? field("If IVT not given", select("notGivenReason", ["Outside window", "Hemorrhage", "Anticoagulant", "Family refusal", "Clinical decision", "Other"], item.ivt.notGivenReason, (value) => updateNested(item.id, "ivt", "notGivenReason", value))) : null,
      h("button", { class: "secondary-btn", onclick: () => go("timeline", item.id) }, "BACK TO TIMELINE")
    ])
  ]);
}

function mtScreen() {
  const item = currentCase();
  if (!item) return homeScreen();
  const workflow = mtWorkflowState(item);
  return h("section", {}, [
    title("Mechanical Thrombectomy", `${item.id} | ${item.patientName}`),
    h("div", { class: "form-card" }, [
      optionField("EVT Indicated", "evtIndicated", workflow.indicated, ["Yes", "No"], (value) => updateEvtDecision(item.id, "evtIndicated", value)),
      workflow.indicated === "No"
        ? phaseSkippedPanel("Mechanical thrombectomy not indicated", "The procedural timeline is not required for this case.")
        : workflow.indicated === "Yes"
          ? h("div", { class: "phase-stage-list" }, [
              optionField("Large Vessel Occlusion", "largeVesselOcclusion", workflow.lvo, ["Yes", "No"], (value) => updateEvtDecision(item.id, "largeVesselOcclusion", value)),
              optionField("EVT Performed", "evtPerformed", workflow.performed, ["Pending", "Yes", "No"], (value) => updateEvtDecision(item.id, "evtPerformed", value)),
              field("Patient Arrival Type", select("evtArrivalType", ["", "Direct arrival", "Transfer"], kpiValue(item, "evtArrivalType"), (value) => updateKpiField(item.id, "evtArrivalType", value))),
              stageRow(item, "evtConsent", "EVT Consent Taken"),
              stageRow(item, "cathlabInformed", "Cathlab Informed"),
              workflow.performed === "No"
                ? field("Reason EVT not performed", select("notPerformedReason", ["", ...evtNotPerformedReasons], item.mt?.notPerformedReason || "", (value) => updateNested(item.id, "mt", "notPerformedReason", value)))
                : null,
              workflow.performed === "Pending" || !workflow.performed
                ? h("div", { class: "phase-choice-prompt" }, "EVT decision is pending. Consent and Cathlab notification can be recorded now; procedural timings will open when EVT Performed is Yes.")
                : null,
              workflow.performed === "No"
                ? phaseSkippedPanel("Procedural timings not required", "Earlier consent or Cathlab notification times remain preserved. Select the reason EVT was not performed.")
                : null,
              ...(workflow.performed === "Yes"
                ? mtStages.slice(1).map(([id, labelText]) => stageRow(item, id, labelText))
                : []),
              workflow.performed === "Yes"
                ? field("Final TICI Score", select("tici", ["", "0", "1", "2A", "2B", "2C", "3"], item.mt.tici, (value) => updateNested(item.id, "mt", "tici", value)))
                : null
            ])
          : h("div", { class: "phase-choice-prompt" }, "Select whether EVT is indicated to continue this section."),
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
      item.admittingConsultant = form.get("admittingConsultant") || "";
      item.includeInCodeStrokeKpi = item.includeInCodeStrokeKpi || "";
      item.signoffAttempted = true;
      const currentMissing = signoffMissingItems(item);
      if (!currentMissing.length) {
        const now = new Date().toISOString();
        if (item.signedOffAt) item.signedOffUpdatedAt = now;
        else item.signedOffAt = now;
      }
      saveCases();
      render();
    }
  }, [
    h("div", { class: "section-heading compact-heading" }, [h("h2", {}, "Final Sign-off")]),
    field("Data entered by", h("input", { name: "observerName", placeholder: "Name of observer / intern / coordinator", value: item.observerName || "" })),
    field("Overall case comments", h("textarea", { name: "caseComment", placeholder: "Add final comments about delays, clinical decision, consent, transfer, or pathway issues" }, item.caseComment || "")),
    field("Admitted under", consultantSelect(item.admittingConsultant || "")),
    optionField("Include in Code Stroke KPI?", "includeInCodeStrokeKpi", item.includeInCodeStrokeKpi || "", ["Yes", "No"], (value) => {
      const form = document.querySelector(".signoff-card");
      item.observerName = form?.querySelector("[name='observerName']")?.value.trim() || item.observerName || "";
      item.caseComment = form?.querySelector("[name='caseComment']")?.value.trim() || item.caseComment || "";
      item.admittingConsultant = form?.querySelector("[name='admittingConsultant']")?.value || item.admittingConsultant || "";
      item.includeInCodeStrokeKpi = value;
      saveCases();
      render();
    }),
    missing.length
      ? h("div", { class: `missing-panel ${item.signoffAttempted ? "show" : ""}` }, [
          h("strong", {}, "Mandatory items pending"),
          ...missing.map((entry) => h("button", {
            type: "button",
            class: "pending-link",
            onclick: () => handlePendingClick(item.id, entry)
          }, entry.label))
        ])
      : h("div", { class: "complete-panel" }, item.signedOffAt
        ? `Signed off at ${formatClock(item.signedOffAt)}${item.signedOffUpdatedAt ? ` | Last updated ${formatClock(item.signedOffUpdatedAt)}` : ""}`
        : "All mandatory items completed"),
    h("button", { class: "primary-cta", type: "submit" }, item.signedOffAt ? "UPDATE SIGN-OFF" : "SIGN OFF CASE")
  ]);
}

function handlePendingClick(caseId, entry) {
  if (entry.type === "kpiInclude") {
    document.querySelector(".signoff-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  if (entry.type === "observer") {
    const input = document.querySelector("[name='observerName']");
    if (input) input.focus();
    return;
  }
  if (entry.type === "consultant") {
    const input = document.querySelector("[name='admittingConsultant']");
    if (input) input.focus();
    return;
  }
  if (entry.type === "details") {
    go("edit", caseId);
    return;
  }
  if (entry.type === "mt") {
    go("mt", caseId);
    return;
  }
  if (entry.type === "stage") {
    state.openSections[entry.section] = true;
    go("timeline", caseId);
  }
}

function dashboardScreen() {
  const tableCases = dashboardFilteredCases("cases");
  return h("section", {}, [
    dashboardRangePanel("cases", tableCases),
    recentTable(tableCases),
    dashboardPrintPages(tableCases),
    heading("Case Notes / Stop Reasons"),
    dashboardRangePanel("notes"),
    dashboardNotes(dashboardFilteredCases("notes"))
  ]);
}

function dashboardRangePanel(section, cases = []) {
  const modeKey = section === "cases" ? "dashboardCasesRangeMode" : "dashboardNotesRangeMode";
  const startKey = section === "cases" ? "dashboardCasesRangeStart" : "dashboardNotesRangeStart";
  const endKey = section === "cases" ? "dashboardCasesRangeEnd" : "dashboardNotesRangeEnd";
  return h("div", { class: "cases-filter-panel dashboard-filter-panel" }, [
    h("div", { class: "cases-filter-topline" }, [
      h("div", { class: "cases-filter-modes" }, [
        dashboardRangeButton(modeKey, "month", "This Month"),
        dashboardRangeButton(modeKey, "custom", "Custom Range"),
        dashboardRangeButton(modeKey, "all", "All")
      ]),
      section === "cases"
        ? h("div", { class: "cases-filter-toggles" }, [
            casesClinicalFilterToggle("dashboardKpiOnly", "KPI cases"),
            casesClinicalFilterToggle("dashboardIvtOnly", "IVT cases"),
            casesClinicalFilterToggle("dashboardMtOnly", "MT cases"),
            doctorFilterToggle("dashboard"),
            h("button", {
              type: "button",
              class: "dashboard-print-btn",
              disabled: !cases.length,
              onclick: () => window.print()
            }, "PRINT TABLE")
          ])
        : null
    ]),
    section === "cases" && state.dashboardDoctorFilterOpen ? doctorFilterPanel("dashboard") : null,
    state[modeKey] === "custom"
      ? h("div", { class: "cases-date-range" }, [
          field("From", h("input", {
            type: "date",
            value: state[startKey],
            onchange: (event) => {
              state[startKey] = event.target.value;
              render();
            }
          })),
          field("To", h("input", {
            type: "date",
            value: state[endKey],
            onchange: (event) => {
              state[endKey] = event.target.value;
              render();
            }
          }))
        ])
      : h("div", { class: "cases-filter-summary" }, state[modeKey] === "month" ? formatMonthLabel(new Date()) : "Showing all recorded cases")
  ]);
}

function dashboardRangeButton(modeKey, mode, label) {
  return h("button", {
    type: "button",
    class: state[modeKey] === mode ? "active" : "",
    onclick: () => {
      state[modeKey] = mode;
      render();
    }
  }, label);
}

function dashboardFilteredCases(section) {
  const mode = section === "cases" ? state.dashboardCasesRangeMode : state.dashboardNotesRangeMode;
  const startValue = section === "cases" ? state.dashboardCasesRangeStart : state.dashboardNotesRangeStart;
  const endValue = section === "cases" ? state.dashboardCasesRangeEnd : state.dashboardNotesRangeEnd;
  const sorted = [...state.cases].sort((a, b) => new Date(b.arrivalTime) - new Date(a.arrivalTime));
  let visible = sorted;
  if (mode === "all") {
    visible = sorted;
  } else if (mode === "month") {
    const currentMonth = monthKey(new Date());
    visible = sorted.filter((item) => monthKey(new Date(item.arrivalTime)) === currentMonth);
  } else {
    let start = parseDateInput(startValue) || startOfMonth(new Date());
    let end = parseDateInput(endValue) || new Date();
    if (start > end) [start, end] = [end, start];
    end = endOfDay(end);
    visible = sorted.filter((item) => {
      const arrival = new Date(item.arrivalTime);
      return arrival >= start && arrival <= end;
    });
  }
  return section === "cases" ? applyDashboardClinicalFilters(visible) : visible;
}

function applyDashboardClinicalFilters(cases) {
  return cases.filter((item) =>
    (!state.dashboardKpiOnly || isCodeStrokeKpiIncluded(item)) &&
    (!state.dashboardIvtOnly || isIvtTreatmentCase(item)) &&
    (!state.dashboardMtOnly || isMechanicalThrombectomyCase(item)) &&
    doctorFilterMatches(item, state.dashboardDoctorFilters)
  );
}

function formatMonthLabel(date) {
  return date.toLocaleDateString([], { month: "long", year: "numeric" });
}

function kpiScreen() {
  const range = selectedKpiRange();
  const allCases = casesForRange(range.start, range.end);
  const cases = kpiIncludedCases(allCases);
  const admin = kpiAdminForRange(range.start, range.end);
  const report = buildNabhKpiReport(cases, admin);
  const selected = report.find((item) => item.no === state.selectedKpiNo) || report[0];
  const monthly = monthlyKpiTrend(range.start, range.end, state.selectedKpiNo);
  const singleMonth = monthKey(range.start) === monthKey(range.end);
  if (singleMonth) state.kpiAdminMonth = monthKey(range.start);
  const drilldown = state.kpiDrilldownNo ? report.find((item) => item.no === state.kpiDrilldownNo) : null;
  return h("section", {}, [
    kpiRangeControls(),
    h("div", { class: "kpi-view-tabs" }, [
      kpiViewButton("summary", "Summary"),
      kpiViewButton("trends", "Trends"),
      kpiViewButton("reports", "Reports")
    ]),
    h("div", { class: "kpi-toolbar" }, [
      metricCard("Code Stroke KPI cases", cases.length || "0"),
      metricCard("Excluded from KPI", allCases.length - cases.length),
      metricCard("Completed KPI fields", `${cases.reduce((sum, item) => sum + kpiCompletion(item).completed, 0)}/${cases.length * defaultKpiFieldCount()}`),
      metricCard("Final KPI results", report.filter((item) => !item.provisional && item.denominator > 0).length)
    ]),
    state.kpiView === "trends"
      ? kpiTrendsView(report, selected, monthly)
      : state.kpiView === "reports"
        ? kpiReportsView(report, cases, range)
        : h("div", {}, [
            drilldown ? kpiDrilldownPanel(drilldown, cases, admin) : null,
            h("div", { class: "kpi-report-grid" }, report.map(kpiResultCard))
          ]),
    singleMonth ? kpiAdminPanel(state.kpiAdminMonth, kpiAdminForMonth(state.kpiAdminMonth)) : h("div", { class: "kpi-period-note" }, "Monthly admin inputs are combined automatically across this reporting period. Select a single month to edit them.")
  ]);
}

function analysisScreen() {
  if (state.analysisMode === "kpi") return kpiAnalysisDeck();
  const range = selectedKpiRange();
  return h("section", { class: "analysis-screen" }, [
    kpiRangeControls(),
    h("div", { class: "analysis-option-grid" }, [
      h("button", {
        type: "button",
        class: "analysis-option-card",
        onclick: () => {
          state.analysisMode = "kpi";
          state.analysisSlide = 0;
          render();
        }
      }, [
        h("span", {}, "KPI Analysis"),
        h("strong", {}, "NABH / stroke pathway KPI presentation"),
        h("small", {}, `${formatReportDate(range.start)} to ${formatReportDate(range.end)}`)
      ])
    ])
  ]);
}

function kpiAnalysisDeck() {
  const data = kpiAnalysisData();
  const total = data.report.length;
  const index = Math.max(0, Math.min(state.analysisSlide, total - 1));
  state.analysisSlide = index;
  const current = data.report[index];
  const slide = current ? safeKpiAnalysisSlide(current, data) : empty("No KPI data available for this reporting period.");
  const fullscreen = analysisFullscreenActive();
  return h("section", { class: "analysis-deck analysis-scrollable" }, [
    h("div", { class: "analysis-deck-top" }, [
      h("button", {
        type: "button",
        class: "analysis-back-btn",
        onclick: () => {
          state.analysisMode = "menu";
          state.analysisSlide = 0;
          render();
        }
      }, "Back"),
      h("div", {}, [
        h("strong", {}, current ? `KPI ${current.no}` : "KPI Analysis"),
        h("span", {}, current ? current.title : `${index + 1} / ${total}`)
      ]),
      h("div", { class: "analysis-deck-right" }, [
        h("button", { type: "button", class: "analysis-present-btn", onclick: togglePresentationFullscreen }, fullscreen ? "Exit fullscreen" : "Fullscreen"),
        h("span", {}, `${formatReportDate(data.range.start)} to ${formatReportDate(data.range.end)}`)
      ])
    ]),
    h("div", { class: "analysis-slide-wrap" }, slide),
    h("div", { class: "analysis-slide-controls" }, [
      h("button", { type: "button", disabled: index === 0, onclick: () => { state.analysisSlide = Math.max(0, index - 1); render(); } }, "< Previous KPI"),
      h("div", { class: "analysis-dots" }, data.report.map((_, dotIndex) => h("button", {
        type: "button",
        class: dotIndex === index ? "active" : "",
        onclick: () => { state.analysisSlide = dotIndex; render(); }
      }, String(dotIndex + 1)))),
      h("button", { type: "button", disabled: index === total - 1, onclick: () => { state.analysisSlide = Math.min(total - 1, index + 1); render(); } }, "Next KPI >")
    ])
]);
}

function safeKpiAnalysisSlide(result, data) {
  try {
    return genericKpiAnalysisSlide(result, data);
  } catch (error) {
    console.error("KPI analysis slide error", result?.no, error);
    return analysisSlide(`KPI ${result?.no || ""}`, result?.title || "KPI analysis", [
      h("div", { class: "analysis-focus-card analysis-clean-card" }, [
        h("span", {}, "Slide needs review"),
        h("h3", {}, "Unable to build this KPI slide"),
        h("p", {}, "The KPI data is safe. This is only a presentation-view issue.")
      ])
    ]);
  }
}

function analysisFullscreenActive() {
  return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
}

function togglePresentationFullscreen() {
  const active = analysisFullscreenActive();
  if (active) {
    (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
    return;
  }
  const target = document.documentElement;
  (target.requestFullscreen || target.webkitRequestFullscreen)?.call(target);
}

function kpiAnalysisData() {
  const range = selectedKpiRange();
  const allCases = casesForRange(range.start, range.end);
  const cases = kpiIncludedCases(allCases);
  const admin = kpiAdminForRange(range.start, range.end);
  return {
    range,
    cases,
    admin,
    report: buildNabhKpiReport(cases, admin)
  };
}

function genericKpiAnalysisSlide(result, data) {
  const detail = kpiCaseAudit(result.no, data.cases, data.admin);
  const pending = detail.eligible.filter((item) => !detail.isComplete(item));
  const completed = detail.patientLevel === false ? result.denominator || 0 : detail.eligible.length - pending.length;
  const eligible = detail.patientLevel === false ? result.denominator || 0 : detail.eligible.length;
  const valueText = result.value || "--";
  return analysisSlide(`KPI ${result.no}`, result.title, [
    h("div", { class: "analysis-kpi-summary" }, [
      analysisMetric("Result", valueText, true),
      analysisMetric("Eligible", eligible),
      analysisMetric("Completed", completed),
      analysisMetric("Pending", detail.patientLevel === false ? "--" : pending.length)
    ]),
    analysisMainVisual(result, data, detail, { eligible, completed, pending })
  ], kpiAnalysisMeta(result.no));
}

function analysisMainVisual(result, data, detail, counts) {
  const timingRows = analysisTimingRows(result.no, data.cases);
  const outcomeRows = analysisOutcomeRows(result.no, data.cases);
  const eventRows = analysisEventRows(result.no, data.cases);
  if (timingRows.length) return analysisMiniTimingChart(result.no, timingRows);
  if (outcomeRows.length) return analysisOutcomeChart(result.no, outcomeRows);
  if (eventRows.length) return analysisEventList(result.no, eventRows);
  return analysisKpiSnapshot(result, detail, counts);
}

function analysisKpiSnapshot(result, detail, counts) {
  const label = analysisKpiVisualLabel(result.no);
  const completeText = detail.patientLevel === false
    ? (detail.note || result.meta || "Monthly admin input")
    : `${counts.completed}/${counts.eligible} records complete`;
  const statusText = result.meta || completeText;
  return h("div", { class: "analysis-focus-card analysis-clean-card" }, [
    h("span", {}, label),
    h("h3", {}, result.provisional ? "Data pending" : "Ready for review"),
    h("p", {}, statusText)
  ]);
}

function analysisKpiVisualLabel(no) {
  const labels = {
    2: "IVT performance",
    5: "Dysphagia screening",
    6: "Rehab assessment",
    7: "90-day mRS outcome",
    15: "Drug availability",
    19: "Speech and swallow follow-up",
    22: "TICI outcome"
  };
  return labels[no] || "KPI result";
}

function kpiAnalysisMeta(no) {
  const meta = {
    1: { category: "Access & Timeliness", numerator: "Sum of minutes from stroke reference time to first brain imaging start", denominator: "Number of eligible cases" },
    2: { category: "Treatment & Reperfusion", numerator: "IVT cases treated within 60 minutes", denominator: "IVT eligible or IVT-given cases", multiplier: "× 100" },
    3: { category: "Safety & Complications", numerator: "sICH after IVT cases", denominator: "IVT cases", multiplier: "× 100" },
    4: { category: "Access & Timeliness", numerator: "Sum of minutes from inpatient stroke recognition to neurological assessment", denominator: "Number of inpatient stroke cases" },
    5: { category: "Care Quality", numerator: "Cases with dysphagia screening documented", denominator: "Eligible stroke cases", multiplier: "× 100" },
    6: { category: "Care Quality", numerator: "Cases with rehab assessment within 48 hours", denominator: "Eligible stroke cases", multiplier: "× 100" },
    7: { category: "Outcome", numerator: "Cases with 90-day mRS 0-2", denominator: "Cases with 90-day mRS recorded", multiplier: "× 100" },
    8: { category: "Safety & Complications", numerator: "Medication error events", denominator: "Medication-opportunity denominator", multiplier: "× 100" },
    9: { category: "Outcome", numerator: "Deaths in hospital within 7 days", denominator: "Eligible stroke cases", multiplier: "× 100" },
    10: { category: "Safety & Complications", numerator: "Stroke or death within 30 days after CEA/carotid procedure", denominator: "Carotid procedure cases", multiplier: "× 100" },
    11: { category: "Safety & Complications", numerator: "Stroke or death within 24 hours after diagnostic angiography", denominator: "Diagnostic angiography cases", multiplier: "× 100" },
    12: { category: "Safety & Complications", numerator: "New or worsening hospital pressure ulcers", denominator: "Stroke-unit patient days", multiplier: "× 100" },
    13: { category: "Safety & Complications", numerator: "DVT after admission cases", denominator: "Eligible stroke cases", multiplier: "× 100" },
    14: { category: "Access & Timeliness", numerator: "Sum of minutes from imaging-service presentation to diagnostic imaging start", denominator: "Number of eligible imaging cases" },
    15: { category: "Care Quality", numerator: "Thrombolytic-agent stock-out events", denominator: "Thrombolytic formulary drugs", multiplier: "× 100" },
    16: { category: "Safety & Complications", numerator: "Patient falls", denominator: "Stroke-unit patient days", multiplier: "× 1000" },
    17: { category: "Treatment & Reperfusion", numerator: "EVT-indicated cases treated within defined timeframe", denominator: "EVT-indicated ischemic stroke cases", multiplier: "× 100" },
    18: { category: "Safety & Complications", numerator: "sICH after EVT cases", denominator: "EVT cases", multiplier: "× 100" },
    19: { category: "Care Quality", numerator: "Speech therapy dysphagia reassessment within 24 hours", denominator: "Eligible stroke cases", multiplier: "× 100" },
    20: { category: "Safety & Complications", numerator: "Stroke or death within 30 days after intracranial angioplasty/stenting", denominator: "Intracranial procedure cases", multiplier: "× 100" },
    21: { category: "Safety & Complications", numerator: "Ventriculitis cases", denominator: "Ischemic stroke patients who underwent EVD", multiplier: "× 100" },
    22: { category: "Treatment & Reperfusion", numerator: "Reperfusion therapy cases with final TICI 2B or higher", denominator: "Reperfusion therapy cases", multiplier: "× 100" },
    23: { category: "Treatment & Reperfusion", numerator: "LVO EVT cases with first pass within 150 minutes and TICI 2B+", denominator: "LVO EVT cases", multiplier: "× 100" },
    24: { category: "Treatment & Reperfusion", numerator: "EVT cases with TICI 2B+ within 60 minutes of groin puncture", denominator: "EVT cases", multiplier: "× 100" }
  };
  return meta[no] || { category: "KPI", numerator: "", denominator: "", multiplier: "" };
}

function analysisTimingRows(no, cases) {
  const configs = {
    1: { start: strokeReferenceTime, end: firstBrainImagingStartTime, target: 25, label: "First imaging" },
    2: { start: (item) => stageTime(item, "arrival"), end: (item) => stageTime(item, "ivtStarted"), target: 60, warnAt: 45, label: "Door to IVT" },
    4: { start: (item) => kpiValue(item, "strokeRecognitionTime"), end: (item) => stageTime(item, "initialOrders"), target: null, label: "Neuro assessment" },
    14: { start: (item) => kpiValue(item, "diagnosticImagingPresentationTime"), end: (item) => kpiValue(item, "diagnosticImagingStartTime") || firstBrainImagingStartTime(item), target: 30, warnAt: 15, label: "Imaging wait" },
    17: { start: (item) => stageTime(item, "arrival"), end: (item) => stageTime(item, "firstPass"), target: evtAnalysisTarget, label: "EVT first pass" },
    23: {
      start: (item) => stageTime(item, "arrival"),
      end: (item) => stageTime(item, "firstPass"),
      target: 150,
      label: "Arrival to first pass",
      detail: (item) => `TICI ${item.mt?.tici || "--"}`,
      success: (item, minutes) => minutes != null && minutes <= 150 && ticiGood(item)
    },
    24: {
      start: (item) => stageTime(item, "groinPuncture"),
      end: (item) => stageTime(item, "recanalisation"),
      target: 60,
      label: "Groin to recan",
      detail: (item) => `TICI ${item.mt?.tici || "--"}`,
      success: (item, minutes) => minutes != null && minutes <= 60 && ticiGood(item)
    }
  };
  const config = configs[no];
  if (!config) return [];
  const detail = kpiCaseAudit(no, cases, kpiAdminForRange(selectedKpiRange().start, selectedKpiRange().end));
  return detail.eligible.map((item) => {
    const minutes = minutesBetween(config.start(item), config.end(item));
    return {
      item,
      name: item.patientName || "Unnamed Patient",
      minutes,
      target: typeof config.target === "function" ? config.target(item) : config.target,
      warnAt: config.warnAt,
      label: config.label,
      detail: config.detail?.(item) || "",
      success: config.success ? config.success(item, minutes) : null,
      complete: detail.isComplete(item)
    };
  }).sort((a, b) => (b.minutes ?? -1) - (a.minutes ?? -1));
}

function evtAnalysisTarget(item) {
  const arrivalType = kpiValue(item, "evtArrivalType");
  if (arrivalType === "Transfer") return 60;
  if (arrivalType === "Direct arrival") return 90;
  return null;
}

function analysisMiniTimingChart(no, rows) {
  const values = rows.map((row) => row.minutes).filter((value) => value != null && value >= 0);
  const maxMinutes = Math.max(30, ...values, ...rows.map((row) => row.target || 0));
  const target = rows.find((row) => row.target)?.target;
  return h("div", { class: "analysis-focus-card" }, [
    h("span", {}, rows[0]?.label || "Timing"),
    h("h3", {}, analysisTimingHeading(no, target)),
    h("div", { class: "analysis-mini-chart" }, rows.map((row) => {
      const invalid = row.minutes != null && row.minutes < 0;
      const width = row.minutes == null || invalid ? 2 : Math.max(2, Math.min(100, Math.round((row.minutes / maxMinutes) * 100)));
      const status = analysisTimingStatus(row, invalid);
      return h("div", { class: "analysis-mini-row" }, [
        h("span", {}, row.name),
        h("div", { class: "analysis-bar-track" }, h("i", { class: status, style: `width:${width}%` })),
        h("strong", {}, row.minutes == null ? "--" : invalid ? "Invalid" : `${row.minutes}m${row.detail ? ` | ${row.detail}` : ""}`)
      ]);
    })),
    h("p", {}, analysisTimingFootnote(no))
  ]);
}

function analysisTimingHeading(no, target) {
  if (no === 2) return "45 and 60 minute bands";
  if (no === 14) return "Delay bands";
  if (no === 17) return "Direct 90 min | Transfer 60 min";
  return target ? `Target ${target} min` : "Patient-wise timing";
}

function analysisTimingStatus(row, invalid) {
  if (row.minutes == null) return "pending";
  if (invalid) return "bad";
  if (row.success === false) return "bad";
  if (row.success === true) return "good";
  if (row.target && row.minutes > row.target) return "bad";
  if (row.warnAt && row.minutes > row.warnAt) return "warn";
  if (row.target && row.minutes > row.target * 0.8) return "warn";
  return "good";
}

function analysisTimingFootnote(no) {
  if (no === 2) return "Green is within 45 minutes, amber is 46-60 minutes, red is beyond 60 minutes.";
  if (no === 14) return "Presentation-only delay bands: green up to 15 minutes, amber 16-30 minutes, red beyond 30 minutes.";
  if (no === 17) return "Direct and transfer EVT targets are interpreted by the KPI calculation.";
  if (no === 23 || no === 24) return "Bars turn green only when both time and final TICI 2B+ criteria are met.";
  return "Longest bars identify patients for pathway review.";
}

function analysisOutcomeRows(no, cases) {
  if (no !== 22) return [];
  const detail = kpiCaseAudit(no, cases, kpiAdminForRange(selectedKpiRange().start, selectedKpiRange().end));
  const scoreWidth = { "0": 8, "1": 24, "2A": 45, "2B": 70, "2C": 85, "3": 100 };
  return detail.eligible.map((item) => {
    const score = item.mt?.tici || "";
    return {
      item,
      name: item.patientName || "Unnamed Patient",
      score,
      width: score ? scoreWidth[score] || 8 : 2,
      status: !score ? "pending" : ticiGood(item) ? "good" : "bad"
    };
  }).sort((a, b) => (a.score ? 0 : 1) - (b.score ? 0 : 1));
}

function analysisOutcomeChart(no, rows) {
  return h("div", { class: "analysis-focus-card" }, [
    h("span", {}, "TICI outcome"),
    h("h3", {}, "TICI 2B+ target"),
    h("div", { class: "analysis-mini-chart" }, rows.map((row) => h("div", { class: "analysis-mini-row" }, [
      h("span", {}, row.name),
      h("div", { class: "analysis-bar-track" }, h("i", { class: row.status, style: `width:${row.width}%` })),
      h("strong", {}, row.score ? `TICI ${row.score}` : "--")
    ]))),
    h("p", {}, "Green indicates final TICI 2B, 2C, or 3 after reperfusion therapy.")
  ]);
}

function analysisEventRows(no, cases) {
  const eventKeyMap = {
    3: "sichAfterIvt",
    8: "medicationError",
    9: "deathWithin7Days",
    10: "strokeDeath30DaysAfterCea",
    11: "strokeDeath24HoursAfterAngiography",
    12: "pressureUlcerNewWorsening",
    13: "dvtAfterAdmission",
    16: "patientFall",
    18: "sichAfterEvt",
    20: "strokeDeath30DaysAfterAngioplastyStenting",
    21: "ventriculitisAfterEvd"
  };
  const key = eventKeyMap[no];
  if (!key) return [];
  return cases.filter((item) => kpiValue(item, key) === "Yes").map((item) => ({
    name: item.patientName || "Unnamed Patient",
    date: formatCompactDate(new Date(item.arrivalTime)),
    detail: consultantCode(item.admittingConsultant)
  })).slice(0, 6);
}

function analysisEventList(no, rows) {
  return h("div", { class: "analysis-focus-card" }, [
    h("span", {}, analysisKpiVisualLabel(no) || "Event cases"),
    h("h3", {}, `${rows.length} case${rows.length === 1 ? "" : "s"} recorded`),
    h("div", { class: "analysis-event-list" }, rows.map((row) => h("div", {}, [
      h("strong", {}, row.name),
      h("span", {}, `${row.date} | ${row.detail}`)
    ])))
  ]);
}

function analysisKpiNarrative(result, eligible, completed, pending) {
  if (!eligible && !result.denominator) return "No eligible cases or denominator are available for this reporting period.";
  if (result.provisional) return `${pending} patient record${pending === 1 ? "" : "s"} still need completion before this KPI can be considered final.`;
  if (pending > 0) return `${completed}/${eligible} eligible patient records are complete; remaining data should be reviewed.`;
  return `This KPI is complete for the selected reporting period. Result: ${result.value || "--"}.`;
}

function kpi1AnalysisData() {
  const range = selectedKpiRange();
  const allCases = casesForRange(range.start, range.end);
  const cases = kpiIncludedCases(allCases);
  const admin = kpiAdminForRange(range.start, range.end);
  const result = buildNabhKpiReport(cases, admin).find((item) => item.no === 1);
  const detail = kpiCaseAudit(1, cases, admin);
  const rows = detail.eligible.map((item) => {
    const referenceTime = strokeReferenceTime(item);
    const imagingStart = firstBrainImagingStartTime(item);
    const minutes = minutesBetween(referenceTime, imagingStart);
    const missing = detail.missingFields(item);
    return {
      item,
      date: formatCompactDate(new Date(item.arrivalTime)),
      name: item.patientName || "Unnamed Patient",
      doc: consultantCode(item.admittingConsultant),
      presentation: kpiValue(item, "strokePresentationType") || "ER arrival",
      referenceTime,
      imagingModality: firstImagingModality(item),
      imagingStart,
      minutes,
      missing,
      complete: detail.isComplete(item),
      status: minutes == null ? "Pending" : minutes <= 25 ? "On target" : minutes <= 35 ? "Delayed" : "Critical"
    };
  });
  const timed = rows.filter((row) => row.minutes != null);
  const values = timed.map((row) => row.minutes).sort((a, b) => a - b);
  const delayed = timed.filter((row) => row.minutes > 25);
  const pending = rows.filter((row) => !row.complete);
  return {
    range,
    result,
    rows,
    timed,
    delayed,
    pending,
    eligible: rows.length,
    completed: timed.length,
    mean: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null,
    median: medianNumber(values),
    withinTarget: timed.filter((row) => row.minutes <= 25).length,
    targetPercent: timed.length ? Math.round((timed.filter((row) => row.minutes <= 25).length / timed.length) * 100) : null
  };
}

function kpi1OverviewSlide(data) {
  const interpretation = data.completed
    ? `${data.withinTarget}/${data.completed} timed cases were within 25 minutes. Median ${data.median} min, mean ${data.mean} min.`
    : "No timed cases are available in this reporting period.";
  return analysisSlide("KPI 1", "Time to first brain imaging", [
    h("div", { class: "analysis-kpi-summary" }, [
      analysisMetric("Eligible", data.eligible),
      analysisMetric("Completed", data.completed),
      analysisMetric("Pending", data.pending.length),
      analysisMetric("Median", data.median == null ? "--" : `${data.median} min`),
      analysisMetric("Mean", data.mean == null ? "--" : `${data.mean} min`),
      analysisMetric("Within target", data.targetPercent == null ? "--" : `${data.targetPercent}%`)
    ]),
    h("div", { class: "analysis-hero-grid" }, [
      h("div", { class: "analysis-big-number" }, [
        h("span", {}, "Target"),
        h("strong", {}, "25 min"),
        h("small", {}, "Door / stroke recognition -> first brain imaging start")
      ]),
      h("div", { class: "analysis-interpretation" }, [
        h("h3", {}, "Interpretation"),
        h("p", {}, interpretation),
        h("p", {}, data.delayed.length ? `${data.delayed.length} timed case${data.delayed.length === 1 ? "" : "s"} crossed the 25-minute target.` : "No delayed timed cases detected.")
      ])
    ])
  ]);
}

function kpi1PatientChartSlide(data) {
  const maxMinutes = Math.max(35, ...data.timed.map((row) => row.minutes || 0));
  const chartRows = [...data.rows].sort((a, b) => (b.minutes ?? -1) - (a.minutes ?? -1)).slice(0, 24);
  return analysisSlide("KPI 1", "Patient-wise time to first brain imaging", [
    chartRows.length ? h("div", { class: "analysis-bar-chart" }, chartRows.map((row) => {
      const width = row.minutes == null ? 2 : Math.max(2, Math.min(100, Math.round((row.minutes / maxMinutes) * 100)));
      return h("div", { class: "analysis-bar-row" }, [
        h("span", {}, row.name),
        h("div", { class: "analysis-bar-track" }, h("i", { class: analysisStatusClass(row), style: `width:${width}%` })),
        h("strong", {}, row.minutes == null ? "--" : `${row.minutes}m`)
      ]);
    })) : empty("No eligible KPI 1 cases in this reporting period."),
    h("div", { class: "analysis-target-note" }, "Green <=25 min | Orange 26-35 min | Red >35 min | Grey pending")
  ]);
}

function kpi1DataQualitySlide(data) {
  return analysisSlide("KPI 1", "Patients and data quality", [
    data.rows.length ? h("div", { class: "analysis-table-wrap" }, h("table", { class: "analysis-case-table" }, [
      h("thead", {}, h("tr", {}, ["#", "Date", "Name", "Doc", "Type", "Img", "Start", "Min", "Status"].map((text) => h("th", {}, text)))),
      h("tbody", {}, data.rows.map((row, index) => h("tr", { class: analysisStatusClass(row) }, [
        h("td", {}, String(index + 1)),
        h("td", {}, row.date),
        h("td", {}, row.name),
        h("td", {}, row.doc),
        h("td", {}, row.presentation === "Inpatient stroke" ? "IP" : "ER"),
        h("td", {}, row.imagingModality),
        h("td", {}, formatClock(row.imagingStart)),
        h("td", {}, row.minutes == null ? "--" : String(row.minutes)),
        h("td", {}, row.status)
      ])))
    ])) : empty("No eligible KPI 1 cases in this reporting period."),
    h("div", { class: "analysis-pending-box" }, [
      h("h3", {}, "Pending / invalid data"),
      data.pending.length
        ? h("div", {}, data.pending.map((row) => h("button", {
            type: "button",
            onclick: () => go("timeline", row.item.id)
          }, `${row.name}: ${row.missing.join(", ") || "Required time missing"}`)))
        : h("p", {}, "No pending patient data detected for KPI 1.")
    ])
  ]);
}

function analysisSlide(kicker, headingText, body, meta = {}) {
  return h("article", { class: "analysis-slide" }, [
    h("div", { class: "analysis-slide-title" }, [
      h("div", {}, [
        h("span", {}, [
          kicker,
          meta.category ? h("em", {}, meta.category) : null
        ]),
        h("h1", {}, headingText)
      ]),
      meta.numerator || meta.denominator ? h("aside", { class: "analysis-formula-box" }, [
        h("span", {}, "Formula"),
        h("div", { class: "analysis-formula-row" }, [
          h("div", { class: "analysis-formula-fraction" }, [
            h("strong", {}, meta.numerator || "--"),
            h("i", {}),
            h("strong", {}, meta.denominator || "--")
          ]),
          meta.multiplier ? h("b", { class: "analysis-formula-multiplier" }, meta.multiplier) : null
        ])
      ]) : null
    ]),
    ...body
  ]);
}

function analysisValueParts(value) {
  const text = String(value || "--");
  const match = text.match(/^(\d+(?:\.\d+)?%)(?:\s+(.+))$/);
  if (match) return { main: match[1], sub: match[2] };
  return { main: text, sub: "" };
}

function analysisMetric(label, value, featured = false) {
  const parts = featured ? analysisValueParts(value) : { main: String(value), sub: "" };
  return h("div", { class: `analysis-metric ${featured ? "featured" : ""}` }, [
    h("span", {}, label),
    h("strong", { class: parts.sub ? "analysis-value-stacked" : "" }, parts.sub ? [
      h("b", {}, parts.main),
      h("small", {}, parts.sub)
    ] : parts.main)
  ]);
}

function analysisStatusClass(row) {
  if (row.minutes == null) return "pending";
  if (row.minutes <= 25) return "good";
  if (row.minutes <= 35) return "warn";
  return "bad";
}

function firstImagingModality(item) {
  const ct = stageTime(item, "ncctStarted");
  const mri = stageTime(item, "mriStarted");
  if (ct && mri) return new Date(ct) <= new Date(mri) ? "CT" : "MRI";
  if (ct) return "CT";
  if (mri) return "MRI";
  const profile = imagingProfile(item);
  if (profile.ct && profile.mri) return "CT/MRI";
  if (profile.ct) return "CT";
  if (profile.mri) return "MRI";
  return "--";
}

function medianNumber(values) {
  if (!values.length) return null;
  const middle = Math.floor(values.length / 2);
  return values.length % 2 ? values[middle] : Math.round((values[middle - 1] + values[middle]) / 2);
}

function kpiRangeControls() {
  return h("div", { class: "kpi-range-panel" }, [
    h("div", { class: "kpi-range-presets" }, [
      kpiPresetButton("month", "This month"),
      kpiPresetButton("quarter", "Quarter"),
      kpiPresetButton("year", "Year"),
      kpiPresetButton("custom", "Custom")
    ]),
    h("div", { class: "kpi-date-range" }, [
      field("From", h("input", {
        type: "date",
        value: state.kpiRangeStart,
        onchange: (event) => {
          state.kpiRangePreset = "custom";
          state.kpiRangeStart = event.target.value;
          render();
        }
      })),
      field("To", h("input", {
        type: "date",
        value: state.kpiRangeEnd,
        onchange: (event) => {
          state.kpiRangePreset = "custom";
          state.kpiRangeEnd = event.target.value;
          render();
        }
      }))
    ])
  ]);
}

function kpiPresetButton(preset, label) {
  return h("button", {
    type: "button",
    class: state.kpiRangePreset === preset ? "active" : "",
    onclick: () => applyKpiPreset(preset)
  }, label);
}

function kpiViewButton(view, label) {
  return h("button", {
    type: "button",
    class: state.kpiView === view ? "active" : "",
    onclick: () => {
      state.kpiView = view;
      if (view !== "summary") state.kpiDrilldownNo = null;
      render();
    }
  }, label);
}

function kpiTrendsView(report, selected, monthly) {
  const range = selectedKpiRange();
  return h("div", {}, [
    heading("Monthly Trends"),
    field("KPI to graph", select("selectedKpiNo", report.map((item) => `${item.no}. ${item.title}`), `${selected.no}. ${selected.title}`, (value) => {
      state.selectedKpiNo = Number(value.split(".")[0]);
      render();
    })),
    h("div", { class: "kpi-detail-chart" }, [
      h("div", { class: "kpi-detail-head" }, [
        h("div", {}, [h("span", {}, `KPI ${selected.no}`), h("h2", {}, selected.title)]),
        h("strong", {}, selected.value)
      ]),
      monthly.length ? h("div", { class: "kpi-month-chart" }, monthly.map((point) => kpiMonthBar(point, selected.no))) : empty("No monthly data in this period.")
    ]),
    h("div", { class: "kpi-trend-actions" }, [
      h("button", { type: "button", class: "secondary-btn", onclick: () => exportAllKpiTrendsPng(report, range) }, "EXPORT ALL TRENDS PNG")
    ]),
    heading("All 24 KPI Trends"),
    h("div", { class: "kpi-trend-gallery" }, report.map((item) => kpiTrendTile(item, range)))
  ]);
}

function kpiTrendTile(item, range) {
  const points = monthlyKpiTrend(range.start, range.end, item.no);
  return h("button", {
    type: "button",
    class: "kpi-trend-tile",
    onclick: () => {
      state.selectedKpiNo = item.no;
      render();
      requestAnimationFrame(() => document.querySelector(".kpi-detail-chart")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, [
    h("div", { class: "kpi-trend-tile-head" }, [
      h("span", {}, `KPI ${item.no}`),
      h("strong", {}, item.value)
    ]),
    h("p", {}, item.title),
    h("div", { class: "kpi-sparkline" }, points.map((point) => {
      const max = kpiChartMax(item.no, point.value || 0);
      const height = point.value == null ? 3 : Math.max(3, Math.min(100, Math.round((point.value / max) * 100)));
      return h("i", { class: point.provisional ? "pending" : "", style: `height:${height}%`, title: `${point.label}: ${point.value == null ? "--" : formatKpiChartValue(item.no, point.value)}` });
    }))
  ]);
}

function kpiMonthBar(point, kpiNo) {
  const max = kpiChartMax(kpiNo, point.value);
  const height = point.value == null ? 4 : Math.max(4, Math.min(100, Math.round((point.value / max) * 100)));
  return h("div", { class: "kpi-month-column" }, [
    h("span", {}, point.value == null ? "--" : formatKpiChartValue(kpiNo, point.value)),
    h("div", { class: "kpi-month-track" }, h("i", { class: point.provisional ? "pending" : "", style: `height:${height}%` })),
    h("small", {}, point.label)
  ]);
}

function kpiReportsView(report, cases, range) {
  return h("div", {}, [
    heading("Export Report"),
    h("div", { class: "kpi-export-grid" }, [
      exportAction("CSV", "Numerator, denominator, result and status", () => exportKpiCsv(report, range)),
      exportAction("JSON", "Structured KPI report and period details", () => exportKpiJson(report, cases, range)),
      exportAction("PNG", "Shareable graphical summary image", () => exportKpiPng(report, cases, range)),
      exportAction("TRENDS PNG", "All 24 monthly KPI trend graphs", () => exportAllKpiTrendsPng(report, range)),
      exportAction("PRINT / PDF", "Print or save the full report as PDF", () => window.print())
    ]),
    heading("Report Preview"),
    h("div", { class: "kpi-trend-gallery report-trend-gallery" }, report.map((item) => kpiTrendTile(item, range)))
  ]);
}

function exportAction(label, description, onclick) {
  return h("button", { type: "button", class: "kpi-export-action", onclick }, [
    h("strong", {}, label),
    h("span", {}, description)
  ]);
}

function kpiAdminPanel(month, admin) {
  return h("form", {
    class: "signoff-card kpi-admin-card",
    onsubmit: (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      state.kpiAdminData[month] = Object.keys(kpiAdminDefaults).reduce((data, key) => {
        data[key] = form.get(key) || "";
        return data;
      }, {});
      saveKpiAdminData();
      render();
    }
  }, [
    h("div", { class: "section-heading compact-heading" }, [h("h2", {}, "Monthly Admin Inputs")]),
    h("p", { class: "settings-help" }, "Only these hospital-level values cannot be derived from individual patient records. They can be completed later."),
    h("div", { class: "kpi-admin-grid" }, [
      field("Medication-error opportunities", h("input", { name: "medicationErrorOpportunities", type: "number", min: "0", value: admin.medicationErrorOpportunities })),
      field("Thrombolytic stock-outs", h("input", { name: "thrombolyticStockouts", type: "number", min: "0", value: admin.thrombolyticStockouts })),
      field("Thrombolytic formulary drugs", h("input", { name: "thrombolyticFormularyDrugs", type: "number", min: "0", value: admin.thrombolyticFormularyDrugs }))
    ]),
    h("button", { class: "primary-cta", type: "submit" }, "SAVE MONTHLY INPUTS")
  ]);
}

function buildNabhKpiReport(cases, admin) {
  const ischemicCases = cases.filter((item) => ["Ischemic Stroke", "LVO Suspected"].includes(item.suspicion));
  const inpatientCases = cases.filter((item) => kpiValue(item, "strokePresentationType") === "Inpatient stroke");
  const strokeUnitPatientDays = cases.reduce((sum, item) => sum + patientStrokeUnitDays(item), 0);
  const patientFalls = cases.reduce((sum, item) => sum + patientFallCount(item), 0);
  const diagnosticCases = cases.filter((item) => kpiValue(item, "diagnosticImagingPerformed") === "Yes" || Boolean(kpiValue(item, "diagnosticImagingStartTime")));
  const brainImagingCases = cases.filter((item) => kpiValue(item, "diagnosticImagingPerformed") === "Yes" || Boolean(firstBrainImagingStartTime(item)));
  const ivtCases = cases.filter((item) => item.ivt?.eligible === "Yes" || kpiValue(item, "ivtGiven") === "Yes");
  const evtCases = cases.filter((item) => kpiValue(item, "evtPerformed") === "Yes" || Boolean(stageTime(item, "groinPuncture")));
  const carotidCases = cases.filter((item) => kpiValue(item, "ceaPerformed") === "Yes" || kpiValue(item, "carotidAngioplastyStentingPerformed") === "Yes");
  const angiographyCases = cases.filter((item) => kpiValue(item, "diagnosticAngiographyPerformed") === "Yes");
  const intracranialCases = cases.filter((item) => kpiValue(item, "intracranialAngioplastyStentingPerformed") === "Yes");
  const reperfusionCases = ischemicCases.filter((item) =>
    kpiValue(item, "evtPerformed") === "Yes" ||
    kpiValue(item, "intraArterialThrombolysis") === "Yes" ||
    Boolean(item.mt?.tici)
  );
  return [
    averageKpi(1, "Time to first brain imaging", brainImagingCases, (item) => minutesBetween(strokeReferenceTime(item), firstBrainImagingStartTime(item)), "Average minutes"),
    dualIvtComplianceKpi(ivtCases),
    verifiedOutcomeKpi(3, "sICH after IVT", ivtCases, "sichAfterIvt", (item) => validatedSich(item, "Ivt", stageTime(item, "ivtStarted"))),
    averageKpi(4, "Time to detailed neurological assessment of inpatients", inpatientCases, (item) => minutesBetween(kpiValue(item, "strokeRecognitionTime"), stageTime(item, "initialOrders")), "Average minutes"),
    percentageKpi(5, "Dysphagia screening documented", cases, null, (item) => kpiValue(item, "dysphagiaScreening") === "Yes"),
    percentageKpi(6, "Rehab assessment within 48 hours", cases, null, (item) => withinIsoMinutes(admissionReferenceTime(item), kpiValue(item, "physiotherapyAssessmentTime"), 48 * 60)),
    verifiedRankinKpi(cases.filter((item) => kpiValue(item, "followup90DayCompleted") === "Yes" || kpiValue(item, "mrs90Days") !== "")),
    verifiedRatioKpi(8, "Medication errors", cases, "medicationError", medicationErrorTotal(cases), num(admin.medicationErrorOpportunities), "%"),
    verifiedOutcomeKpi(9, "Death in hospital within 7 days", cases, "deathWithin7Days", verifiedDeathWithin7Days),
    verifiedOutcomeKpi(10, "CEA/carotid procedure stroke or death within 30 days", carotidCases, "strokeDeath30DaysAfterCea", (item) => verifiedWithinWindow(item, "carotidProcedureTime", "carotidStrokeDeathTime", 30 * 24 * 60)),
    verifiedOutcomeKpi(11, "Stroke/death within 24 hours after diagnostic angiography", angiographyCases, "strokeDeath24HoursAfterAngiography", (item) => verifiedWithinWindow(item, "diagnosticAngiographyTime", "diagnosticAngiographyStrokeDeathTime", 24 * 60)),
    verifiedRatioKpi(12, "Hospital-associated pressure ulcer", cases, "pressureUlcerNewWorsening", pressureUlcerCount(cases), strokeUnitPatientDays, "%", (item) =>
      kpiValue(item, "pressureUlcerNewWorsening") === "No" || Boolean(kpiValue(item, "pressureUlcerStage"))
    ),
    verifiedOutcomeKpi(13, "DVT after admission", cases, "dvtAfterAdmission", (item) => kpiValue(item, "dvtAfterAdmission") === "Yes"),
    averageKpi(14, "Waiting time for imaging services", diagnosticCases, diagnosticWaitingMinutes, "Average minutes"),
    ratioKpi(15, "Thrombolytic-agent stock-outs", num(admin.thrombolyticStockouts), num(admin.thrombolyticFormularyDrugs), "%"),
    verifiedRateKpi(16, "Patient falls", cases, "patientFall", patientFalls, strokeUnitPatientDays, 1000, "per 1000 patient days"),
    percentageKpi(17, "EVT within defined timeframe", ischemicCases.filter((item) => kpiValue(item, "evtIndicated") === "Yes"), null, evtWithinTarget),
    verifiedOutcomeKpi(18, "sICH after EVT", evtCases, "sichAfterEvt", (item) => validatedSich(item, "Evt", stageTime(item, "firstPass") || stageTime(item, "groinPuncture"))),
    percentageKpi(19, "Speech therapy dysphagia reassessment within 24 hours", cases, null, (item) => withinIsoMinutes(admissionReferenceTime(item), kpiValue(item, "speechTherapyAssessmentTime"), 24 * 60)),
    verifiedOutcomeKpi(20, "Intracranial angioplasty/stenting stroke or death within 30 days", intracranialCases, "strokeDeath30DaysAfterAngioplastyStenting", (item) => verifiedWithinWindow(item, "intracranialProcedureTime", "intracranialStrokeDeathTime", 30 * 24 * 60)),
    percentageKpi(21, "Ventriculitis among patients who underwent EVD", ischemicCases.filter((item) => kpiValue(item, "evdInserted") === "Yes"), null, (item) => kpiValue(item, "ventriculitisAfterEvd") === "Yes"),
    verifiedTiciKpi(reperfusionCases),
    percentageKpi(23, "LVO EVT first pass within 150 minutes and TICI 2B+", cases.filter((item) => kpiValue(item, "largeVesselOcclusion") === "Yes" && (kpiValue(item, "evtPerformed") === "Yes" || Boolean(stageTime(item, "firstPass")))), null, (item) => withinMinutes(item, "arrival", "firstPass", 150) && ticiGood(item)),
    percentageKpi(24, "EVT patients achieving TICI 2B+ within 60 minutes of groin puncture", evtCases, null, (item) => withinMinutes(item, "groinPuncture", "recanalisation", 60) && ticiGood(item))
  ];
}

function kpiResultCard(result) {
  const statusClass = result.denominator === 0 || result.denominator == null ? "grey" : result.provisional ? "orange" : result.good === false ? "orange" : "";
  const numericValue = kpiResultNumeric(result);
  const width = numericValue == null ? 0 : Math.max(2, Math.min(100, Math.round((numericValue / kpiChartMax(result.no, numericValue)) * 100)));
  return h("button", {
    type: "button",
    class: `kpi-result-card ${state.kpiDrilldownNo === result.no ? "selected" : ""}`,
    onclick: () => {
      state.selectedKpiNo = result.no;
      state.kpiView = "summary";
      state.kpiDrilldownNo = state.kpiDrilldownNo === result.no ? null : result.no;
      render();
      requestAnimationFrame(() => document.querySelector(".kpi-drilldown-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, [
    h("div", { class: "kpi-result-head" }, [
      h("span", {}, `#${result.no}`),
      h("strong", {}, result.title)
    ]),
    h("div", { class: "kpi-result-value" }, result.value),
    h("div", { class: "kpi-card-chart" }, h("i", { class: result.provisional ? "pending" : "", style: `width:${width}%` })),
    h("div", { class: "kpi-result-meta" }, [
      h("span", {}, result.meta),
      h("span", { class: `tag ${statusClass}` }, result.provisional ? "DATA PENDING" : result.frequency || "Monthly")
    ])
  ]);
}

function kpiDrilldownPanel(result, cases, admin) {
  const detail = kpiCaseAudit(result.no, cases, admin);
  const pending = detail.eligible.filter((item) => !detail.isComplete(item));
  const completed = detail.eligible.length - pending.length;
  return h("section", { class: "kpi-drilldown-panel" }, [
    h("div", { class: "kpi-drilldown-head" }, [
      h("div", {}, [
        h("span", {}, `KPI ${result.no}`),
        h("h2", {}, result.title),
        h("p", {}, detail.note || `Completed ${completed}/${detail.eligible.length}. Click a patient to open the case.`)
      ]),
      h("button", { type: "button", class: "ghost-btn", onclick: () => { state.kpiDrilldownNo = null; render(); } }, "Close")
    ]),
    detail.patientLevel === false
      ? h("div", { class: "complete-panel" }, detail.note || "This KPI is calculated from monthly admin inputs, not individual patient records.")
      : pending.length
        ? h("div", { class: "kpi-pending-list" }, pending.map((item, index) => kpiPendingCaseButton(item, index, detail.missingFields(item))))
        : h("div", { class: "complete-panel" }, detail.eligible.length ? "No pending patient data detected for this KPI." : "No eligible patients in this reporting period.")
  ]);
}

function kpiPendingCaseButton(item, index, missingFields) {
  return h("button", {
    type: "button",
    class: "kpi-pending-case",
    onclick: () => go("timeline", item.id)
  }, [
    h("span", { class: "row-number" }, String(index + 1)),
    h("strong", {}, item.patientName || "Unnamed Patient"),
    h("em", {}, formatCaseDateTime(item.arrivalTime)),
    h("small", {}, missingFields.join(", ") || "Required KPI data pending")
  ]);
}

function kpiCaseAudit(no, cases, admin) {
  const ischemicCases = cases.filter((item) => ["Ischemic Stroke", "LVO Suspected"].includes(item.suspicion));
  const inpatientCases = cases.filter((item) => kpiValue(item, "strokePresentationType") === "Inpatient stroke");
  const diagnosticCases = cases.filter((item) => kpiValue(item, "diagnosticImagingPerformed") === "Yes" || Boolean(kpiValue(item, "diagnosticImagingStartTime")));
  const brainImagingCases = cases.filter((item) => kpiValue(item, "diagnosticImagingPerformed") === "Yes" || Boolean(firstBrainImagingStartTime(item)));
  const ivtCases = cases.filter((item) => item.ivt?.eligible === "Yes" || kpiValue(item, "ivtGiven") === "Yes");
  const evtCases = cases.filter((item) => kpiValue(item, "evtPerformed") === "Yes" || Boolean(stageTime(item, "groinPuncture")));
  const carotidCases = cases.filter((item) => kpiValue(item, "ceaPerformed") === "Yes" || kpiValue(item, "carotidAngioplastyStentingPerformed") === "Yes");
  const angiographyCases = cases.filter((item) => kpiValue(item, "diagnosticAngiographyPerformed") === "Yes");
  const intracranialCases = cases.filter((item) => kpiValue(item, "intracranialAngioplastyStentingPerformed") === "Yes");
  const reperfusionCases = ischemicCases.filter((item) =>
    kpiValue(item, "evtPerformed") === "Yes" ||
    kpiValue(item, "intraArterialThrombolysis") === "Yes" ||
    Boolean(item.mt?.tici)
  );
  const audit = (eligible, isComplete, missingFields, note = "") => ({ eligible, isComplete, missingFields, note });
  const timingAudit = (eligible, startFn, endFn, startLabel, endLabel) => audit(
    eligible,
    (item) => minutesBetween(startFn(item), endFn(item)) != null,
    (item) => {
      const start = startFn(item);
      const end = endFn(item);
      return [
        ...missingIf(!start, startLabel),
        ...missingIf(!end, endLabel),
        ...missingIf(Boolean(start && end && minutesBetween(start, end) == null), `Invalid or reversed time: ${startLabel} -> ${endLabel}`)
      ];
    }
  );
  const answerAudit = (eligible, key, label) => audit(
    eligible,
    (item) => ["Yes", "No"].includes(kpiValue(item, key)),
    (item) => ["Yes", "No"].includes(kpiValue(item, key)) ? [] : [label]
  );
  const verifiedAudit = (eligible, key, label, extraComplete = () => true, extraMissing = () => []) => audit(
    eligible,
    (item) => ["Yes", "No"].includes(kpiValue(item, key)) && extraComplete(item),
    (item) => [
      ...(["Yes", "No"].includes(kpiValue(item, key)) ? [] : [label]),
      ...extraMissing(item)
    ]
  );
  switch (no) {
    case 1:
      return timingAudit(
        brainImagingCases,
        strokeReferenceTime,
        firstBrainImagingStartTime,
        "Stroke reference time",
        "First brain imaging start time"
      );
    case 2:
      return audit(ivtCases, (item) => Boolean(stageTime(item, "ivtStarted")) || kpiValue(item, "ivtGiven") === "No", (item) => [
        ...missingIf(!stageTime(item, "ivtStarted") && kpiValue(item, "ivtGiven") !== "No", "IVT started / IVT not given decision")
      ]);
    case 3:
      return verifiedAudit(ivtCases, "sichAfterIvt", "sICH after IVT", (item) => kpiValue(item, "sichAfterIvt") === "No" || validatedSich(item, "Ivt", stageTime(item, "ivtStarted")) !== null, (item) => kpiValue(item, "sichAfterIvt") === "Yes" && validatedSich(item, "Ivt", stageTime(item, "ivtStarted")) === null ? ["sICH time / NIHSS increase / imaging confirmation"] : []);
    case 4:
      return timingAudit(
        inpatientCases,
        (item) => kpiValue(item, "strokeRecognitionTime"),
        (item) => stageTime(item, "initialOrders"),
        "Stroke recognition time",
        "Detailed neurological assessment / initial orders"
      );
    case 5:
      return answerAudit(cases, "dysphagiaScreening", "Dysphagia screening documented");
    case 6:
      return audit(cases, (item) => admissionReferenceTime(item) && kpiValue(item, "physiotherapyAssessmentTime"), (item) => [
        ...missingIf(!admissionReferenceTime(item), "Admission time"),
        ...missingIf(!kpiValue(item, "physiotherapyAssessmentTime"), "Rehab assessment time")
      ]);
    case 7:
      return audit(cases.filter((item) => kpiValue(item, "followup90DayCompleted") === "Yes" || kpiValue(item, "mrs90Days") !== ""), (item) => kpiValue(item, "mrs90Days") !== "", () => ["90-day mRS"]);
    case 8:
      return verifiedAudit(cases, "medicationError", "Medication error");
    case 9:
      return verifiedAudit(cases, "deathInHospital", "Death in hospital", (item) => kpiValue(item, "deathInHospital") === "No" || Boolean(kpiValue(item, "deathTime")), (item) => kpiValue(item, "deathInHospital") === "Yes" && !kpiValue(item, "deathTime") ? ["Death time"] : []);
    case 10:
      return verifiedAudit(carotidCases, "strokeDeath30DaysAfterCea", "Stroke/death after CEA/carotid procedure", (item) => kpiValue(item, "strokeDeath30DaysAfterCea") === "No" || verifiedWithinWindow(item, "carotidProcedureTime", "carotidStrokeDeathTime", 30 * 24 * 60) !== null, (item) => kpiValue(item, "strokeDeath30DaysAfterCea") === "Yes" ? ["Carotid procedure time / event time"] : []);
    case 11:
      return verifiedAudit(angiographyCases, "strokeDeath24HoursAfterAngiography", "Stroke/death after diagnostic angiography", (item) => kpiValue(item, "strokeDeath24HoursAfterAngiography") === "No" || verifiedWithinWindow(item, "diagnosticAngiographyTime", "diagnosticAngiographyStrokeDeathTime", 24 * 60) !== null, (item) => kpiValue(item, "strokeDeath24HoursAfterAngiography") === "Yes" ? ["Angiography time / event time"] : []);
    case 12:
      return verifiedAudit(cases, "pressureUlcerNewWorsening", "Pressure ulcer", (item) => kpiValue(item, "pressureUlcerNewWorsening") === "No" || Boolean(kpiValue(item, "pressureUlcerStage")), (item) => kpiValue(item, "pressureUlcerNewWorsening") === "Yes" && !kpiValue(item, "pressureUlcerStage") ? ["Pressure ulcer stage"] : []);
    case 13:
      return answerAudit(cases, "dvtAfterAdmission", "DVT after admission");
    case 14:
      return audit(diagnosticCases, (item) => kpiValue(item, "diagnosticImagingPresentationTime") && (kpiValue(item, "diagnosticImagingStartTime") || firstBrainImagingStartTime(item)), (item) => [
        ...missingIf(!kpiValue(item, "diagnosticImagingPresentationTime"), "Imaging presentation/request time"),
        ...missingIf(!(kpiValue(item, "diagnosticImagingStartTime") || firstBrainImagingStartTime(item)), "Imaging start time")
      ]);
    case 15:
      return { patientLevel: false, eligible: [], isComplete: () => true, missingFields: () => [], note: "This KPI uses monthly admin inputs: thrombolytic stock-outs and formulary drugs." };
    case 16:
      return verifiedAudit(cases, "patientFall", "Patient fall");
    case 17:
      return audit(ischemicCases.filter((item) => kpiValue(item, "evtIndicated") === "Yes"), (item) => ["Direct arrival", "Transfer"].includes(kpiValue(item, "evtArrivalType")) && (stageTime(item, "firstPass") || kpiValue(item, "evtPerformed") === "No"), (item) => [
        ...missingIf(!["Direct arrival", "Transfer"].includes(kpiValue(item, "evtArrivalType")), "EVT arrival type"),
        ...missingIf(!stageTime(item, "firstPass") && kpiValue(item, "evtPerformed") !== "No", "First pass time / EVT not performed decision")
      ]);
    case 18:
      return verifiedAudit(evtCases, "sichAfterEvt", "sICH after EVT", (item) => kpiValue(item, "sichAfterEvt") === "No" || validatedSich(item, "Evt", stageTime(item, "firstPass") || stageTime(item, "groinPuncture")) !== null, (item) => kpiValue(item, "sichAfterEvt") === "Yes" ? ["sICH time / NIHSS increase / imaging confirmation"] : []);
    case 19:
      return audit(cases, (item) => admissionReferenceTime(item) && kpiValue(item, "speechTherapyAssessmentTime"), (item) => [
        ...missingIf(!admissionReferenceTime(item), "Admission time"),
        ...missingIf(!kpiValue(item, "speechTherapyAssessmentTime"), "Speech therapy reassessment time")
      ]);
    case 20:
      return verifiedAudit(intracranialCases, "strokeDeath30DaysAfterAngioplastyStenting", "Stroke/death after intracranial procedure", (item) => kpiValue(item, "strokeDeath30DaysAfterAngioplastyStenting") === "No" || verifiedWithinWindow(item, "intracranialProcedureTime", "intracranialStrokeDeathTime", 30 * 24 * 60) !== null, (item) => kpiValue(item, "strokeDeath30DaysAfterAngioplastyStenting") === "Yes" ? ["Intracranial procedure time / event time"] : []);
    case 21:
      return answerAudit(ischemicCases.filter((item) => kpiValue(item, "evdInserted") === "Yes"), "ventriculitisAfterEvd", "Ventriculitis after EVD");
    case 22:
      return audit(reperfusionCases, (item) => Boolean(item.mt?.tici), () => ["Final TICI score"]);
    case 23:
      return audit(cases.filter((item) => kpiValue(item, "largeVesselOcclusion") === "Yes" && (kpiValue(item, "evtPerformed") === "Yes" || Boolean(stageTime(item, "firstPass")))), (item) => stageTime(item, "arrival") && stageTime(item, "firstPass") && item.mt?.tici, (item) => [
        ...missingIf(!stageTime(item, "firstPass"), "First pass time"),
        ...missingIf(!item.mt?.tici, "Final TICI score")
      ]);
    case 24:
      return audit(evtCases, (item) => stageTime(item, "groinPuncture") && stageTime(item, "recanalisation") && item.mt?.tici, (item) => [
        ...missingIf(!stageTime(item, "groinPuncture"), "Groin puncture time"),
        ...missingIf(!stageTime(item, "recanalisation"), "Recanalisation time"),
        ...missingIf(!item.mt?.tici, "Final TICI score")
      ]);
    default:
      return audit(cases, () => true, () => []);
  }
}

function missingIf(condition, label) {
  return condition ? [label] : [];
}

function dualIvtComplianceKpi(cases) {
  const within45 = cases.filter((item) => withinMinutes(item, "arrival", "ivtStarted", 45)).length;
  const within60 = cases.filter((item) => withinMinutes(item, "arrival", "ivtStarted", 60)).length;
  const denominator = cases.length;
  return {
    no: 2,
    title: "IVT within defined timeframes",
    value: denominator ? `${Math.round((within60 / denominator) * 100)}% within 60 min` : "--",
    numerator: within60,
    denominator,
    chartValue: denominator ? (within60 / denominator) * 100 : null,
    meta: `45 min: ${within45}/${denominator} | 60 min: ${within60}/${denominator}`,
    frequency: "Continuous"
  };
}

function verifiedOutcomeKpi(no, titleText, eligibleCases, answerKey, positiveFn) {
  const completedCases = eligibleCases.filter((item) => {
    const answer = kpiValue(item, answerKey);
    return answer === "No" || (answer === "Yes" && positiveFn(item) !== null);
  });
  const numerator = completedCases.filter((item) => kpiValue(item, answerKey) === "Yes" && positiveFn(item) === true).length;
  const denominator = eligibleCases.length;
  const complete = completedCases.length;
  const provisional = complete < denominator;
  return {
    no,
    title: titleText,
    value: denominator && !provisional ? `${Math.round((numerator / denominator) * 100)}%` : denominator ? "Pending" : "--",
    numerator,
    denominator,
    chartValue: denominator ? (numerator / denominator) * 100 : null,
    provisional,
    meta: `${numerator}/${denominator} | complete ${complete}/${denominator}`,
    frequency: "Monthly"
  };
}

function verifiedRatioKpi(no, titleText, cases, answerKey, numerator, denominator, suffix, evidenceComplete = () => true) {
  const complete = cases.filter((item) => ["Yes", "No"].includes(kpiValue(item, answerKey)) && evidenceComplete(item)).length;
  const provisional = complete < cases.length;
  return {
    no,
    title: titleText,
    value: denominator && !provisional ? `${Math.round((numerator / denominator) * 100)}${suffix}` : denominator ? "Pending" : "--",
    numerator,
    denominator,
    chartValue: denominator ? (numerator / denominator) * 100 : null,
    provisional,
    meta: `${numerator || 0}/${denominator || 0} | complete ${complete}/${cases.length}`
  };
}

function verifiedRateKpi(no, titleText, cases, answerKey, numerator, denominator, multiplier, suffix) {
  const complete = cases.filter((item) => ["Yes", "No"].includes(kpiValue(item, answerKey))).length;
  const provisional = complete < cases.length;
  return {
    no,
    title: titleText,
    value: denominator && !provisional ? `${((numerator / denominator) * multiplier).toFixed(1)}` : denominator ? "Pending" : "--",
    numerator,
    denominator,
    chartValue: denominator ? (numerator / denominator) * multiplier : null,
    provisional,
    meta: `${numerator || 0}/${denominator || 0} ${suffix} | complete ${complete}/${cases.length}`
  };
}

function verifiedTiciKpi(cases) {
  const complete = cases.filter((item) => Boolean(item.mt?.tici)).length;
  const numerator = cases.filter(ticiGood).length;
  const denominator = cases.length;
  const provisional = complete < denominator;
  return {
    no: 22,
    title: "TICI 2B or higher after reperfusion therapy",
    value: denominator && !provisional ? `${Math.round((numerator / denominator) * 100)}%` : denominator ? "Pending" : "--",
    numerator,
    denominator,
    chartValue: denominator ? (numerator / denominator) * 100 : null,
    provisional,
    meta: `${numerator}/${denominator} | TICI recorded ${complete}/${denominator}`
  };
}

function verifiedRankinKpi(cases) {
  const complete = cases.filter((item) => kpiValue(item, "mrs90Days") !== "").length;
  const numerator = cases.filter((item) => rankinGood(kpiValue(item, "mrs90Days"))).length;
  const denominator = cases.length;
  const provisional = complete < denominator;
  return {
    no: 7,
    title: "mRS 0-2 at 90 days",
    value: denominator && !provisional ? `${Math.round((numerator / denominator) * 100)}%` : denominator ? "Pending" : "--",
    numerator,
    denominator,
    chartValue: denominator ? (numerator / denominator) * 100 : null,
    provisional,
    meta: `${numerator}/${denominator} | mRS recorded ${complete}/${denominator}`
  };
}

function percentageKpi(no, titleText, denominatorCases, included, numeratorFn, frequency = "Monthly") {
  const denominator = denominatorCases.filter((item) => !included || included(item)).length;
  const numerator = denominatorCases.filter((item) => (!included || included(item)) && numeratorFn(item)).length;
  return {
    no,
    title: titleText,
    value: denominator ? `${Math.round((numerator / denominator) * 100)}%` : "--",
    numerator,
    denominator,
    chartValue: denominator ? (numerator / denominator) * 100 : null,
    meta: `${numerator}/${denominator}`,
    frequency
  };
}

function averageKpi(no, titleText, cases, minutesFn, label) {
  const values = cases.map(minutesFn).filter((value) => value != null);
  const total = values.reduce((sum, value) => sum + value, 0);
  const average = values.length ? Math.round(total / values.length) : null;
  const provisional = values.length < cases.length;
  return {
    no,
    title: titleText,
    value: average == null ? "--" : provisional ? "Pending" : `${average} min`,
    numerator: total,
    denominator: cases.length,
    chartValue: average,
    provisional,
    meta: `${label} | timed ${values.length}/${cases.length}`
  };
}

function averageAdminKpi(no, titleText, numerator, denominator, label) {
  return {
    no,
    title: titleText,
    value: denominator ? `${Math.round(numerator / denominator)} min` : "--",
    numerator,
    denominator,
    chartValue: denominator ? numerator / denominator : null,
    meta: `${label} | ${numerator || 0}/${denominator || 0}`
  };
}

function ratioKpi(no, titleText, numerator, denominator, suffix) {
  return {
    no,
    title: titleText,
    value: denominator ? `${Math.round((numerator / denominator) * 100)}${suffix}` : "--",
    numerator,
    denominator,
    chartValue: denominator ? (numerator / denominator) * 100 : null,
    meta: `${numerator || 0}/${denominator || 0}`
  };
}

function rateKpi(no, titleText, numerator, denominator, multiplier, suffix) {
  return {
    no,
    title: titleText,
    value: denominator ? `${((numerator / denominator) * multiplier).toFixed(1)}` : "--",
    numerator,
    denominator,
    chartValue: denominator ? (numerator / denominator) * multiplier : null,
    meta: `${numerator || 0}/${denominator || 0} ${suffix}`
  };
}

function kpiAdminForMonth(month) {
  return { ...kpiAdminDefaults, ...(state.kpiAdminData[month] || {}) };
}

function casesForMonth(month) {
  return state.cases.filter((item) => monthKey(new Date(item.arrivalTime)) === month);
}

function selectedKpiRange() {
  let start = parseDateInput(state.kpiRangeStart) || startOfMonth(new Date());
  let end = parseDateInput(state.kpiRangeEnd) || new Date();
  if (start > end) [start, end] = [end, start];
  end = endOfDay(end);
  return { start, end };
}

function applyKpiPreset(preset) {
  const now = new Date();
  let start = startOfMonth(now);
  if (preset === "quarter") start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  if (preset === "year") start = new Date(now.getFullYear(), 0, 1);
  state.kpiRangePreset = preset;
  if (preset !== "custom") {
    state.kpiRangeStart = dateInputValue(start);
    state.kpiRangeEnd = dateInputValue(now);
  }
  render();
}

function isCodeStrokeKpiIncluded(item) {
  return item.includeInCodeStrokeKpi === "Yes";
}

function isIvtTreatmentCase(item) {
  return kpiValue(item, "ivtGiven") === "Yes" || Boolean(stageTime(item, "ivtStarted"));
}

function isMechanicalThrombectomyCase(item) {
  return kpiValue(item, "evtPerformed") === "Yes" ||
    Boolean(stageTime(item, "groinPuncture") || stageTime(item, "firstPass") || stageTime(item, "recanalisation"));
}

function kpiIncludedCases(cases) {
  return cases.filter(isCodeStrokeKpiIncluded);
}

function casesForRange(start, end) {
  return state.cases.filter((item) => {
    const date = new Date(item.arrivalTime);
    return date >= start && date <= end;
  });
}

function kpiAdminForRange(start, end) {
  const months = monthsInRange(start, end);
  const values = months.map(kpiAdminForMonth);
  return {
    medicationErrorOpportunities: values.reduce((sum, item) => sum + num(item.medicationErrorOpportunities), 0),
    thrombolyticStockouts: values.reduce((sum, item) => sum + num(item.thrombolyticStockouts), 0),
    thrombolyticFormularyDrugs: values.reduce((latest, item) => item.thrombolyticFormularyDrugs !== "" ? num(item.thrombolyticFormularyDrugs) : latest, 0)
  };
}

function monthlyKpiTrend(start, end, kpiNo) {
  return monthsInRange(start, end).map((month) => {
    const monthStart = new Date(`${month}-01T00:00:00`);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999);
    const item = buildNabhKpiReport(casesForRange(monthStart, monthEnd), kpiAdminForMonth(month)).find((entry) => entry.no === kpiNo);
    return {
      label: monthStart.toLocaleDateString([], { month: "short", year: "2-digit" }),
      value: kpiResultNumeric(item),
      provisional: item?.provisional || false
    };
  });
}

function monthsInRange(start, end) {
  const months = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cursor <= last) {
    months.push(monthKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function parseDateInput(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dateInputValue(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function formatReportDate(date) {
  return date.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
}

function formatCompactDate(date) {
  return `${date.getDate()}/${date.getMonth() + 1}/${String(date.getFullYear()).slice(-2)}`;
}

function kpiResultNumeric(result) {
  if (!result) return null;
  if (result.chartValue != null) return result.chartValue;
  if (!result.denominator) return null;
  if ([1, 4, 14].includes(result.no)) return result.numerator / result.denominator;
  if (result.no === 16) return (result.numerator / result.denominator) * 1000;
  return (result.numerator / result.denominator) * 100;
}

function kpiChartMax(kpiNo, value = 0) {
  if ([1, 4, 14].includes(kpiNo)) return Math.max(60, Math.ceil(value / 30) * 30);
  if (kpiNo === 16) return Math.max(10, Math.ceil(value / 5) * 5);
  return 100;
}

function formatKpiChartValue(kpiNo, value) {
  if ([1, 4, 14].includes(kpiNo)) return `${Math.round(value)}m`;
  if (kpiNo === 16) return value.toFixed(1);
  return `${Math.round(value)}%`;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function defaultKpiFieldCount() {
  return Object.keys(defaultKpiData()).length;
}

function kpiValue(item, key) {
  const derived = derivedKpiData(item);
  if (timelineSyncedKpiTimestampKeys.has(key) && derived[key]) return derived[key];
  const stored = item.kpi?.[key];
  return stored !== "" && stored != null ? stored : derived[key] || "";
}

function derivedKpiData(item) {
  const stages = item.stages || {};
  const firstImagingStart = firstBrainImagingStartTime(item);
  const firstImagingPresentation = firstImagingPresentationTime(item);
  const evtIndicated = item.kpi?.evtIndicated || (stages.mtDecided?.time ? "Yes" : "");
  const evtNotIndicated = evtIndicated === "No";
  return {
    hospitalAdmissionTime: item.arrivalTime || "",
    strokeRecognitionTime: item.kpi?.strokePresentationType === "Inpatient stroke" ? stages.codeStroke?.time || "" : "",
    dysphagiaScreening: stages.dysphagiaScreening?.time ? "Yes" : "",
    diagnosticImagingRequestTime: stages.ctInformed?.time || "",
    diagnosticImagingPresentationTime: firstImagingPresentation,
    diagnosticImagingStartTime: firstImagingStart,
    diagnosticImagingPerformed: firstImagingStart ? "Yes" : "",
    strokeUnitAdmissionTime: stages.strokeUnitAdmission?.time || "",
    physiotherapyAssessmentTime: stages.physiotherapyAssessment?.time || "",
    speechTherapyAssessmentTime: stages.speechTherapyAssessment?.time || "",
    strokeUnitDischargeTime: stages.strokeUnitDischarge?.time || "",
    dischargeTime: stages.hospitalDischarge?.time || "",
    ivtGiven: stages.ivtStarted?.time ? "Yes" : "",
    evtIndicated,
    evtPerformed: evtNotIndicated ? "Not applicable" : stages.groinPuncture?.time || stages.firstPass?.time || stages.recanalisation?.time ? "Yes" : "",
    largeVesselOcclusion: evtNotIndicated ? "Not applicable" : item.suspicion === "LVO Suspected" ? "Yes" : ""
  };
}

function countCases(cases, key) {
  return cases.filter((item) => kpiValue(item, key) === "Yes").length;
}

function strokeReferenceTime(item) {
  return kpiValue(item, "strokePresentationType") === "Inpatient stroke"
    ? kpiValue(item, "strokeRecognitionTime")
    : stageTime(item, "arrival");
}

function admissionReferenceTime(item) {
  return kpiValue(item, "hospitalAdmissionTime") || item.arrivalTime;
}

function medicationErrorTotal(cases) {
  return cases.reduce((total, item) => {
    const count = num(kpiValue(item, "medicationErrorCount"));
    if (count > 0) return total + count;
    return total + (kpiValue(item, "medicationError") === "Yes" ? 1 : 0);
  }, 0);
}

function pressureUlcerCount(cases) {
  return cases.filter((item) => {
    const stage = kpiValue(item, "pressureUlcerStage");
    return kpiValue(item, "pressureUlcerNewWorsening") === "Yes" && stage && stage !== "No ulcer";
  }).length;
}

function verifiedDeathWithin7Days(item) {
  if (!["Yes", "No"].includes(kpiValue(item, "deathInHospital")) || !kpiValue(item, "deathTime")) return null;
  if (kpiValue(item, "deathInHospital") !== "Yes") return false;
  return withinIsoMinutes(admissionReferenceTime(item), kpiValue(item, "deathTime"), 7 * 24 * 60);
}

function verifiedWithinWindow(item, startKey, endKey, limitMinutes) {
  if (!kpiValue(item, startKey) || !kpiValue(item, endKey)) return null;
  return withinIsoMinutes(kpiValue(item, startKey), kpiValue(item, endKey), limitMinutes);
}

function validatedSich(item, suffix, treatmentTime) {
  const eventTime = kpiValue(item, `sichAfter${suffix}Time`);
  const nihssAnswer = kpiValue(item, `sichAfter${suffix}NihssIncrease`);
  const imagingAnswer = kpiValue(item, `sichAfter${suffix}ImagingConfirmed`);
  if (!treatmentTime || !eventTime || !["Yes", "No"].includes(nihssAnswer) || !["Yes", "No"].includes(imagingAnswer)) return null;
  return nihssAnswer === "Yes" &&
    imagingAnswer === "Yes" &&
    withinIsoMinutes(treatmentTime, eventTime, 24 * 60);
}

function num(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function stageTime(item, id) {
  return item.stages?.[id]?.time || "";
}

function firstRecordedTime(item, stageIds) {
  return stageIds
    .map((stageId) => stageTime(item, stageId))
    .filter(Boolean)
    .sort((a, b) => new Date(a) - new Date(b))[0] || "";
}

function firstBrainImagingStartTime(item) {
  return firstRecordedTime(item, ["ncctStarted", "mriStarted"]);
}

function firstImagingPresentationTime(item) {
  return firstRecordedTime(item, ["reachedCt", "reachedMri"]);
}

function minutesBetween(start, end) {
  if (!start || !end) return null;
  const minutes = Math.round((new Date(end) - new Date(start)) / 60000);
  return Number.isFinite(minutes) && minutes >= 0 ? minutes : null;
}

function withinIsoMinutes(start, end, limit) {
  const minutes = minutesBetween(start, end);
  return minutes != null && minutes <= limit;
}

function withinMinutes(item, startStage, endStage, limit) {
  return withinIsoMinutes(stageTime(item, startStage), stageTime(item, endStage), limit);
}

function rankinGood(value) {
  return value !== "" && Number(value) <= 2;
}

function ticiGood(item) {
  return ["2B", "2C", "3"].includes(item.mt?.tici || "");
}

function evtWithinTarget(item) {
  const arrivalType = kpiValue(item, "evtArrivalType");
  const limit = arrivalType === "Transfer" ? 60 : 90;
  return (kpiValue(item, "evtPerformed") === "Yes" || Boolean(stageTime(item, "firstPass"))) && withinMinutes(item, "arrival", "firstPass", limit);
}

function patientStrokeUnitDays(item) {
  const start = kpiValue(item, "strokeUnitAdmissionTime");
  const end = kpiValue(item, "strokeUnitDischargeTime");
  if (!start || !end) return 0;
  const milliseconds = new Date(end) - new Date(start);
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return 0;
  return Math.max(1, Math.ceil(milliseconds / (24 * 60 * 60 * 1000)));
}

function patientFallCount(item) {
  if (kpiValue(item, "patientFall") !== "Yes") return 0;
  return Math.max(1, num(kpiValue(item, "patientFallCount")));
}

function diagnosticWaitingMinutes(item) {
  const start = kpiValue(item, "diagnosticImagingPresentationTime");
  const end = kpiValue(item, "diagnosticImagingStartTime") || firstBrainImagingStartTime(item);
  return minutesBetween(start, end);
}

function casesScreen() {
  const cases = filteredCases();
  return h("section", {}, [
    casesFilterPanel(),
    cases.length ? h("div", { class: "case-list compact-case-list" }, cases.map((item, index) => caseRow(item, cases.length - index))) : empty("No cases found for the selected period.")
  ]);
}

function casesFilterPanel() {
  const allCount = applyCasesClinicalFilters(state.cases).length;
  return h("div", { class: "cases-filter-panel" }, [
    h("div", { class: "cases-filter-topline" }, [
      h("div", { class: "cases-filter-modes" }, [
        casesFilterButton("month", "Month"),
        casesFilterButton("custom", "Custom Range"),
        casesFilterButton("all", "All Cases")
      ]),
      h("div", { class: "cases-filter-toggles" }, [
        casesClinicalFilterToggle("casesKpiOnly", "KPI cases"),
        casesClinicalFilterToggle("casesIvtOnly", "IVT cases"),
        casesClinicalFilterToggle("casesMtOnly", "MT cases"),
        doctorFilterToggle("cases")
      ])
    ]),
    state.casesDoctorFilterOpen ? doctorFilterPanel("cases") : null,
    state.casesRangeMode === "month"
      ? field("Select month", h("input", {
          type: "month",
          value: state.casesMonth,
          onchange: (event) => {
            state.casesMonth = event.target.value || monthKey(new Date());
            render();
          }
        }))
      : state.casesRangeMode === "custom"
        ? h("div", { class: "cases-date-range" }, [
            field("From", h("input", {
              type: "date",
              value: state.casesRangeStart,
              onchange: (event) => {
                state.casesRangeStart = event.target.value;
                render();
              }
            })),
            field("To", h("input", {
              type: "date",
              value: state.casesRangeEnd,
              onchange: (event) => {
                state.casesRangeEnd = event.target.value;
                render();
              }
            }))
          ])
        : h("div", { class: "cases-filter-summary" }, `${allCount} matching case${allCount === 1 ? "" : "s"} across all dates`)
  ]);
}

function casesClinicalFilterToggle(stateKey, label) {
  return h("label", { class: `filter-toggle ${state[stateKey] ? "active" : ""}` }, [
    h("input", {
      type: "checkbox",
      checked: state[stateKey],
      onchange: (event) => {
        state[stateKey] = event.target.checked;
        render();
      }
    }),
    h("span", {}, label)
  ]);
}

function doctorFilterToggle(scope) {
  const openKey = scope === "dashboard" ? "dashboardDoctorFilterOpen" : "casesDoctorFilterOpen";
  const selectedKey = scope === "dashboard" ? "dashboardDoctorFilters" : "casesDoctorFilters";
  const selected = state[selectedKey] || [];
  return h("button", {
    type: "button",
    class: `filter-toggle doctor-filter-button ${state[openKey] || selected.length ? "active" : ""}`,
    onclick: () => {
      state[openKey] = !state[openKey];
      render();
    }
  }, `Doctor${selected.length ? `: ${selected.length}` : ""}`);
}

function doctorFilterPanel(scope) {
  const selectedKey = scope === "dashboard" ? "dashboardDoctorFilters" : "casesDoctorFilters";
  const selected = state[selectedKey] || [];
  return h("div", { class: "doctor-filter-panel" }, [
    ...admittingConsultants.map(([id, name, code]) => h("button", {
      type: "button",
      class: selected.includes(id) ? "active" : "",
      onclick: () => toggleDoctorFilter(selectedKey, id)
    }, `${code} - ${name}`)),
    selected.length ? h("button", {
      type: "button",
      class: "clear-filter",
      onclick: () => {
        state[selectedKey] = [];
        render();
      }
    }, "Clear") : null
  ]);
}

function toggleDoctorFilter(stateKey, doctorId) {
  const selected = new Set(state[stateKey] || []);
  if (selected.has(doctorId)) selected.delete(doctorId);
  else selected.add(doctorId);
  state[stateKey] = [...selected];
  render();
}

function casesFilterButton(mode, label) {
  return h("button", {
    type: "button",
    class: state.casesRangeMode === mode ? "active" : "",
    onclick: () => {
      state.casesRangeMode = mode;
      render();
    }
  }, label);
}

function filteredCases() {
  const sorted = [...state.cases].sort((a, b) => new Date(b.arrivalTime) - new Date(a.arrivalTime));
  let visible = sorted;
  if (state.casesRangeMode === "month") {
    visible = sorted.filter((item) => monthKey(new Date(item.arrivalTime)) === state.casesMonth);
  } else if (state.casesRangeMode === "custom") {
    let start = parseDateInput(state.casesRangeStart) || startOfMonth(new Date());
    let end = parseDateInput(state.casesRangeEnd) || new Date();
    if (start > end) [start, end] = [end, start];
    end = endOfDay(end);
    visible = sorted.filter((item) => {
      const arrival = new Date(item.arrivalTime);
      return arrival >= start && arrival <= end;
    });
  }
  return applyCasesClinicalFilters(visible);
}

function applyCasesClinicalFilters(cases) {
  return cases.filter((item) =>
    (!state.casesKpiOnly || isCodeStrokeKpiIncluded(item)) &&
    (!state.casesIvtOnly || isIvtTreatmentCase(item)) &&
    (!state.casesMtOnly || isMechanicalThrombectomyCase(item)) &&
    doctorFilterMatches(item, state.casesDoctorFilters)
  );
}

function doctorFilterMatches(item, selectedDoctors = []) {
  return !selectedDoctors.length || selectedDoctors.includes(item.admittingConsultant || "");
}

function moreScreen() {
  return h("section", {}, [
    title("More", "App access"),
    h("div", { class: "form-card" }, [
      metricCard("Centre", accessSettings.centreName),
      metricCard("This device", deviceDisplayName(state.deviceRecord || state.device)),
      installButton(),
      state.installMessage ? h("div", { class: "install-help" }, state.installMessage) : null
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
    adminDiagnosticsPanel(),
    adminDevicesPanel()
  ]);
}

function isFourDigitPin(value) {
  return /^\d{4}$/.test(value);
}

function adminDiagnosticsPanel() {
  return h("div", { class: "admin-devices" }, [
    h("div", { class: "section-heading compact-heading" }, [h("h2", {}, "Admin Diagnostics")]),
    h("p", { class: "settings-help" }, "Technical sync and export tools for admin use only."),
    h("div", { class: "form-card" }, [
      metricCard("Storage", "Local PWA"),
      metricCard("Firestore", cloudSync.status),
      metricCard("Firebase project", cloudSync.projectId),
      metricCard("Last cloud sync", cloudSync.lastSyncAt ? formatClock(cloudSync.lastSyncAt) : "--"),
      cloudSync.error ? metricCard("Sync error", cloudSync.error) : null,
      h("button", { class: "secondary-btn", type: "button", onclick: testCloudSync }, "TEST FIREBASE CONNECTION"),
      h("button", { class: "secondary-btn", type: "button", onclick: exportCases }, "EXPORT CASES JSON"),
      h("button", { class: "danger-btn", type: "button", style: "background:#fff0f0;color:#e5484d", onclick: clearCases }, "CLEAR LOCAL CASES")
    ])
  ]);
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
    state.devices = snapshot.docs.map((doc) => ({ deviceId: doc.id, ...doc.data() }));
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
    ["blocked", "Blocked / Revoked Devices"]
  ];
  return h("div", { class: "admin-devices" }, [
    h("div", { class: "section-heading compact-heading" }, [h("h2", {}, "Admin Devices")]),
    h("p", { class: "settings-help" }, "Approve only known doctors, coordinators, or hospital devices. Revoke old devices to make users request access again with their details."),
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
    h("div", { class: "device-info" }, [
      h("strong", {}, `${deviceDisplayName(device)}${isThisDevice ? " (this device)" : ""}`),
      h("span", {}, `Code: ${device.deviceCode || device.deviceId || "--"}`),
      h("span", {}, `Department / role: ${device.department || "--"}`),
      h("span", {}, `Device name: ${device.deviceLabel || "--"}`),
      h("span", {}, `Status: ${status}`),
      h("span", {}, `First seen: ${device.firstSeenAt ? formatCaseDateTime(device.firstSeenAt) : "--"}`),
      h("span", {}, `Last seen: ${device.lastSeenAt ? formatCaseDateTime(device.lastSeenAt) : "--"}`)
    ]),
    h("div", { class: "device-actions" }, [
      status !== "approved" ? h("button", { type: "button", class: "record-btn", onclick: () => updateDeviceStatus(device.deviceId, "approved") }, "APPROVE") : null,
      status !== "blocked" ? h("button", { type: "button", class: "manual-btn", onclick: () => updateDeviceStatus(device.deviceId, "blocked") }, status === "approved" ? "REVOKE" : "BLOCK") : null,
      status === "blocked" ? h("button", { type: "button", class: "manual-btn", onclick: () => updateDeviceStatus(device.deviceId, "pending") }, "UNBLOCK") : null
    ])
  ]);
}

function deviceDisplayName(device) {
  if (!device) return "--";
  const name = device.doctorName || device.deviceLabel;
  return name || device.deviceCode || device.id || "--";
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
  if (!item || item.caseStopped) return;
  const mtWorkflow = mtWorkflowState(item);
  if (["evtConsent", "cathlabInformed"].includes(stageId) && mtWorkflow.indicated !== "Yes") return;
  if (mtStages.slice(1).some(([id]) => id === stageId) && mtWorkflow.performed !== "Yes") return;
  const time = manualTime || new Date().toISOString();
  item.stages[stageId] = { time, mode, reason, notApplicable: false, previous: null };
  syncStageToKpi(item, stageId, time);
  saveCases();
  render();
}

function toggleStageNotApplicable(caseId, stageId) {
  const item = state.cases.find((entry) => entry.id === caseId);
  if (!item || item.caseStopped) return;
  const current = item.stages[stageId];
  if (current?.notApplicable) {
    item.stages[stageId] = current.previous?.time
      ? { ...current.previous, notApplicable: false, previous: null }
      : { time: "", mode: "", reason: "", notApplicable: false, previous: null };
  } else {
    item.stages[stageId] = {
      time: "",
      notApplicable: true,
      mode: "na",
      reason: "Not applicable",
      previous: current?.time ? current : null
    };
  }
  if (["reachedCt", "reachedMri", "ncctStarted", "mriStarted"].includes(stageId)) syncImagingKpiFields(item);
  saveCases();
  render();
}

function syncStageToKpi(item, stageId, time) {
  const timestampMap = {
    ctInformed: "diagnosticImagingRequestTime",
    strokeUnitAdmission: "strokeUnitAdmissionTime",
    physiotherapyAssessment: "physiotherapyAssessmentTime",
    speechTherapyAssessment: "speechTherapyAssessmentTime",
    strokeUnitDischarge: "strokeUnitDischargeTime",
    hospitalDischarge: "dischargeTime"
  };
  const timestampKey = timestampMap[stageId];
  item.kpi = { ...defaultKpiData(), ...(item.kpi || {}) };
  if (timestampKey) {
    item.kpi[timestampKey] = time;
    if (item.kpiFieldStatus) delete item.kpiFieldStatus[timestampKey];
  }
  if (stageId === "dysphagiaScreening") item.kpi.dysphagiaScreening = "Yes";
  if (["reachedCt", "reachedMri", "ncctStarted", "mriStarted"].includes(stageId)) syncImagingKpiFields(item);
  if (stageId === "ivtStarted") item.kpi.ivtGiven = "Yes";
  if (["groinPuncture", "firstPass", "recanalisation"].includes(stageId)) item.kpi.evtPerformed = "Yes";
}

function syncImagingKpiFields(item) {
  item.kpi = { ...defaultKpiData(), ...(item.kpi || {}) };
  const firstImagingPresentation = firstImagingPresentationTime(item);
  const firstImagingStart = firstBrainImagingStartTime(item);
  if (firstImagingPresentation) {
    item.kpi.diagnosticImagingPresentationTime = firstImagingPresentation;
    if (item.kpiFieldStatus) delete item.kpiFieldStatus.diagnosticImagingPresentationTime;
  }
  if (firstImagingStart) {
    item.kpi.diagnosticImagingStartTime = firstImagingStart;
    item.kpi.diagnosticImagingPerformed = "Yes";
    if (item.kpiFieldStatus) delete item.kpiFieldStatus.diagnosticImagingStartTime;
  }
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

function openKpi(caseId) {
  state.kpiTarget = { caseId };
  render();
}

function kpiModal() {
  if (!state.kpiTarget) return null;
  const item = state.cases.find((entry) => entry.id === state.kpiTarget.caseId);
  if (!item) {
    state.kpiTarget = null;
    return null;
  }
  const kpi = ensureKpiData(item);
  const progress = kpiCompletion(item);
  return h("div", { class: "modal-backdrop kpi-backdrop" }, [
    h("form", {
      class: "modal kpi-modal",
      onsubmit: (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        item.kpi = { ...defaultKpiData(), ...(item.kpi || {}) };
        item.kpiFieldStatus = { ...(item.kpiFieldStatus || {}) };
        const presentationType = form.get("strokePresentationType") || kpiValue(item, "strokePresentationType");
        kpiTimestampFields.forEach(([key]) => {
          const value = form.get(key);
          const notApplicable = key === "strokeRecognitionTime"
            ? presentationType !== "Inpatient stroke"
            : form.get(`${key}__status`) === "na";
          if (notApplicable) {
            item.kpi[key] = "";
            item.kpiFieldStatus[key] = "na";
          } else {
            item.kpi[key] = value ? new Date(value).toISOString() : "";
            delete item.kpiFieldStatus[key];
          }
        });
        [...kpiYesNoFields.filter(([key]) => !workflowKpiKeys.has(key)), ...kpiScoreFields, ...kpiNumberFields].forEach(([key]) => {
          const value = form.get(key) || "";
          if (key === "mrs90Days" && value === "Pending") {
            item.kpi[key] = "";
            item.kpiFieldStatus[key] = "pending";
          } else {
            item.kpi[key] = value;
            if (key === "mrs90Days") delete item.kpiFieldStatus[key];
          }
        });
        item.kpiUpdatedAt = new Date().toISOString();
        saveCases();
        state.kpiTarget = null;
        render();
      }
    }, [
      h("div", { class: "kpi-modal-head" }, [
        h("div", {}, [
          h("h3", {}, "KPI Data"),
          h("p", { class: "modal-help" }, `${item.id} | ${item.patientName}`)
        ]),
        h("span", { class: "tag grey" }, `${progress.completed}/${progress.total}`)
      ]),
      h("div", { class: "kpi-scroll" }, [
        kpiSection("Timestamp Fields", kpiTimestampFields.map(([key, label]) => kpiTimestampField(item, kpi, key, label))),
        kpiSection("Treatment and Outcome Fields", kpiYesNoFields
          .filter(([key]) => !workflowKpiKeys.has(key))
          .map(([key, label]) => field(label, choiceButtons(key, kpiAnswerOptions, kpi[key] || "")))),
        kpiSection("Event Counts", kpiNumberFields.map(([key, label, minimum]) => field(label, h("input", { type: "number", name: key, min: minimum, value: kpi[key] || "0" })))),
        kpiSection("Score Fields", kpiScoreFields.map(([key, label, options]) => {
          const fieldOptions = key === "mrs90Days" ? [...options, "Pending"] : options;
          const value = key === "mrs90Days" && kpiFieldStatus(item, key) === "pending" ? "Pending" : kpi[key];
          return field(label, select(key, fieldOptions, value));
        }))
      ]),
      h("div", { class: "modal-actions" }, [
        h("button", { type: "button", class: "secondary-btn", onclick: () => { state.kpiTarget = null; render(); } }, "CANCEL"),
        h("button", { class: "record-btn", type: "submit" }, "SAVE KPI")
      ])
    ])
  ]);
}

function kpiTimestampField(item, kpi, key, label) {
  const inpatientRecognition = key === "strokeRecognitionTime" && kpiValue(item, "strokePresentationType") === "Inpatient stroke";
  const automaticNotApplicable = key === "strokeRecognitionTime" && !inpatientRecognition;
  const notApplicable = automaticNotApplicable || kpiFieldStatus(item, key) === "na";
  return h("div", { class: "field kpi-timestamp-field" }, [
    h("label", {}, label),
    h("div", { class: "kpi-timestamp-control" }, [
      h("input", {
        type: "datetime-local",
        name: key,
        value: notApplicable ? "" : kpiLocalValue(kpi[key]),
        disabled: notApplicable
      }),
      h("input", { type: "hidden", name: `${key}__status`, value: notApplicable ? "na" : "" }),
      h("button", {
        type: "button",
        class: `kpi-na-btn ${notApplicable ? "active" : ""}`,
        disabled: inpatientRecognition,
        "aria-pressed": notApplicable ? "true" : "false",
        onclick: toggleKpiTimestampNotApplicable
      }, inpatientRecognition ? "Required" : "Not Applicable")
    ])
  ]);
}

function toggleKpiTimestampNotApplicable(event) {
  const button = event.currentTarget;
  const control = button.closest(".kpi-timestamp-control");
  const input = control.querySelector("input[type='datetime-local']");
  const status = control.querySelector("input[type='hidden']");
  const active = status.value === "na";
  status.value = active ? "" : "na";
  input.disabled = !active;
  if (!active) input.value = "";
  button.classList.toggle("active", !active);
  button.setAttribute("aria-pressed", active ? "false" : "true");
}

function kpiSection(label, children) {
  return h("section", { class: "kpi-section" }, [
    h("div", { class: "section-heading compact-heading" }, [h("h2", {}, label)]),
    ...children
  ]);
}

function kpiLocalValue(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : toLocalInput(date);
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

function consultantSelect(value = "") {
  return h("select", { name: "admittingConsultant" }, [
    h("option", { value: "", selected: !value }, "Select"),
    ...admittingConsultants.map(([id, name, code]) =>
      h("option", { value: id, selected: id === value }, `${name} - ${code}`)
    )
  ]);
}

function consultantCode(value) {
  return admittingConsultants.find(([id]) => id === value)?.[2] || "--";
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

function caseRow(item, displayNumber = 1) {
  const status = caseStatus(item);
  const elapsed = formatDuration(caseEndTime(item).getTime() - new Date(item.arrivalTime).getTime());
  const kpiProgress = kpiCompletion(item);
  const showKpiButton = isCodeStrokeKpiIncluded(item);
  return h("div", {
    class: "case-row",
    role: "button",
    tabindex: "0",
    onclick: () => go("timeline", item.id),
    onkeydown: (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        go("timeline", item.id);
      }
    }
  }, [
    h("span", { class: "row-number" }, String(displayNumber)),
    h("div", { class: "case-main" }, [
      h("strong", {}, item.patientName),
      h("span", {}, `${formatCaseDateTime(item.arrivalTime)} | Total time: ${elapsed}`)
    ]),
    h("div", { class: "case-clinical-summary" }, [
      h("span", { class: item.caseComment?.trim() ? "has-comment" : "" }, item.caseComment?.trim() || "No overall comments")
    ]),
    h("div", { class: "case-row-actions" }, [
      showKpiButton ? h("button", {
        type: "button",
        class: "kpi-btn",
        onclick: (event) => {
          event.stopPropagation();
          openKpi(item.id);
        }
      }, `KPI ${kpiProgress.completed}/${kpiProgress.total}`) : null,
      h("span", { class: `tag ${status.className}` }, status.label),
      item.caseStopped && item.caseStoppedReason ? h("small", { class: "case-status-detail" }, item.caseStoppedReason) : null
    ])
  ]);
}

function defaultKpiData() {
  return [...kpiTimestampFields, ...kpiYesNoFields, ...kpiNumberFields, ...kpiScoreFields].reduce((data, [key]) => {
    data[key] = "";
    return data;
  }, {});
}

function kpiFieldStatus(item, key) {
  if (key === "strokeRecognitionTime" && kpiValue(item, "strokePresentationType") !== "Inpatient stroke") return "na";
  return item.kpiFieldStatus?.[key] || "";
}

function ensureKpiData(item) {
  const existing = item.kpi || {};
  const derived = derivedKpiData(item);
  item.kpi = Object.keys(defaultKpiData()).reduce((data, key) => {
    data[key] = timelineSyncedKpiTimestampKeys.has(key) && derived[key]
      ? derived[key]
      : existing[key] !== "" && existing[key] != null ? existing[key] : derived[key] || "";
    return data;
  }, {});
  return item.kpi;
}

function kpiCompletion(item) {
  const keys = Object.keys(defaultKpiData());
  return {
    completed: keys.filter((key) => {
      const value = kpiValue(item, key);
      return (value !== "" && value != null) || ["na", "pending"].includes(kpiFieldStatus(item, key));
    }).length,
    total: keys.length
  };
}

function metricLine(item, def) {
  const minutes = metricMinutes(item, def);
  const status = metricStatus(minutes, def[4], def[5]);
  const width = minutes == null ? 0 : Math.min(100, Math.round((minutes / def[5]) * 100));
  const notApplicable = metricNotApplicable(item, def[0]);
  return h("div", { class: "metric-line" }, [
    h("div", {}, [
      h("strong", {}, def[1]),
      h("div", { class: `bar ${status.bar}` }, h("i", { style: `width:${width}%` }))
    ]),
    h("span", { class: `tag ${notApplicable ? "grey" : status.className}` }, notApplicable ? "Not applicable" : minutes == null ? "Pending" : `${minutes} min`)
  ]);
}

function recentTable(cases = state.cases) {
  if (!cases.length) return empty("No cases recorded for the selected period.");
  return h("div", { class: "table-wrap" }, dashboardCaseTable(cases, cases.length, 0));
}

function dashboardPrintPages(cases) {
  if (!cases.length) return h("div", { class: "dashboard-print-pages" });
  const pages = [];
  for (let index = 0; index < cases.length; index += DASHBOARD_PRINT_PAGE_SIZE) {
    pages.push(cases.slice(index, index + DASHBOARD_PRINT_PAGE_SIZE));
  }
  return h("div", { class: "dashboard-print-pages" }, pages.map((pageCases, pageIndex) =>
    h("div", { class: "dashboard-print-page" },
      dashboardCaseTable(pageCases, cases.length, pageIndex * DASHBOARD_PRINT_PAGE_SIZE, "dashboard-print-table")
    )
  ));
}

function dashboardCaseTable(cases, totalCount, offset, extraClass = "") {
  const rows = cases.map((item, index) => dashboardCaseRow(item, totalCount - offset - index));
  return h("table", { class: `dashboard-case-table ${extraClass}`.trim() }, [
    h("thead", {}, h("tr", {}, ["#", "Doc", "Date", "Name", "UHID", "Age/Sex", "AT", "D -> CT", "D -> MRI", "D -> IVT", "D -> GR", "D -> RE", "G -> RE"].map((text) => h("th", {}, text)))),
    h("tbody", {}, rows)
  ]);
}

function dashboardCaseRow(item, displayNumber) {
  const performance = performanceStatus(item);
  return h("tr", { class: `performance-row ${performance.className ? `performance-${performance.className}` : "performance-on-track"}` }, [
    h("td", {}, String(displayNumber)),
    h("td", {}, h("strong", {}, consultantCode(item.admittingConsultant))),
    h("td", {}, formatCompactDate(new Date(item.arrivalTime))),
    h("td", {}, h("strong", {}, item.patientName)),
    h("td", {}, item.uhid?.trim() || "--"),
    h("td", {}, `${item.age || "--"}/${shortGender(item.gender)}`),
    h("td", {}, formatClock(item.arrivalTime)),
    h("td", {}, dashboardImagingTime(item, "ct")),
    h("td", {}, dashboardImagingTime(item, "mri")),
    h("td", {}, isIvtSkipped(item) ? "N/A" : metricText(item, "doorIvt")),
    h("td", {}, metricText(item, "doorGroin")),
    h("td", {}, metricText(item, "doorRecan")),
    h("td", {}, metricText(item, "groinRecan"))
  ]);
}

function dashboardImagingTime(item, modality) {
  const profile = imagingProfile(item);
  const applicable = modality === "ct" ? profile.ct : profile.mri;
  if (!applicable) return "N/A";
  const reachedTime = stageTime(item, modality === "ct" ? "reachedCt" : "reachedMri");
  const minutes = minutesBetween(stageTime(item, "arrival"), reachedTime);
  return minutes == null ? "--" : `${minutes} min`;
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

function dashboardNotes(cases = state.cases) {
  const rows = cases
    .filter((item) => Object.values(item.stageNotes || {}).some(Boolean) || item.caseComment || item.caseStopped);
  if (!rows.length) return empty("No notes or stopped cases for the selected period.");
  return h("div", { class: "dashboard-notes" }, rows.map((item, index) => {
    const stageNotes = Object.entries(item.stageNotes || {}).filter(([, note]) => note);
    const performance = performanceStatus(item);
    const preview = item.caseStopped
      ? `${item.caseStoppedReason || "Stopped"}${item.caseStoppedComment ? ` - ${item.caseStoppedComment}` : ""}`
      : item.caseComment || stageNotes[0]?.[1] || "";
    return h("button", { class: `dashboard-note-row ${performance.className ? `performance-${performance.className}` : "performance-on-track"}`, onclick: () => go("summary", item.id) }, [
      h("span", { class: "row-number" }, String(rows.length - index)),
      h("span", {}, formatCaseDateTime(item.arrivalTime)),
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

function selectedImagingModalities(item) {
  if (Array.isArray(item.imagingModalities)) return item.imagingModalities;
  return [];
}

function imagingProfile(item) {
  const selected = selectedImagingModalities(item);
  if (selected.length) {
    return {
      ct: selected.includes("CT Brain") || selected.includes("CT Brain + CT Angiography"),
      cta: selected.includes("CT Brain + CT Angiography"),
      mri: selected.includes("MRI Brain Screening") || selected.includes("MRI Brain + MR Angiography"),
      mra: selected.includes("MRI Brain + MR Angiography")
    };
  }

  // Historical cases did not store an imaging-modality selection.
  const hasCtTiming = ctStages.some(([id]) => Boolean(item.stages?.[id]?.time));
  const hasMriTiming = mriStages.some(([id]) => Boolean(item.stages?.[id]?.time));
  return {
    ct: hasCtTiming || !hasMriTiming,
    cta: Boolean(stageTime(item, "ctaStarted") || stageTime(item, "ctaCompleted")),
    mri: hasMriTiming || item.mri?.needed === "Yes",
    mra: Boolean(stageTime(item, "mraStarted") || stageTime(item, "mraCompleted"))
  };
}

function toggleImagingModality(caseId, modality) {
  const item = state.cases.find((entry) => entry.id === caseId);
  if (!item || item.caseStopped) return;
  const selected = new Set(selectedImagingModalities(item));
  if (selected.has(modality)) selected.delete(modality);
  else {
    if (modality.startsWith("CT Brain")) {
      selected.delete("CT Brain");
      selected.delete("CT Brain + CT Angiography");
    }
    if (modality.startsWith("MRI Brain")) {
      selected.delete("MRI Brain Screening");
      selected.delete("MRI Brain + MR Angiography");
    }
    selected.add(modality);
  }
  item.imagingModalities = imagingModalityOptions.filter((option) => selected.has(option));
  applyImagingPathway(item);
  saveCases();
  render();
}

function applyImagingPathway(item) {
  const selected = selectedImagingModalities(item);
  if (!selected.length) {
    item.mri = { ...(item.mri || {}), needed: "" };
    setStagesAutomaticallyApplicable(item, [...ctStages, ...mriStages].map(([id]) => id), true);
    syncImagingKpiFields(item);
    return;
  }
  const profile = imagingProfile(item);
  item.mri = { ...(item.mri || {}), needed: profile.mri ? "Yes" : "No" };
  setStagesAutomaticallyApplicable(item, ctStages.map(([id]) => id), profile.ct);
  setStagesAutomaticallyApplicable(item, ["ctaStarted", "ctaCompleted"], profile.cta);
  setStagesAutomaticallyApplicable(item, mriStages.map(([id]) => id), profile.mri);
  setStagesAutomaticallyApplicable(item, ["mraStarted", "mraCompleted"], profile.mra);
  syncImagingKpiFields(item);
}

function setStagesAutomaticallyApplicable(item, stageIds, applicable) {
  stageIds.forEach((stageId) => {
    const current = item.stages?.[stageId];
    if (!applicable) {
      if (!current?.notApplicable) {
        item.stages[stageId] = {
          time: "",
          notApplicable: true,
          mode: "na",
          reason: "Not applicable for selected imaging pathway",
          previous: current?.time ? current : null
        };
      }
      return;
    }
    if (current?.notApplicable) {
      item.stages[stageId] = current.previous?.time
        ? { ...current.previous, notApplicable: false, previous: null }
        : { time: "", mode: "", reason: "", notApplicable: false, previous: null };
    }
  });
}

function updateNested(caseId, group, key, value) {
  const item = state.cases.find((entry) => entry.id === caseId);
  if (!item) return;
  item[group] = item[group] || {};
  item[group][key] = value;
  if (group === "ivt" && key === "eligible" && value === "No" && !stageTime(item, "ivtStarted")) {
    item.kpi = { ...defaultKpiData(), ...(item.kpi || {}), ivtGiven: "No" };
  }
  saveCases();
  render();
}

function updateKpiField(caseId, key, value) {
  const item = state.cases.find((entry) => entry.id === caseId);
  if (!item) return;
  item.kpi = { ...defaultKpiData(), ...(item.kpi || {}), [key]: value };
  item.kpiUpdatedAt = new Date().toISOString();
  saveCases();
  render();
}

function updateEvtDecision(caseId, key, value) {
  const item = state.cases.find((entry) => entry.id === caseId);
  if (!item) return;
  item.kpi = { ...defaultKpiData(), ...(item.kpi || {}), [key]: value };
  item.mt = { evtConsent: "", tici: "", notPerformedReason: "", ...(item.mt || {}) };
  if (key === "evtIndicated" && value === "Yes" && !item.kpi.evtPerformed) {
    item.kpi.evtPerformed = "Pending";
  }
  if (key === "evtIndicated" && value === "Yes") {
    if (item.kpi.largeVesselOcclusion === "Not applicable") item.kpi.largeVesselOcclusion = "";
    if (item.kpi.evtPerformed === "Not applicable") item.kpi.evtPerformed = "Pending";
  }
  if (key === "evtIndicated" && value === "No") {
    item.mt.notPerformedReason = "";
    item.kpi.largeVesselOcclusion = "Not applicable";
    item.kpi.evtPerformed = "Not applicable";
  }
  if (key === "evtPerformed" && value !== "No") {
    item.mt.notPerformedReason = "";
  }
  item.kpiUpdatedAt = new Date().toISOString();
  saveCases();
  render();
}

function mtWorkflowState(item) {
  return {
    indicated: kpiValue(item, "evtIndicated"),
    lvo: kpiValue(item, "largeVesselOcclusion"),
    performed: kpiValue(item, "evtPerformed")
  };
}

function signoffMissingItems(item) {
  const missing = [];
  if (!item.observerName?.trim()) missing.push({ label: "Data entered by", type: "observer" });
  if (!item.admittingConsultant && (!item.signedOffAt || item.signoffAttempted)) missing.push({ label: "Admitted under", type: "consultant" });
  if (!["Yes", "No"].includes(item.includeInCodeStrokeKpi || "")) missing.push({ label: "Include in Code Stroke KPI?", type: "kpiInclude" });
  if (!item.patientName || item.patientName === "Unnamed Patient") missing.push({ label: "Patient Name", type: "details" });
  if (!item.suspicion) missing.push({ label: "Stroke Suspicion", type: "details" });
  if (Array.isArray(item.imagingModalities) && !item.imagingModalities.length) {
    missing.push({ label: "Decided Imaging Modality", type: "stage", stageId: "dysphagiaScreening", section: "er" });
  }
  signoffStageRequirements.forEach(([id, label, section]) => {
    if (!item.stages[id]?.time) missing.push({ label, type: "stage", stageId: id, section });
  });
  const profile = imagingProfile(item);
  const imagingRequirements = [
    ...(profile.ct ? [
      ["reachedCt", "Reached CT", "ct"],
      ["ncctStarted", "First Brain Imaging / NCCT Started", "ct"],
      ["ncctCompleted", "NCCT Completed", "ct"],
      ...(profile.cta ? [["ctaStarted", "CT Angiography Started", "ct"], ["ctaCompleted", "CT Angiography Completed", "ct"]] : []),
      ["imagingReviewed", "CT Imaging Reviewed", "ct"]
    ] : []),
    ...(profile.mri ? [
      ["shiftToMri", "Shift to MRI", "mri"],
      ["reachedMri", "Reached MRI", "mri"],
      ["mriStarted", "MRI Started", "mri"],
      ["mriCompleted", "MRI Completed", "mri"],
      ...(profile.mra ? [["mraStarted", "MR Angiography Started", "mri"], ["mraCompleted", "MR Angiography Completed", "mri"]] : []),
      ["mriImagingReviewed", "MRI Imaging Reviewed", "mri"]
    ] : [])
  ];
  imagingRequirements.forEach(([id, label, section]) => {
    if (!item.stages[id]?.time) missing.push({ label, type: "stage", stageId: id, section });
  });
  const mtWorkflow = mtWorkflowState(item);
  if (mtWorkflow.indicated === "Yes") {
    if (!["Yes", "No"].includes(mtWorkflow.lvo)) {
      missing.push({ label: "Large Vessel Occlusion", type: "mt" });
    }
    if (!["Yes", "No"].includes(mtWorkflow.performed)) {
      missing.push({ label: "Final EVT Performed decision", type: "mt" });
    }
    if (!kpiValue(item, "evtArrivalType")) {
      missing.push({ label: "EVT Patient Arrival Type", type: "mt" });
    }
    if (mtWorkflow.performed === "No" && !item.mt?.notPerformedReason) {
      missing.push({ label: "Reason EVT not performed", type: "mt" });
    }
  }
  return missing;
}

function metricMinutes(item, def) {
  if (def?.[0] === "doorIvt" && isIvtSkipped(item)) return null;
  const start = metricStageTime(item, def[2]);
  const end = metricStageTime(item, def[3]);
  if (!start || !end) return null;
  return Math.max(0, Math.round((new Date(end) - new Date(start)) / 60000));
}

function metricStageTime(item, stageId) {
  if (stageId === "firstImagingStarted") return firstBrainImagingStartTime(item);
  if (stageId === "firstImagingReviewed") return firstRecordedTime(item, ["imagingReviewed", "mriImagingReviewed"]);
  return stageTime(item, stageId);
}

function metricText(item, id) {
  const def = metricDefs.find((entry) => entry[0] === id);
  const minutes = metricMinutes(item, def);
  return metricNotApplicable(item, id) ? "N/A" : minutes == null ? "--" : `${minutes} min`;
}

function metricNotApplicable(item, id) {
  if (!["doorCathlab", "doorGroin", "doorRecan", "ctGroin", "groinRecan"].includes(id)) return false;
  const workflow = mtWorkflowState(item);
  return workflow.indicated === "No" || workflow.performed === "No";
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
  return performanceStatus(item);
}

function performanceStatus(item) {
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
  const allStages = [...erStages, ...ctStages, ...mriStages, ...wardStages, ["ivtConsent", "IVT Consent Taken"], ["ivtStarted", "IVT Started / Bolus Given"], ["evtConsent", "EVT Consent Taken"], ["mtDecided", "Thrombectomy Decided"], ...mtStages];
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
  if (isIvtSkipped(item)) return "Skipped / Not applicable";
  if (item.stages.ivtStarted) return "Completed";
  if (item.ivt.eligible || item.stages.ivtConsent || item.ivt.consent) return "In Progress";
  return "Not Recorded";
}

function isIvtSkipped(item) {
  return item.ivt?.eligible === "No" && kpiValue(item, "ivtGiven") === "No";
}

function mtStatus(item) {
  const workflow = mtWorkflowState(item);
  if (workflow.indicated === "No") return "Not indicated";
  if (workflow.indicated === "Yes" && workflow.performed === "No") {
    return item.mt?.notPerformedReason ? `Not performed: ${item.mt.notPerformedReason}` : "Not performed";
  }
  if (item.stages.recanalisation) return "Completed";
  if (workflow.indicated === "Yes" && (workflow.performed === "Pending" || !workflow.performed)) return "Decision pending";
  if (item.stages.evtConsent || item.mt?.evtConsent || mtStages.some(([id]) => item.stages[id])) return "In progress";
  if (workflow.indicated === "Yes" && workflow.performed === "Yes") return "Planned / In progress";
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

function formatCaseDateTime(value) {
  const date = new Date(value);
  return `${formatReportDate(date)}, ${formatClock(date)}`;
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
  downloadBlob(blob, "rajagiri-strokecode-cases.json");
}

function exportKpiCsv(report, range) {
  const rows = [
    ["KPI", "Indicator", "Result", "Numerator", "Denominator", "Status", "Details"],
    ...report.map((item) => [
      item.no,
      item.title,
      item.value,
      item.numerator ?? "",
      item.denominator ?? "",
      item.provisional ? "Data Pending" : "Final",
      item.meta
    ])
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `nabh-kpi-${reportFileRange(range)}.csv`);
}

function exportKpiJson(report, cases, range) {
  const payload = {
    centre: accessSettings.centreName,
    generatedAt: new Date().toISOString(),
    period: { from: dateInputValue(range.start), to: dateInputValue(range.end) },
    caseCount: cases.length,
    indicators: report
  };
  downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), `nabh-kpi-${reportFileRange(range)}.json`);
}

function exportKpiPng(report, cases, range) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1680;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#b5121b";
  ctx.fillRect(0, 0, canvas.width, 16);
  ctx.fillStyle = "#162033";
  ctx.font = "700 42px Arial";
  ctx.fillText("NABH Stroke KPI Report", 70, 80);
  ctx.font = "24px Arial";
  ctx.fillStyle = "#6d7688";
  ctx.fillText(accessSettings.centreName, 70, 120);
  ctx.fillText(`${formatReportDate(range.start)} to ${formatReportDate(range.end)} | ${cases.length} cases`, 70, 158);
  report.forEach((item, index) => {
    const column = index < 12 ? 0 : 1;
    const row = index % 12;
    const x = 70 + column * 760;
    const y = 210 + row * 118;
    ctx.fillStyle = "#f6f7fb";
    ctx.fillRect(x, y, 700, 96);
    ctx.fillStyle = "#b5121b";
    ctx.font = "700 20px Arial";
    ctx.fillText(`KPI ${item.no}`, x + 18, y + 28);
    ctx.fillStyle = "#162033";
    ctx.font = "700 18px Arial";
    drawCanvasText(ctx, item.title, x + 104, y + 26, 390, 21);
    ctx.fillStyle = item.provisional ? "#f59e0b" : "#b5121b";
    ctx.font = "700 24px Arial";
    ctx.fillText(item.value, x + 530, y + 32);
    const value = kpiResultNumeric(item);
    const width = value == null ? 0 : Math.min(1, value / kpiChartMax(item.no, value)) * 660;
    ctx.fillStyle = "#e8ebf2";
    ctx.fillRect(x + 18, y + 66, 660, 10);
    ctx.fillStyle = item.provisional ? "#f59e0b" : "#21a66b";
    ctx.fillRect(x + 18, y + 66, width, 10);
    ctx.fillStyle = "#6d7688";
    ctx.font = "14px Arial";
    ctx.fillText(item.meta, x + 18, y + 91);
  });
  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, `nabh-kpi-${reportFileRange(range)}.png`);
  }, "image/png");
}

function exportAllKpiTrendsPng(report, range) {
  const canvas = document.createElement("canvas");
  canvas.width = 1800;
  canvas.height = 2500;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#b5121b";
  ctx.fillRect(0, 0, canvas.width, 16);
  ctx.fillStyle = "#162033";
  ctx.font = "700 42px Arial";
  ctx.fillText("NABH Stroke KPI Monthly Trends", 70, 80);
  ctx.font = "24px Arial";
  ctx.fillStyle = "#6d7688";
  ctx.fillText(accessSettings.centreName, 70, 120);
  ctx.fillText(`${formatReportDate(range.start)} to ${formatReportDate(range.end)}`, 70, 158);
  report.forEach((item, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 60 + column * 870;
    const y = 205 + row * 188;
    const width = 820;
    const height = 164;
    const points = monthlyKpiTrend(range.start, range.end, item.no);
    ctx.fillStyle = "#f6f7fb";
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = "#b5121b";
    ctx.font = "700 18px Arial";
    ctx.fillText(`KPI ${item.no}`, x + 18, y + 28);
    ctx.fillStyle = "#162033";
    ctx.font = "700 16px Arial";
    drawCanvasText(ctx, item.title, x + 92, y + 27, 520, 19);
    ctx.fillStyle = item.provisional ? "#f59e0b" : "#b5121b";
    ctx.font = "700 21px Arial";
    ctx.fillText(item.value, x + 670, y + 30);
    drawTrendCanvas(ctx, points, item.no, x + 18, y + 70, width - 36, 70);
  });
  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, `nabh-kpi-trends-${reportFileRange(range)}.png`);
  }, "image/png");
}

function drawTrendCanvas(ctx, points, kpiNo, x, y, width, height) {
  ctx.strokeStyle = "#dfe3eb";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.lineTo(x + width, y + height);
  ctx.stroke();
  if (!points.length) return;
  const step = points.length > 1 ? width / (points.length - 1) : 0;
  const availableValues = points.map((point) => point.value).filter((value) => value != null);
  const max = kpiChartMax(kpiNo, Math.max(0, ...availableValues));
  ctx.strokeStyle = "#21a66b";
  ctx.lineWidth = 4;
  ctx.beginPath();
  let drawing = false;
  points.forEach((point, index) => {
    if (point.value == null) {
      drawing = false;
      return;
    }
    const pointX = points.length === 1 ? x + width / 2 : x + index * step;
    const pointY = y + height - Math.min(1, point.value / max) * height;
    if (!drawing) {
      ctx.moveTo(pointX, pointY);
      drawing = true;
    } else {
      ctx.lineTo(pointX, pointY);
    }
  });
  ctx.stroke();
  points.forEach((point, index) => {
    if (point.value == null) return;
    const pointX = points.length === 1 ? x + width / 2 : x + index * step;
    const pointY = y + height - Math.min(1, point.value / max) * height;
    ctx.fillStyle = point.provisional ? "#f59e0b" : "#21a66b";
    ctx.beginPath();
    ctx.arc(pointX, pointY, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "#6d7688";
  ctx.font = "12px Arial";
  points.forEach((point, index) => {
    const pointX = points.length === 1 ? x + width / 2 : x + index * step;
    ctx.fillText(point.label, pointX - 18, y + height + 17);
  });
}

function drawCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let lineY = y;
  words.forEach((word) => {
    const test = `${line}${word} `;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, lineY);
      line = `${word} `;
      lineY += lineHeight;
    } else {
      line = test;
    }
  });
  ctx.fillText(line.trim(), x, lineY);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
}

function reportFileRange(range) {
  return `${dateInputValue(range.start)}-to-${dateInputValue(range.end)}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = h("a", { href: url, download: filename });
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
