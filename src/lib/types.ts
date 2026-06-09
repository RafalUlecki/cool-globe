import type {
  ColorScaleInput,
  GlobeLevel,
  StatisticsData,
} from "./dashboardGlobe.types";

export interface GlobeSelection {
  level: GlobeLevel;
  countryCode?: string;
  regionName?: string;
}

export interface CoolGlobeProps {
  statisticsData: StatisticsData;
  resetSignal?: string | number;
  autoRotate?: boolean;
  preselectedCountry?: string;
  selectedCountry?: string | null;
  selectedRegion?: string | null;
  onSelectionChange?: (selection: GlobeSelection) => void;
  primaryMetric?: string;
  colorScale?: ColorScaleInput;
  countryNumericToIsoMap?: Record<string, string>;
  countryNameToIsoMap?: Record<string, string>;
}
