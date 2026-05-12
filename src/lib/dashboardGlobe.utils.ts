import { interpolateRgb } from "d3-interpolate";
import { scaleLinear } from "d3-scale";

import type {
  ColorScaleInput,
  GlobeLevel,
  MetricRecord,
} from "./dashboardGlobe.types";

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
