import { useCallback, useMemo, useRef, useState } from "react";
import type { GlobeSelection } from "../../index";
import {
  COLOR_SCALE_PRESETS,
  type ColorScalePreset,
  type MetricOption,
  sampleStatistics,
} from "../data/sampleStatistics";

export type PlaygroundMode = "controlled" | "uncontrolled";

export function usePlaygroundState() {
  const [mode, setMode] = useState<PlaygroundMode>("controlled");
  const [primaryMetric, setPrimaryMetric] = useState<MetricOption>("visits");
  const [colorScalePreset, setColorScalePreset] =
    useState<ColorScalePreset>("default");
  const [autoRotate, setAutoRotate] = useState(false);
  const [preselectedCountry, setPreselectedCountry] = useState("");
  const [resetSignal, setResetSignal] = useState(0);
  const [selection, setSelection] = useState<GlobeSelection>({ level: 0 });
  const [useIsoFallbackMaps, setUseIsoFallbackMaps] = useState(false);

  const previousLevelRef = useRef(0);

  const colorScale = COLOR_SCALE_PRESETS[colorScalePreset];

  const countryNumericToIsoMap = useMemo(
    () => (useIsoFallbackMaps ? { "276": "DE" } : undefined),
    [useIsoFallbackMaps],
  );
  const countryNameToIsoMap = useMemo(
    () => (useIsoFallbackMaps ? { germany: "DE" } : undefined),
    [useIsoFallbackMaps],
  );

  const handleSelectionChange = useCallback((nextSelection: GlobeSelection) => {
    setSelection(nextSelection);
    previousLevelRef.current = nextSelection.level;
  }, []);

  const handleReset = useCallback(() => {
    setResetSignal((previous) => previous + 1);
  }, []);

  const handleModeChange = useCallback((nextMode: PlaygroundMode) => {
    setMode(nextMode);
    setSelection({ level: 0 });
    previousLevelRef.current = 0;
  }, []);

  const controlledProps = useMemo(() => {
    if (mode !== "controlled") {
      return {};
    }
    return {
      selectedCountry: selection.countryCode ?? null,
      selectedRegion: selection.regionName ?? null,
    };
  }, [mode, selection.countryCode, selection.regionName]);

  const globeProps = useMemo(
    () => ({
      statisticsData: sampleStatistics,
      resetSignal,
      autoRotate,
      primaryMetric,
      colorScale: {
        minColor: colorScale.minColor,
        maxColor: colorScale.maxColor,
      },
      preselectedCountry: preselectedCountry || undefined,
      onSelectionChange: handleSelectionChange,
      countryNumericToIsoMap,
      countryNameToIsoMap,
      ...controlledProps,
    }),
    [
      resetSignal,
      autoRotate,
      primaryMetric,
      colorScale.minColor,
      colorScale.maxColor,
      preselectedCountry,
      handleSelectionChange,
      countryNumericToIsoMap,
      countryNameToIsoMap,
      controlledProps,
    ],
  );

  return {
    mode,
    setMode: handleModeChange,
    primaryMetric,
    setPrimaryMetric,
    colorScalePreset,
    setColorScalePreset,
    autoRotate,
    setAutoRotate,
    preselectedCountry,
    setPreselectedCountry,
    handleReset,
    selection,
    useIsoFallbackMaps,
    setUseIsoFallbackMaps,
    globeProps,
  };
}
