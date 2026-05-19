import { interpolateRgb } from "d3-interpolate";
import { scaleLinear } from "d3-scale";
import type { Feature } from "geojson";

import type {
  ColorScaleInput,
  GlobeLevel,
  MetricRecord,
} from "./dashboardGlobe.types";
import type { Bounds, PolygonFeatureProperties } from "./CoolGlobe.types";

export const normalizeCountryIso = (code: string): string =>
  code.trim().toUpperCase();

export const findCountryFeatureByIso = (
  features: Feature[],
  isoA2: string,
  countryNameToIsoMap: Record<string, string> = {},
): Feature | undefined => {
  const normalized = normalizeCountryIso(isoA2);
  return features.find((feature) => {
    const properties = (feature.properties ?? {}) as PolygonFeatureProperties;
    const featureIso =
      properties.__isoA2 ??
      (typeof properties.iso_a2 === "string"
        ? properties.iso_a2.toUpperCase()
        : undefined);
    if (featureIso === normalized) return true;
    const nameKey = String(properties.name ?? "").toLowerCase();
    return countryNameToIsoMap[nameKey] === normalized;
  });
};

export const extractFeatureCoordinates = (geometry: unknown): number[][] => {
  if (
    typeof geometry !== "object" ||
    geometry === null ||
    !("coordinates" in geometry)
  )
    return [];
  const coordinates = (geometry as { coordinates: unknown }).coordinates;
  const flat: number[][] = [];
  const walk = (value: unknown) => {
    if (!Array.isArray(value)) return;
    if (
      value.length >= 2 &&
      typeof value[0] === "number" &&
      typeof value[1] === "number"
    ) {
      flat.push([value[0], value[1]]);
      return;
    }
    value.forEach(walk);
  };
  walk(coordinates);
  return flat;
};

export const getFeatureBounds = (featureItem: Feature): Bounds | undefined => {
  const points = extractFeatureCoordinates(featureItem.geometry);
  if (!points.length) return undefined;
  const bounds = points.reduce<Bounds>(
    (acc, [lng, lat]) => ({
      minLat: Math.min(acc.minLat, lat),
      maxLat: Math.max(acc.maxLat, lat),
      minLng: Math.min(acc.minLng, lng),
      maxLng: Math.max(acc.maxLng, lng),
    }),
    {
      minLat: Number.POSITIVE_INFINITY,
      maxLat: Number.NEGATIVE_INFINITY,
      minLng: Number.POSITIVE_INFINITY,
      maxLng: Number.NEGATIVE_INFINITY,
    },
  );
  if (!Number.isFinite(bounds.minLat) || !Number.isFinite(bounds.minLng))
    return undefined;
  return bounds;
};

export const getAltitudeFromBounds = (bounds: Bounds): number => {
  const latSpan = Math.max(0.1, bounds.maxLat - bounds.minLat);
  const lngSpan = Math.max(0.1, bounds.maxLng - bounds.minLng);
  const span = Math.max(latSpan, lngSpan);
  const scaledAltitude = span / 112;
  return Math.min(0.9, Math.max(0.14, scaledAltitude));
};

export const getMetricValue = (
  metricRecord: MetricRecord | undefined,
  metricKey: string,
): number => {
  const metricValue = metricRecord?.[metricKey];
  return typeof metricValue === "number" ? metricValue : 0;
};

export const createColorResolver = (values: number[], colorScale: ColorScaleInput) => {
  if (!values.length) return () => colorScale.minColor;
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  if (minValue === maxValue) return () => colorScale.maxColor;
  const normalizer = scaleLinear().domain([minValue, maxValue]).range([0, 1]);
  const interpolator = interpolateRgb(colorScale.minColor, colorScale.maxColor);
  return (value: number) => interpolator(normalizer(value));
};

export const getZoomLevelByAltitude = (altitude: number): GlobeLevel => {
  if (altitude <= 1.35) return 2;
  if (altitude <= 2.1) return 1;
  return 0;
};

export const formatMetric = (value: number): string =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

export const escapeHtml = (raw: string): string =>
  raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Removes trailing ISO-3166-1 alpha-2 codes from labels like "Germany (DE)" or "Bayern — DE". */
export const stripIsoFromDisplayName = (
  rawName: string,
  isoA2?: string,
): string => {
  let name = rawName.trim();
  if (!name) return name;
  const iso = isoA2?.trim().toUpperCase();
  if (iso && /^[A-Z]{2}$/.test(iso)) {
    name = name
      .replace(new RegExp(`\\s*\\(${iso}\\)`, "gi"), "")
      .replace(new RegExp(`\\s*\\[${iso}\\]`, "gi"), "")
      .replace(new RegExp(`\\s*[-–—]\\s*${iso}\\s*$`, "i"), "")
      .replace(new RegExp(`\\s+${iso}\\s*$`, "i"), "");
  }
  return name.trim() || rawName.trim();
};

export const humanizeMetricKey = (key: string): string => {
  const spaced = key.replace(/_/g, " ");
  return spaced.replace(/\b\w/g, (character) => character.toUpperCase());
};

export const countryCodeToFlagEmoji = (isoA2: string | undefined): string => {
  if (!isoA2 || isoA2.length !== 2) return "";
  const upper = isoA2.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return "";
  const regionalOffset = 0x1f1e6;
  const first = upper.codePointAt(0)! - 65 + regionalOffset;
  const second = upper.codePointAt(1)! - 65 + regionalOffset;
  return String.fromCodePoint(first, second);
};

const METRIC_KEY_BLOCKLIST = new Set([
  "countrycode",
  "country_code",
  "iso_a2",
  "iso",
  "adm0_a3",
  "iso_3166_1",
]);

export const isHiddenMetricKey = (key: string): boolean =>
  METRIC_KEY_BLOCKLIST.has(key.toLowerCase());

export const formatMetricDisplay = (metricKey: string, value: number): string => {
  const normalizedKey = metricKey.toLowerCase();
  if (normalizedKey === "revenue") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return formatMetric(value);
};
