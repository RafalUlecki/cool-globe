export interface TopoJsonObject {
  type: string;
  arcs: number[][][];
}

export interface TopologyRoot {
  type: "Topology";
  objects: Record<string, TopoJsonObject>;
}

export interface PolygonFeatureProperties {
  name?: string;
  iso_a2?: string;
  __isoA2?: string;
  __regionName?: string;
  __countryCode?: string;
}

export interface CountryFeatureProperties extends PolygonFeatureProperties {
  NAME?: string;
  name_en?: string;
  ADMIN?: string;
  ISO_A2?: string;
  iso_a2_eh?: string;
}

export interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}
