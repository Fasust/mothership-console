import { Scenario, StationMap } from "../scenario";

export const gretaBase = (): Scenario => {
  const map = new StationMap({
    layout: {
      gridSize: {
        columns: 5,
        rows: 5,
      },
      airlockSizeModifier: {
        width: 0.6,
        height: 0.9,
      },
      outerPadding: {
        top: 90,
      },
      roomPadding: {
        horizontal: 10,
        vertical: 40,
      },
    },
    levels: [
      { rooms: [null, null, null, "COMMAND_CENTER", "MEDBAY"] },
      {
        rooms: [
          "GARAGE_UTILITIES",
          "AIRLOCK_2",
          "HALLWAY_B",
          "HALLWAY_C",
          "FREEZER",
        ],
      },
      { rooms: [null, "ARMORY", "HALLWAY_A", "COMMISSARY", "PANTRY"] },
      { rooms: [null, null, "CREW_HABITAT", "AIRLOCK_1", null] },
      { rooms: [null, null, null, "LANDING_ZONE", null] },
    ],
    connections: [
      { from: "LANDING_ZONE", to: "AIRLOCK_1" },
      { from: "AIRLOCK_1", to: "COMMISSARY" },
      { from: "COMMISSARY", to: "PANTRY" },
      { from: "PANTRY", to: "FREEZER" },
      { from: "COMMISSARY", to: "HALLWAY_A" },
      { from: "COMMISSARY", to: "HALLWAY_C" },
      { from: "HALLWAY_A", to: "CREW_HABITAT" },
      { from: "HALLWAY_A", to: "ARMORY" },
      { from: "HALLWAY_A", to: "HALLWAY_B" },
      { from: "HALLWAY_B", to: "AIRLOCK_2" },
      { from: "AIRLOCK_2", to: "GARAGE_UTILITIES" },
      { from: "HALLWAY_C", to: "COMMAND_CENTER" },
      { from: "HALLWAY_C", to: "HALLWAY_B" },
      { from: "HALLWAY_C", to: "MEDBAY" },
    ],
    diagnostics: {
      title: "Base Systems Diagnostic",
      messages: [
        { type: "notice", message: "=========================" },
        { type: "warning", message: "EMERGENCY POWER ONLY" },
        { type: "warning", message: "Communications offline" },
        { type: "warning", message: "Terraformer offline" },
        { type: "notice", message: "=========================" },
        {
          type: "check",
          message: "Checking base integrity",
          status: "Warning",
          delay: 2000,
        },
        { type: "warning", message: "Multiple structural breaches detected" },
        { type: "warning", message: "Bullet damage in Commissary" },
        { type: "warning", message: "Airlock security compromised" },
        { type: "notice", message: "=========================" },
        {
          type: "check",
          message: "Checking life signs",
          status: "Critical",
          delay: 1500,
        },
        { type: "warning", message: "No active crew signatures detected" },
        { type: "warning", message: "Biohazard containment breach in Lab" },
        { type: "notice", message: "=========================" },
        {
          type: "summary",
          message: "CRITICAL SYSTEM FAILURE - EMERGENCY PROTOCOLS ACTIVE",
        },
      ],
    },
  });

  const scenario: Scenario = {
    id: "GRETA BASE",
    name: "GRETA BASE - TERRAFORMING COLONY",
    type: "planet",
    crew: { current: 0, capacity: 30 }, // All crew members are either dead or infected
    adminCredentials: { username: "ADMIN", password: "ADMIN" },
    charts: ["humidity", "temperature"],
    stats: {
      atmosphere: "Heavy rain, poor visibility",
      gravity: "0.87 G",
      temperature: "-5°C to 15°C",
      pressure: "1.2 bar",
      owner: "GRETA INC.",
    },
    exteriorStats: [
      {
        type: "atmosphericAnalysis",
        label: "ATMOSPHERIC ANALYSIS",
      },
      {
        type: "windSpeed",
        label: "WIND SPEED",
        unit: "km/h",
        defaultValue: Array(30).fill(12),
        min: 4,
        max: 20,
        isArray: true,
      },
      {
        type: "humidity",
        label: "HUMIDITY",
        unit: "%",
        defaultValue: Array(30).fill(45),
        min: 30,
        max: 60,
        isArray: true,
      },
      {
        type: "researchProgress",
        label: "RESEARCH PROGRESS",
        unit: "%",
        defaultValue: 68,
      },
      {
        type: "anomalyReadings",
        label: "ANOMALY READINGS",
        unit: "detected",
        defaultValue: 3,
        isAlert: true,
        alertThreshold: 5,
      },
    ],
    map: map,
    controlButtons: [
      {
        label: "COMMUNICATIONS",
        defaultState: false,
        restricted: false,
        type: "toggle",
        linkedRoom: "COMMAND_CENTER",
      },
      {
        label: "TERRAFORMER",
        defaultState: false,
        restricted: true,
        type: "toggle",
      },
      {
        label: "BACKUP GENERATOR",
        defaultState: false,
        restricted: false,
        type: "toggle",
        linkedRoom: "GARAGE_UTILITIES",
      },
    ],
    theme: "green",
  };

  return scenario;
};
