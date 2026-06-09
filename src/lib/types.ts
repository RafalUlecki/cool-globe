import type { ColorScaleInput, StatisticsData } from "./dashboardGlobe.types";

export interface CoolGlobeProps {
  statisticsData: StatisticsData;
  resetSignal?: string | number;
  autoRotate?: boolean;
  preselectedCountry?: string;
  primaryMetric?: string;
  colorScale?: ColorScaleInput;
  countryNumericToIsoMap?: Record<string, string>;
  countryNameToIsoMap?: Record<string, string>;
}
