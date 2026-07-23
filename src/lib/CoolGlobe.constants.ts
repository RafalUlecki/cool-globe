import type { ColorScaleInput } from "./dashboardGlobe.types";

/** Pinned Natural Earth v5.0.1 (not floating `master`). */
export const GLOBAL_COUNTRIES_GEOJSON_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.0.1/geojson/ne_110m_admin_0_countries.geojson";

/** Pinned world-atlas@2.0.2 TopoJSON fallback. */
export const WORLD_TOPOJSON_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";

/** Pinned Natural Earth v5.0.1 Admin-1 (large; prefer `fetchRegionsForCountry` when possible). */
export const GLOBAL_ADMIN1_GEOJSON_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.0.1/geojson/ne_10m_admin_1_states_provinces.geojson";

export const WHITE_GLOBE_TEXTURE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='4' height='4'><rect width='4' height='4' fill='%23f5f5f5'/></svg>";

export const DEFAULT_COLOR_SCALE: ColorScaleInput = {
  minColor: "#f8fafc",
  maxColor: "#e5e7eb",
};
