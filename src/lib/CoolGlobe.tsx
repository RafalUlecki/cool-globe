import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection } from "geojson";
import { Color } from "three";
import type { MeshPhongMaterial } from "three";

import type {
  GlobeLevel,
  MetricRecord,
} from "./dashboardGlobe.types";
import {
  DEFAULT_COLOR_SCALE,
  GLOBAL_ADMIN1_GEOJSON_URL,
  GLOBAL_COUNTRIES_GEOJSON_URL,
  WHITE_GLOBE_TEXTURE,
  WORLD_TOPOJSON_URL,
} from "./CoolGlobe.constants";
import type {
  CountryFeatureProperties,
  PolygonFeatureProperties,
  TopologyRoot,
} from "./CoolGlobe.types";
import {
  createColorResolver,
  escapeHtml,
  findCountryFeatureByIso,
  formatMetricDisplay,
  getAltitudeFromBounds,
  getFeatureBounds,
  getMetricValue,
  getZoomLevelByAltitude,
  humanizeMetricKey,
  isHiddenMetricKey,
  normalizeCountryIso,
  stripIsoFromDisplayName,
} from "./dashboardGlobe.utils";
import type { CoolGlobeProps } from "./types";

const FLOAT_TOOLTIP_OVERRIDE_ID = "cool-globe-float-tooltip-override";

const injectFloatTooltipOverride = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById(FLOAT_TOOLTIP_OVERRIDE_ID)) return;
  const style = document.createElement("style");
  style.id = FLOAT_TOOLTIP_OVERRIDE_ID;
  style.textContent = `
.cool-globe-host .float-tooltip-kap {
  background: transparent !important;
  background-color: transparent !important;
  padding: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  max-width: none !important;
  font-size: inherit !important;
  font-family: inherit !important;
  color: transparent !important;
}
`;
  document.head.appendChild(style);
};

export const CoolGlobe = ({
  statisticsData,
  resetSignal,
  preselectedCountry,
  countryNumericToIsoMap = {},
  countryNameToIsoMap = {},
  primaryMetric = "visits",
  colorScale = DEFAULT_COLOR_SCALE,
}: CoolGlobeProps) => {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomDebounceRef = useRef<number | undefined>(undefined);
  const regionCacheRef = useRef<Record<string, Feature[]>>({});
  const globalAdmin1Ref = useRef<Feature[] | null>(null);
  const previousResetSignalRef = useRef<string | number | undefined>(resetSignal);
  const preselectionAppliedKeyRef = useRef<string | undefined>(undefined);

  const [globeReady, setGlobeReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<GlobeLevel>(0);
  const [selectedCountryCode, setSelectedCountryCode] = useState<
    string | undefined
  >();
  const [selectedRegionName, setSelectedRegionName] = useState<
    string | undefined
  >();
  const [hoveredFeature, setHoveredFeature] = useState<Feature | null>(null);
  const [countryFeatures, setCountryFeatures] = useState<Feature[]>([]);
  const [regionFeatures, setRegionFeatures] = useState<Feature[]>([]);
  const [containerSize, setContainerSize] = useState({
    width: 900,
    height: 760,
  });

  useEffect(() => {
    injectFloatTooltipOverride();
  }, []);

  const countriesMetricValues = useMemo(
    () =>
      Object.values(statisticsData.countries).map((metrics) =>
        getMetricValue(metrics, primaryMetric),
      ),
    [primaryMetric, statisticsData.countries],
  );
  const regionsMetricValues = useMemo(() => {
    if (!selectedCountryCode) return [];
    return Object.values(statisticsData.regions[selectedCountryCode] ?? {}).map(
      (metrics) => getMetricValue(metrics, primaryMetric),
    );
  }, [selectedCountryCode, primaryMetric, statisticsData.regions]);
  const countryColorResolver = useMemo(
    () => createColorResolver(countriesMetricValues, colorScale),
    [countriesMetricValues, colorScale],
  );
  const regionColorResolver = useMemo(
    () => createColorResolver(regionsMetricValues, colorScale),
    [regionsMetricValues, colorScale],
  );

  useEffect(() => {
    const loadCountries = async () => {
      let features: Feature[] = [];
      try {
        const response = await fetch(GLOBAL_COUNTRIES_GEOJSON_URL);
        const countriesGeoJson = (await response.json()) as FeatureCollection;
        features = countriesGeoJson.features as Feature[];
      } catch {
        // Fallback keeps globe functional even if the GeoJSON source is unavailable.
        const response = await fetch(WORLD_TOPOJSON_URL);
        const topologyData = (await response.json()) as TopologyRoot;
        const countriesObject = topologyData.objects.countries;
        const converted = feature(
          topologyData as never,
          countriesObject as never,
        ) as Feature | FeatureCollection;
        features =
          converted.type === "FeatureCollection"
            ? converted.features
            : [converted];
      }
      const enriched = features.map((countryFeature) => {
        const rawId = String(countryFeature.id ?? "");
        const properties = (countryFeature.properties ??
          {}) as CountryFeatureProperties;
        const displayName =
          String(
            properties.name ??
              properties.NAME ??
              properties.name_en ??
              properties.ADMIN ??
              "",
          ).trim() || `Country ${rawId}`;
        const normalizedName = displayName.toLowerCase();
        const candidateIsoA2 = String(
          properties.iso_a2 ?? properties.ISO_A2 ?? properties.iso_a2_eh ?? "",
        )
          .trim()
          .toUpperCase();
        const isoA2 =
          countryNumericToIsoMap[rawId] ??
          countryNameToIsoMap[normalizedName] ??
          (candidateIsoA2 && candidateIsoA2 !== "-99" ? candidateIsoA2 : undefined) ??
          (rawId.length === 2 ? rawId.toUpperCase() : rawId);
        return {
          ...countryFeature,
          properties: {
            ...properties,
            __isoA2: isoA2,
            name: displayName || isoA2 || `Country ${rawId}`,
          },
        };
      }) as Feature[];
      setCountryFeatures(enriched);
    };
    void loadCountries();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const next = entries[0];
      if (!next) return;
      setContainerSize({
        width: Math.max(360, Math.floor(next.contentRect.width)),
        height: Math.max(520, Math.floor(next.contentRect.height)),
      });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedCountryCode) {
      setRegionFeatures([]);
      return;
    }
    const cachedFeatures = regionCacheRef.current[selectedCountryCode];
    if (cachedFeatures) {
      setRegionFeatures(cachedFeatures);
      return;
    }
    const loadRegions = async () => {
      if (!globalAdmin1Ref.current) {
        const response = await fetch(GLOBAL_ADMIN1_GEOJSON_URL);
        const admin1GeoJson = (await response.json()) as FeatureCollection;
        globalAdmin1Ref.current = admin1GeoJson.features as Feature[];
      }
      const filtered = (globalAdmin1Ref.current ?? []).filter(
        (regionFeature) => {
          const props = (regionFeature.properties ?? {}) as Record<
            string,
            unknown
          >;
          return props.iso_a2 === selectedCountryCode;
        },
      ) as Feature[];
      const mapped = filtered.map((regionFeature) => {
        const sourceProperties = (regionFeature.properties ?? {}) as Record<
          string,
          unknown
        >;
        const rawName = String(sourceProperties.name ?? "").trim();
        return {
          ...regionFeature,
          properties: {
            ...sourceProperties,
            __countryCode: selectedCountryCode,
            __regionName: rawName,
            name: rawName,
          },
        };
      }) as Feature[];
      regionCacheRef.current[selectedCountryCode] = mapped;
      setRegionFeatures(mapped);
    };
    void loadRegions();
  }, [selectedCountryCode]);

  useEffect(() => {
    if (selectedRegionName && zoomLevel < 2) return void setZoomLevel(2);
    if (selectedCountryCode && zoomLevel < 1) setZoomLevel(1);
  }, [selectedCountryCode, selectedRegionName, zoomLevel]);

  useEffect(() => {
    const globeControls = globeRef.current?.controls?.();
    if (!globeControls) return;
    globeControls.autoRotate = true;
    globeControls.autoRotateSpeed = 0.45;
    globeControls.enablePan = false;
    globeControls.enableZoom = true;
    const renderer = globeRef.current?.renderer?.();
    if (renderer)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  }, []);
  useEffect(() => {
    const globeControls = globeRef.current?.controls?.();
    if (!globeControls) return;
    globeControls.autoRotate = !selectedCountryCode && zoomLevel === 0;
  }, [selectedCountryCode, zoomLevel]);

  const focusCamera = useCallback((lat: number, lng: number, altitude: number) => {
    globeRef.current?.pointOfView({ lat, lng, altitude }, 650);
  }, []);

  const stopAutoRotate = useCallback(() => {
    const controls = globeRef.current?.controls?.();
    if (controls) controls.autoRotate = false;
  }, []);

  const selectCountry = useCallback(
    (
      countryCode: string,
      countryFeature?: Feature,
      options?: { focusCamera?: boolean },
    ) => {
      const normalized = normalizeCountryIso(countryCode);
      if (!normalized) return;

      stopAutoRotate();
      setZoomLevel(1);
      setSelectedCountryCode(normalized);
      setSelectedRegionName(undefined);

      if (options?.focusCamera === false) return;

      const feature =
        countryFeature ??
        findCountryFeatureByIso(
          countryFeatures,
          normalized,
          countryNameToIsoMap,
        );
      const bounds = feature ? getFeatureBounds(feature) : undefined;
      if (bounds) {
        focusCamera(
          (bounds.minLat + bounds.maxLat) / 2,
          (bounds.minLng + bounds.maxLng) / 2,
          getAltitudeFromBounds(bounds),
        );
      }
    },
    [countryFeatures, countryNameToIsoMap, focusCamera, stopAutoRotate],
  );

  useEffect(() => {
    if (resetSignal === previousResetSignalRef.current) return;
    previousResetSignalRef.current = resetSignal;
    setSelectedRegionName(undefined);
    setHoveredFeature(null);
    preselectionAppliedKeyRef.current = undefined;

    const normalizedPreselection = preselectedCountry?.trim()
      ? normalizeCountryIso(preselectedCountry)
      : undefined;

    if (normalizedPreselection) {
      selectCountry(normalizedPreselection);
      return;
    }

    setZoomLevel(0);
    setSelectedCountryCode(undefined);
    setRegionFeatures([]);
    const controls = globeRef.current?.controls?.();
    if (controls) controls.autoRotate = true;
    focusCamera(20, 15, 2.6);
  }, [focusCamera, preselectedCountry, resetSignal, selectCountry]);

  useEffect(() => {
    const normalized = preselectedCountry?.trim()
      ? normalizeCountryIso(preselectedCountry)
      : undefined;
    if (!normalized || !globeReady || !countryFeatures.length) return;

    const applicationKey = `${normalized}:${String(resetSignal ?? "")}`;
    if (preselectionAppliedKeyRef.current === applicationKey) return;

    const countryFeature = findCountryFeatureByIso(
      countryFeatures,
      normalized,
      countryNameToIsoMap,
    );
    selectCountry(normalized, countryFeature);
    preselectionAppliedKeyRef.current = applicationKey;
  }, [
    countryFeatures,
    countryNameToIsoMap,
    globeReady,
    preselectedCountry,
    resetSignal,
    selectCountry,
  ]);

  const applyLightGlobeMaterial = () => {
    const material = globeRef.current?.globeMaterial?.() as
      | MeshPhongMaterial
      | undefined;
    if (!material) return;
    material.map = null;
    material.color = new Color("#f5f5f5");
    material.emissive = new Color("#ffffff");
    material.emissiveIntensity = 0.35;
    material.specular = new Color("#d4d4d8");
    material.shininess = 3;
    material.needsUpdate = true;
  };
  const handleZoomEvent = () => {
    if (zoomDebounceRef.current) window.clearTimeout(zoomDebounceRef.current);
    zoomDebounceRef.current = window.setTimeout(() => {
      const altitude = globeRef.current?.pointOfView?.().altitude ?? 2.4;
      const nextLevel = getZoomLevelByAltitude(altitude);
      setZoomLevel(nextLevel);
      if (nextLevel <= 0) setSelectedRegionName(undefined);
    }, 120);
  };
  const handlePolygonClick = (featureItem: Feature) => {
    const properties = (featureItem.properties ??
      {}) as PolygonFeatureProperties;
    if (zoomLevel === 0) {
      const fallbackCountryCode =
        countryNameToIsoMap[String(properties.name ?? "").toLowerCase()];
      const countryCode =
        properties.__isoA2 ??
        (typeof properties.iso_a2 === "string"
          ? properties.iso_a2.toUpperCase()
          : undefined) ??
        fallbackCountryCode;
      if (!countryCode) return;
      selectCountry(countryCode, featureItem);
      return;
    }
    if (zoomLevel >= 1) {
      const regionName = properties.__regionName;
      if (!regionName) return;
      stopAutoRotate();
      setZoomLevel(2);
      setSelectedRegionName(regionName);
      const bounds = getFeatureBounds(featureItem);
      if (bounds) {
        focusCamera(
          (bounds.minLat + bounds.maxLat) / 2,
          (bounds.minLng + bounds.maxLng) / 2,
          Math.max(0.2, getAltitudeFromBounds(bounds) * 0.52),
        );
        return;
      }
    }
  };

  const selectedPolygonData =
    zoomLevel === 0
      ? countryFeatures
      : regionFeatures.length
        ? [...countryFeatures, ...regionFeatures]
        : countryFeatures;

  const resolveMetric = (
    countryCode?: string,
    regionName?: string,
  ): MetricRecord | undefined => {
    if (regionName && countryCode)
      return statisticsData.regions[countryCode]?.[regionName];
    if (countryCode) return statisticsData.countries[countryCode];
    return undefined;
  };
  const getMetricRowsHtml = (metricRecord: MetricRecord | undefined): string => {
    if (!metricRecord) {
      return `<div style="color:#697386;font-weight:500;font-size:15px;">No data available</div>`;
    }
    const metricEntries = Object.entries(metricRecord).filter(
      ([metricKey, metricValue]) =>
        !isHiddenMetricKey(metricKey) &&
        typeof metricValue === "number" &&
        Number.isFinite(metricValue),
    );
    if (!metricEntries.length) {
      return `<div style="color:#697386;font-weight:500;font-size:15px;">No data available</div>`;
    }
    metricEntries.sort(([leftKey], [rightKey]) => {
      if (leftKey === primaryMetric) return -1;
      if (rightKey === primaryMetric) return 1;
      return leftKey.localeCompare(rightKey);
    });
    const rowStyle =
      "display:flex;justify-content:space-between;align-items:center;gap:24px;padding:6px 0;";
    const labelStyle = "font-weight:500;color:#697386;font-size:15px;";
    const valueStyle =
      "font-weight:600;color:#1A1F36;font-size:15px;font-variant-numeric:tabular-nums;white-space:nowrap;";
    return metricEntries
      .map(([metricKey, metricValue]) => {
        const label = escapeHtml(humanizeMetricKey(metricKey));
        const value = escapeHtml(
          formatMetricDisplay(metricKey, metricValue as number),
        );
        return `<div style="${rowStyle}"><span style="${labelStyle}">${label}</span><span style="${valueStyle}">${value}</span></div>`;
      })
      .join("");
  };
  return (
    <div
      ref={containerRef}
      className="cool-globe-host"
      style={{
        position: "relative",
        height: "100%",
        overflow: "hidden",
        background: "white",
      }}
    >
      <Globe
        ref={globeRef}
        globeImageUrl={WHITE_GLOBE_TEXTURE}
        backgroundColor="#ffffff"
        polygonsData={selectedPolygonData}
        polygonAltitude={0.01}
        polygonsTransitionDuration={180}
        polygonCapColor={(featureItem: object) => {
          const properties = ((featureItem as Feature).properties ??
            {}) as PolygonFeatureProperties;
          const isRegionPolygon = Boolean(properties.__regionName);
          if (zoomLevel > 0 && !isRegionPolygon)
            return "rgba(148,163,184,0.027)";
          const countryCode =
            zoomLevel === 0 ? properties.__isoA2 : properties.__countryCode;
          const regionName = properties.__regionName;
          const metricRecord = resolveMetric(countryCode, regionName);
          const metric = getMetricValue(metricRecord, primaryMetric);
          const baseColor =
            zoomLevel === 0
              ? countryColorResolver(metric)
              : regionColorResolver(metric);
          const isHovered = hoveredFeature === (featureItem as Feature);
          return isHovered ? "#60a5fa" : baseColor;
        }}
        polygonSideColor={(featureItem: object) => {
          const properties = ((featureItem as Feature).properties ??
            {}) as PolygonFeatureProperties;
          if (zoomLevel > 0 && !properties.__regionName)
            return "rgba(148,163,184,0.027)";
          return properties.__regionName
            ? "rgba(148,163,184,0.22)"
            : "rgba(226,232,240,0.45)";
        }}
        polygonStrokeColor={(featureItem: object) => {
          const properties = ((featureItem as Feature).properties ??
            {}) as PolygonFeatureProperties;
          if (zoomLevel > 0 && !properties.__regionName)
            return "rgba(100,116,139,0.067)";
          return properties.__regionName
            ? "rgba(51,65,85,0.98)"
            : "rgba(156,163,175,0.95)";
        }}
        polygonLabel={(featureItem: object) => {
          const properties = ((featureItem as Feature).properties ??
            {}) as PolygonFeatureProperties;
          if (zoomLevel > 0 && !properties.__regionName) {
            return "";
          }
          const countryCode =
            zoomLevel === 0 ? properties.__isoA2 : properties.__countryCode;
          const regionName = properties.__regionName;
          const displayNameRaw = regionName ?? properties.name ?? "Unknown";
          const isoForNameStrip =
            zoomLevel === 0
              ? properties.__isoA2
              : properties.__countryCode ?? properties.__isoA2;
          const displayNameClean = stripIsoFromDisplayName(
            String(displayNameRaw),
            isoForNameStrip,
          );
          const metricRecord = resolveMetric(countryCode, regionName);
          const metricRows = getMetricRowsHtml(metricRecord);
          const title = escapeHtml(displayNameClean);
          return `<div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,Inter,sans-serif;min-width:272px;max-width:320px;padding:20px;background:#ffffff;color:#1A1F36;border-radius:14px;box-shadow:0 8px 24px rgba(15,23,42,0.12);">
            <div style="font-size:17px;font-weight:600;color:#1A1F36;line-height:1.25;margin-bottom:4px;">${title}</div>
            <div style="margin-top:8px;">${metricRows}</div>
          </div>`;
        }}
        onPolygonHover={(featureItem: object | null) => {
          setHoveredFeature((featureItem as Feature | null) ?? null);
        }}
        onPolygonClick={(polygon) => handlePolygonClick(polygon as Feature)}
        onZoom={handleZoomEvent}
        onGlobeReady={() => {
          applyLightGlobeMaterial();
          setGlobeReady(true);
          if (!preselectedCountry?.trim()) {
            focusCamera(20, 15, 2.6);
          }
        }}
        onGlobeClick={() => {
          const controls = globeRef.current?.controls?.();
          if (controls) controls.autoRotate = false;
        }}
        lineHoverPrecision={0}
        width={containerSize.width}
        height={containerSize.height}
        showAtmosphere={false}
      />
    </div>
  );
};

export default CoolGlobe;
