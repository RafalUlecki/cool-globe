export type GlobeLevel = 0 | 1 | 2;

export interface MetricRecord {
  [key: string]: unknown;
}

export interface StatisticsData {
  countries: Record<string, MetricRecord>;
  regions: Record<string, Record<string, MetricRecord>>;
}

export interface ColorScaleInput {
  minColor: string;
  maxColor: string;
}
