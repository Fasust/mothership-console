/**
 * Points of interest that can be selected in the exterior view.
 */
export enum POI_ID {
  /** Properso's Dream */
  DRY_DOCK = 1,
  STELLAR_BURN = 2,
  CHOP_SHOP = 3,
  ICE_BOX = 4,
  FARM = 5,
  CANYON_HEAVY_MARKET = 6,
  COURT = 7,
  TEMPEST_HQ = 8,
  DOPTOWN = 9,
  CHOKE = 10,

  /** The Deep */
  DEEP_RECEPTION_LANDING = 11,
  DEEP_EXEC_LOUNGE = 12,
  DEEP_PSEUDOFLESH_FARMS = 13,
  DEEP_AI_CORE = 14,
  DEEP_SKELETON_WORKS = 15,
  DEEP_STORAGE = 16,
  DEEP_DIS_ASSEMBLY = 17,
  DEEP_QA = 18,
  DEEP_MAINTAINANCE = 19,
  DEEP_BRAIN_CONSTRUCTION = 20,
  DEEP_HUMAN_EMULATION_LAB = 21,
  DEEP_ENGINEERING_AND_SUPPORT = 22,
}

/**
 * Information displyed when a POI is selected in the exterior view.
 */
export type PointOfInterest = {
  id: POI_ID;
  name: string;
  description: string;
  user_facing_id: string;
};
