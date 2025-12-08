import { Scenario } from "../scenario";

export const rsvFidanza = (): Scenario => {
  const scenario: Scenario = {
    id: "RSV FIDANZA",
    name: "RSV FIDANZA",
    type: "ship",
    crew: { current: 0, capacity: 16 }, // All crew status unknown/transformed
    adminCredentials: { username: "TANNHAUS", password: "VERGE2187" },
    charts: ["oxygen", "radiation", "power"],
    stats: {
      "Ship Class": "Tannhäuser Verge-K J2C-I",
      "Jump Capability": "Class I Jump-2",
      "Crew Status": "UNKNOWN",
      "Fuel Reserves": "08/12 Units",
    },
    exteriorStats: [
      {
        type: "rotationSpeed",
        label: "ROTATION RATE",
        unit: "rpm",
        defaultValue: Array(30).fill(0.8),
        min: 0.79,
        max: 0.81,
        isArray: true,
      },
      {
        type: "radiationLevel",
        label: "RADIATION LEVELS",
        unit: "Rads",
        defaultValue: 847,
        isAlert: true,
        alertThreshold: 100,
        min: 0,
        max: 2000,
      },
      {
        type: "surfaceTemp",
        label: "HULL TEMPERATURE",
        unit: "°C",
        defaultValue: Array(30).fill(-89),
        min: -150,
        max: 200,
        isArray: true,
      },
      {
        type: "researchProgress",
        label: "JUMP DRIVE STABILITY",
        unit: "%",
        defaultValue: 12,
        isAlert: true,
        alertThreshold: 50,
      },
      {
        type: "atmosphericAnalysis",
        label: "ATMOSPHERIC COMPOSITION",
      },
    ],
    asciiMap: `
            ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░               . . . . . . . . . . . . . . . . . . . . . . . 
           ░░░░░░░┌────┐░┌────┐░┌────┐░┌────┐░░              .                                           .
      ░░░░░░░░░░▼░│ LQ │░│ LQ │░│ LQ │░│ LQ │░░              .               ░░░░░░░░░░░░░░░░░░░░░░░░░░░░.░░░░░░░░░░░░░  
      ┌──────┐░░║░└──□─┘░└──□─┘░└─□──┘░└─□──┘░░              .          ░░░░░░░░┌───┐░░░░░░░░░░░░┌───────┬────────┐▒▒▒▒▒▒
      │ BRDG ◙══╩════╩══════╩═════╩══════╝░░░░░              .         ░░░░░░░░░│ISO│░░░░░░░░░░░░│ ENG1  □  THR1  │▒▒▒▒▒▒
      └──────┘░░.░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░              .        ░░░░░░░░░░└─◙─┘░░░░CELLS░░░└───□───┴──□─────┘▒▒▒▒▒▒
      ░░░░░░░░░░.░░░░░░░░░░░░░░░░░░░░░░░░░░░░░               .        ░░░░░░░░░░░░║░░░░░░┌─┐┌─┐┌─┐░░░║░░░.░░║░░░░░░░░░░  
                .                                            .        ░░░░░░┌─────◙────┐░│4││5││6│░░░║░░░.░┌──────┐░░░░░ 
                .                                            .        ░░░░░░│          │░└□┘└□┘└□┘░░░║░░░.░│      │▓▓▓▓▓ 
  ░░░░░░░░░░░░░░.░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          .        ░░░░░░│  SCILAB  ◙══╬══╬══╬═◙══╬═══▲░│ JUMP │▓▓▓▓▓ 
  ┌───────────┐░.░┌──┐┌──┐░░░░░░░░░░░░░░░░░░░░░░░░░░░        .        ░░░░░░│          │░┌□┐┌□┐┌□┐░░░║░░░░░│      │▓▓▓▓▓ 
B ◙           │░▲░│SC││WC│░░╔═════════╦════╗░░░░░░░░░        .         ░░░░░└──────────┘░│3││2││1│░░░║░░░░░└──────┘░░░░░ 
A ◙           │░║░└─□┘└─□┘░░║░┌─────┬─□──┐░◙░░░░░░░░░        .          ░░░░░░░░░░░░░░░░░└─┘└─┘└─┘░░░║░░░░░░║░░░░░░░░░░  
Y ◙           │░╚═◙═╬═══╩═══╬═□ GAL □ LS │░╚═▼░░░░░░░        .               ░░░░░░░░░░░░░░░░░░░░┌───□───┬──□─────┐▒▒▒▒▒▒
D ◙   CARGO   │░░┌──□─────┐░║░├─□───┴┬□──┴──┐.░░░░░░░        .                       ░░░░░░░░░░░░│ ENG2  □  THR2  │▒▒▒▒▒▒
O ◙           │░░│ MEDBAY │░◙░│ BRKS □ CRYO │.░░░░░░░        .                        ░░░░░░░░░░░└───────┴────────┘▒▒▒▒▒▒
O ◙           │░░└─────□──┘░║░└──────┴──────┘.░░░░░░░        .                         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  
R ◙           ◙═══╦════╩════╝░░░░░░░░░░░░░░░░.░░░░░░░        .
  └───────────┘░░░║░░░░░░░░░░░░░░░░░░░░░░░░░░.░░░░░          .
  ░░░░░░░░░░░░░░░░◙░░░░░░░░░░░               .               .
               AIRLOCK                       .               .
                                             . . . . . . . . .              
`,
    systemLogs: [
      {
        time: "21-06-2525 09:20",
        message: "AIR PRESSURE ANOMALY DETECTED: TEST CHAMBER - 5%",
      },
      {
        time: "21-06-2525 09:21",
        message: "AIR PRESSURE ANOMALY DETECTED: TEST CHAMBER - 98%",
      },
      {
        time: "21-06-2525 09:22",
        message: "AIR PRESSURE ANOMALY DETECTED: TEST CHAMBER - 2%",
      },
      {
        time: "21-06-2525 09:23",
        message: "AIR PRESSURE ANOMALY DETECTION - DISABLED",
      },
      {
        time: "01-07-2525 13:20",
        message: "POWER SURGE IN JUMP DRIVE",
      },
      {
        time: "04-07-2525 14:21",
        message: "LIFE SUPPORT SYSTEM SHUT OFF IN {{REDACTED}}",
      },
    ],
    theme: "amber",
  };

  return scenario;
};
