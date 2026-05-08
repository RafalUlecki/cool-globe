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
