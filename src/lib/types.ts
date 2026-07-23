import type { Feature } from "geojson";
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
  /** Called when a geo asset fetch fails (countries or Admin-1). */
  onError?: (error: Error) => void;
  /**
   * Optional per-country region loader. When set, CoolGlobe skips the worldwide
   * Admin-1 download and calls this for each selected country instead.
   */
  fetchRegionsForCountry?: (countryCode: string) => Promise<Feature[]>;
  /** Override the default worldwide Admin-1 GeoJSON URL (ignored if fetchRegionsForCountry is set). */
  admin1GeoJsonUrl?: string;
  /** Notifies when region polygons are loading for the selected country. */
  onRegionsLoadingChange?: (loading: boolean) => void;
  primaryMetric?: string;
  colorScale?: ColorScaleInput;
  countryNumericToIsoMap?: Record<string, string>;
  countryNameToIsoMap?: Record<string, string>;
}
