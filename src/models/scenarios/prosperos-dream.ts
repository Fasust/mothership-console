import { POI_ID } from "../poi";
import type { Scenario } from "../scenario";

/**
 * A scenario for the Prospero's Dream station from "A Pound of Flesh".
 *
 * https://www.tuesdayknightgames.com/products/a-pound-of-flesh
 *
 * Source book credits:
 * - Written by Donn Stroud, Sean McCoy, and others
 * - Art and Layout by Sean McCoy
 * - Tuesday Knight Games
 */
export const prosperosDream = (): Scenario => {
  const scenario: Scenario = {
    id: "PROSPEROS DREAM",
    name: "PROSPERO'S DREAM",
    type: "prosperos",
    crew: { current: 8258000, capacity: 6000000 },
    adminCredentials: { username: "ADMIN", password: "ADMIN" },
    charts: ["oxygen", "power"],
    stats: {
      Diameter: "12.98km",
      Circumference: "40.77km",
      "Ships Currently Docked": "83",
      "Port Classification": "CLASS XXX",
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
        type: "surfaceTemp",
        label: "EXTERNAL HULL TEMP",
        unit: "°C",
        defaultValue: Array(30).fill(-120),
        min: -150,
        max: -90,
        isArray: true,
      },
    ],
    pointsOfInterest: [
      {
        id: POI_ID.DRY_DOCK,
        user_facing_id: "01",
        name: "Dry Dock",
        description:
          "Docking and repairs. Docking fee: 1kcr + 10kcr/week. O2 tax: 10cr/day/person.",
      },
      {
        id: POI_ID.STELLAR_BURN,
        user_facing_id: "02",
        name: "Stellar Burn",
        description: "Catering to ANY any and all physical delights.",
      },
      {
        id: POI_ID.CHOP_SHOP,
        user_facing_id: "03",
        name: "Chop Shop",
        description:
          "Cybermod installation and repair by Zhenya and The Babushka.",
      },
      {
        id: POI_ID.ICE_BOX,
        user_facing_id: "04",
        name: "The Ice Box",
        description: "Slickware installation and resleeving facility.",
      },
      {
        id: POI_ID.FARM,
        user_facing_id: "05",
        name: "The Farm",
        description: "Food supply. Operated by the Solarian Church.",
      },
      {
        id: POI_ID.CANYON_HEAVY_MARKET,
        user_facing_id: "06",
        name: "CANYONHEAVY.market",
        description: "Information broker.",
      },
      {
        id: POI_ID.COURT,
        user_facing_id: "07",
        name: "The Court",
        description: "Disputes resolved and justice served.",
      },
      {
        id: POI_ID.TEMPEST_HQ,
        user_facing_id: "08",
        name: "Tempest Co. HQ",
        description: "Mercenary company. Security onboard The Dream.",
      },
      {
        id: POI_ID.DOPTOWN,
        user_facing_id: "09",
        name: "Doptown",
        description:
          "De-oxygenated people's town. Heavily guarded debtors' prison for those who can't pay the O2 tax.",
      },
      {
        id: POI_ID.CHOKE,
        user_facing_id: "10",
        name: "The Choke",
        description: "Abandoned, quarantined wasteland.",
      },
    ],
    theme: "pink",
  };
  return scenario;
};
