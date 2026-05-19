import type { ColorScaleInput, StatisticsData } from "./dashboardGlobe.types";

export interface CoolGlobeProps {
  statisticsData: StatisticsData;
  resetSignal?: string | number;
  /** ISO 3166-1 alpha-2 code — auto-selects and zooms to this country once geo data loads. */
  preselectedCountry?: string;
  primaryMetric?: string;
  colorScale?: ColorScaleInput;
  countryNumericToIsoMap?: Record<string, string>;
  countryNameToIsoMap?: Record<string, string>;
}
