import type { ColorScaleInput, StatisticsData } from "./dashboardGlobe.types";

export interface CoolGlobeProps {
  statisticsData: StatisticsData;
  resetSignal?: string | number;
  primaryMetric?: string;
  colorScale?: ColorScaleInput;
  countryNumericToIsoMap?: Record<string, string>;
  countryNameToIsoMap?: Record<string, string>;
}
