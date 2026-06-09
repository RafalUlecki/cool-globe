import type { StatisticsData } from "../../index";

export const sampleStatistics: StatisticsData = {
  countries: {
    LT: { population: 2_801_000, visits: 85_000 },
    DE: { population: 83_200_000, visits: 2_800_000, revenue: 124_700_000 },
    PL: { population: 38_000_000, visits: 1_200_000, revenue: 42_000_000 },
    FR: { population: 68_000_000, visits: 3_100_000, revenue: 98_500_000 },
  },
  regions: {
    DE: {
      Bayern: { population: 13_100_000, visits: 510_000, revenue: 18_200_000 },
      Berlin: { population: 3_700_000, visits: 320_000, revenue: 9_400_000 },
    },
    PL: {
      Masovian: { population: 5_400_000, visits: 260_000, revenue: 1_000_000 },
    },
    FR: {
      "Île-de-France": { population: 12_300_000, visits: 890_000, revenue: 31_000_000 },
    },
  },
};

export const METRIC_OPTIONS = ["visits", "population", "revenue"] as const;
export type MetricOption = (typeof METRIC_OPTIONS)[number];

export const PRESELECT_OPTIONS = [
  { value: "", label: "None" },
  { value: "DE", label: "Germany (DE)" },
  { value: "PL", label: "Poland (PL)" },
  { value: "LT", label: "Lithuania (LT)" },
  { value: "FR", label: "France (FR)" },
] as const;

export type ColorScalePreset = "default" | "blue" | "green";

export const COLOR_SCALE_PRESETS: Record<
  ColorScalePreset,
  { label: string; minColor: string; maxColor: string }
> = {
  default: { label: "Neutral gray", minColor: "#f8fafc", maxColor: "#e5e7eb" },
  blue: { label: "Blue heat", minColor: "#eff6ff", maxColor: "#1d4ed8" },
  green: { label: "Green heat", minColor: "#ecfdf5", maxColor: "#047857" },
};
