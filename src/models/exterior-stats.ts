/**
 * Defines the stats that can be displayed in the exterior view.
 */
export type ExteriorStatConfig = {
  type: ExteriorStatType;
  label: string;
  unit?: string;
  defaultValue?: number | number[];
  min?: number;
  max?: number;
  isArray?: boolean;
  isAlert?: boolean; // Whether to show this stat in alert color when exceeding threshold
  alertThreshold?: number; // Value at which the stat should show as alert
};

export type ChartType =
  | "oxygen"
  | "temperature"
  | "radiation"
  | "power"
  | "humidity"
  | "pressure";

export type ExteriorStatType =
  | "composition"
  | "rotationSpeed"
  | "surfaceTemp"
  | "radiationLevel"
  | "resourcesExtracted"
  | "remainingDeposits"
  | "atmosphericAnalysis"
  | "windSpeed"
  | "humidity"
  | "researchProgress"
  | "anomalyReadings";
