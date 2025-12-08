import { Theme } from "../context/theme-context";
import { ChartType, ExteriorStatConfig } from "./exterior-stats";
import type { PointOfInterest } from "./poi";
import { bellStation, deepStation } from "./scenarios/deep";
import { gretaBase } from "./scenarios/greta-base";
import { prosperosDream } from "./scenarios/prosperos-dream";
import { warped } from "./scenarios/warped";
import { ypsilon14, ypsilon14WithTunnels } from "./scenarios/ypsilon-14";
import { RoomId, StationGraphMap } from "./station-graph-map";

/**
 * Scenario data
 *
 * Defines how a given scenario will be displayed and what view it offers.
 * A scenario in this context is a game location such as a planet, asteroid, or ship.
 */
export type Scenario = {
  id: string;
  name: string;
  /** Controls the style of the exterior view */
  type: "asteroid" | "planet" | "bell" | "deep" | "prosperos" | "ship";
  /** Dispayed in the header */
  crew: {
    current: number;
    capacity: number;
  };
  /** Used for restricted ControlButtons */
  adminCredentials: {
    username: string;
    password: string;
  };
  /** Charts to display in the interior view */
  charts: ChartType[];
  /** Stats to display in the interior view */
  stats?: Record<string, string>;
  /** Stats to display in the exterior view */
  exteriorStats?: ExteriorStatConfig[];
  /** Points of interest that can be selected in the exterior view */
  pointsOfInterest?: PointOfInterest[];
  /**
   * Graph of the station's layout for the interior view
   *
   * Mutally exclusive with asciiMap
   **/
  map?: StationGraphMap;
  /**
   * ASCII map of the station for the interior view
   *
   * Mutally exclusive with map
   **/
  asciiMap?: string;
  /** System logs to display in the interior view */
  systemLogs?: SystemLog[];
  /** Controls to display in the interior view */
  controlButtons?: ControlButton[];
  /** Theme to use for all views */
  theme?: Theme;
};

export const allScenarios = [
  ypsilon14(),
  ypsilon14WithTunnels(),
  gretaBase(),
  bellStation(),
  deepStation(),
  prosperosDream(),
  warped(),
];

export type SystemLog = {
  time: string;
  message: string;
};

export type ControlButtonType = "toggle" | "action";
export type ControlButtonFunction = "emergency" | "self-destruct";

/**
 * A control button that can be displayed in the interior view.
 */
export type ControlButton = {
  /** The label shown on the button */
  label: string;
  defaultState: boolean;
  /** Adds lables shown on the button when it is in a specific state */
  toggleStates?: {
    true: string;
    false: string;
  };
  /** Whether this button is restricted to admin users */
  restricted: boolean;
  /** The type of button */
  type: ControlButtonType;
  /** The function of the button */
  function?: ControlButtonFunction;
  /** The room that this button is linked to */
  linkedRoom?: RoomId;
};

export { POI_ID } from "./poi";
export type { PointOfInterest } from "./poi";
