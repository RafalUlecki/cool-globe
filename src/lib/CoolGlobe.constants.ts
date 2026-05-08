import type { ColorScaleInput } from "./dashboardGlobe.types";

export const GLOBAL_COUNTRIES_GEOJSON_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

export const WORLD_TOPOJSON_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export const GLOBAL_ADMIN1_GEOJSON_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson";

export const WHITE_GLOBE_TEXTURE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='4' height='4'><rect width='4' height='4' fill='%23f5f5f5'/></svg>";

export const DEFAULT_COLOR_SCALE: ColorScaleInput = {
  minColor: "#f8fafc",
  maxColor: "#e5e7eb",
};
