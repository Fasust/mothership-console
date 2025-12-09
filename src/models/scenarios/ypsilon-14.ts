import { Scenario } from "../scenario";
import { StationGraphMap } from "../station-graph-map";

/**
 * A scenario for the Ypsilon 14 station from "The Haunting of Ypsilon 14".
 *
 * https://www.tuesdayknightgames.com/collections/mothership-starter-modules/products/the-haunting-of-ypsilon-14
 *
 * Source book credits:
 * - Written by D G Chapman (GoGoGolf!, Bastard Magic, The Graverobbe's Guide)
 * - Layout by Sean McCoy (Mothership, Dead Planet, A Pound of Flesh)
 * - Tuesday Knight Games
 */
export const ypsilon14 = (): Scenario => {
  const baseMap = new StationGraphMap({
    levels: [
      {
        rooms: ["DOCKING_BAY_1", null, "DOCKING_BAY_2"],
      },
      {
        rooms: [
          {
            id: "AIRLOCK_1",
            type: "airlock",
            pressureLossRisk: false,
          },
          null,
          {
            id: "AIRLOCK_2",
            type: "airlock",
            pressureLossRisk: false,
          },
        ],
      },
      { rooms: [null, "WORKSPACE", null] },
      { rooms: ["MINE_ELEVATOR", null, "MESS"] },
      { rooms: ["MINE_ENTRANCE", "QUARTERS", null] },
      { rooms: ["MINE_AIRLOCK", null, "WASHROOMS"] },
      { rooms: [null, "MINE_TUNNELS", null] },
    ],
    connections: [
      { from: "DOCKING_BAY_1", to: "AIRLOCK_1", password: "0389" },
      { from: "DOCKING_BAY_2", to: "AIRLOCK_2", defaultOpen: true },
      { from: "AIRLOCK_1", to: "WORKSPACE" },
      { from: "AIRLOCK_2", to: "WORKSPACE", defaultOpen: true },
      { from: "WORKSPACE", to: "QUARTERS" },
      { from: "WORKSPACE", to: "MINE_ELEVATOR" },
      { from: "QUARTERS", to: "MESS" },
      { from: "QUARTERS", to: "WASHROOMS" },
      { from: "MESS", to: "WASHROOMS" },
      { from: "MINE_ELEVATOR", to: "MINE_ENTRANCE" },
      { from: "MINE_ENTRANCE", to: "MINE_AIRLOCK" },
      { from: "MINE_AIRLOCK", to: "MINE_TUNNELS" },
    ],
    diagnostics: {
      title: "Diagnostics",
      messages: [
        { type: "notice", message: "=========================" },
        {
          type: "check",
          message: "Checking life support",
          status: "Done",
          delay: 3000,
        },
        {
          type: "notice",
          message: "Air filters replaced 455 day(s) ago.",
        },
        {
          type: "notice",
          message: "Life support systems operational.",
        },
        { type: "notice", message: "\n=========================" },
        {
          type: "check",
          message: "Checking mining systems",
          status: "Done",
          delay: 2000,
        },
        {
          type: "notice",
          message: "Mineshaft lift maintained 455 day(s) ago.",
        },
        {
          type: "notice",
          message: "Mining systems operational.",
        },
        { type: "notice", message: "\n=========================" },
        {
          type: "check",
          message: "Checking habitat integrity",
          status: "Done",
          delay: 1000,
        },
        {
          type: "warning",
          message: "Airflow O2.4%. Check crew quarters vents for blockage.",
        },
        {
          type: "warning",
          message: "Shower #5 non-functional for 1 day(s).",
        },
        { type: "notice", message: "\n=========================" },
        {
          type: "check",
          message: "Checking docking bay(s)",
          status: "Done",
          delay: 1500,
        },
        {
          type: "warning",
          message: "Airlock 1 manually overridden to LOCKED",
        },
        {
          type: "notice",
          message: "Airlock 2 operational",
        },
        { type: "notice", message: "\n=========================" },
        {
          type: "summary",
          message: "All systems operating within acceptable parameters.",
        },
      ],
    },
  });

  const scenario: Scenario = {
    id: "YPSILON 14",
    name: "YPSILON 14",
    type: "asteroid",
    crew: { current: 9, capacity: 10 },
    adminCredentials: { username: "SONYA", password: "PRINCES" },
    charts: ["oxygen", "temperature"],
    stats: {
      mass: "4.8 × 10^12 kg",
      diameter: "3.2 km",
      pressure: "1.2 bar",
    },
    exteriorStats: [
      {
        type: "composition",
        label: "COMPOSITION ANALYSIS",
      },
      {
        type: "rotationSpeed",
        label: "ROTATION SPEED",
        unit: "RPM",
        defaultValue: Array(30).fill(1.2),
        min: 1.0,
        max: 1.4,
        isArray: true,
      },
      {
        type: "surfaceTemp",
        label: "SURFACE TEMPERATURE",
        unit: "°C",
        defaultValue: Array(30).fill(-145),
        min: -155,
        max: -135,
        isArray: true,
      },
      {
        type: "radiationLevel",
        label: "RADIATION LEVEL",
        unit: "mSv",
        defaultValue: 142,
        isAlert: true,
        alertThreshold: 200,
      },
      {
        type: "resourcesExtracted",
        label: "RESOURCES EXTRACTED",
        unit: "tons",
        defaultValue: 3842,
      },
      {
        type: "remainingDeposits",
        label: "REMAINING DEPOSITS",
        unit: "tons",
        defaultValue: 18475,
      },
    ],
    map: baseMap,
    systemLogs: [
      { time: "13.07.2184 13:20", message: "HERACLES ENTERED DOCKING BAY 1" },
      {
        time: "04.08.2184 15:20",
        message: "{{PLAYER_SHIP}} ENTERED DOCKING BAY 2",
      },
    ],
    controlButtons: [
      {
        label: "SHOWERS",
        defaultState: false,
        restricted: false,
        type: "toggle",
        linkedRoom: "WASHROOMS",
      },
      {
        label: "SELF DESTRUCT",
        defaultState: false,
        restricted: true,
        type: "action",
        function: "self-destruct",
      },
      {
        label: "BAY 1",
        defaultState: false,
        restricted: true,
        type: "toggle",
        toggleStates: {
          true: "UNLATCHED",
          false: "LATCHED",
        },
        linkedRoom: "DOCKING_BAY_1",
      },
      {
        label: "BAY 2",
        defaultState: false,
        restricted: true,
        type: "toggle",
        toggleStates: {
          true: "UNLATCHED",
          false: "LATCHED",
        },
        linkedRoom: "DOCKING_BAY_2",
      },
    ],
    theme: "amber",
  };

  return scenario;
};

/**
 * A scenario for the Ypsilon 14 station from "The Haunting of Ypsilon 14" including the underground mine.
 *
 * https://www.tuesdayknightgames.com/collections/mothership-starter-modules/products/the-haunting-of-ypsilon-14
 *
 * Source book credits:
 * - Written by D G Chapman (GoGoGolf!, Bastard Magic, The Graverobbe's Guide)
 * - Layout by Sean McCoy (Mothership, Dead Planet, A Pound of Flesh)
 * - Tuesday Knight Games
 */
export const ypsilon14WithTunnels = (): Scenario => {
  const baseScenario = ypsilon14();
  const baseMap = baseScenario.map;

  const newMap =
    baseMap !== undefined
      ? new StationGraphMap({
          ...baseMap,
          levels: [
            ...baseMap.levels,
            { rooms: ["MINE_DEPTHS", null, "MINE_ANTECHAMBER"] },
          ],
          connections: [
            ...baseMap.connections,
            { from: "MINE_TUNNELS", to: "MINE_DEPTHS" },
            { from: "MINE_TUNNELS", to: "MINE_ANTECHAMBER" },
          ],
        })
      : undefined;

  return {
    ...baseScenario,
    name: "YPSILON 14",
    id: "YPSILON 14 - UNDERGROUND",
    map: newMap,
  };
};
