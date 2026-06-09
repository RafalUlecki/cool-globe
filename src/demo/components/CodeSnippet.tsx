import { useCallback, useMemo, useState } from "react";
import {
  COLOR_SCALE_PRESETS,
  type ColorScalePreset,
} from "../data/sampleStatistics";
import type { PlaygroundMode } from "../hooks/usePlaygroundState";

export function CodeSnippet({
  mode,
  primaryMetric,
  colorScalePreset,
  autoRotate,
  preselectedCountry,
  useIsoFallbackMaps,
}: {
  mode: PlaygroundMode;
  primaryMetric: string;
  colorScalePreset: ColorScalePreset;
  autoRotate: boolean;
  preselectedCountry: string;
  useIsoFallbackMaps: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const scale = COLOR_SCALE_PRESETS[colorScalePreset];

  const code = useMemo(() => {
    const lines = [
      "<CoolGlobe",
      "  statisticsData={statisticsData}",
      "  resetSignal={resetSignal}",
    ];

    if (autoRotate) {
      lines.push("  autoRotate");
    }
    if (preselectedCountry) {
      lines.push(`  preselectedCountry="${preselectedCountry}"`);
    }
    if (mode === "controlled") {
      lines.push("  selectedCountry={selection.countryCode ?? null}");
      lines.push("  selectedRegion={selection.regionName ?? null}");
    }
    lines.push("  onSelectionChange={setSelection}");
    if (primaryMetric !== "visits") {
      lines.push(`  primaryMetric="${primaryMetric}"`);
    }
    if (colorScalePreset !== "default") {
      lines.push(
        `  colorScale={{ minColor: "${scale.minColor}", maxColor: "${scale.maxColor}" }}`,
      );
    }
    if (useIsoFallbackMaps) {
      lines.push('  countryNumericToIsoMap={{ "276": "DE" }}');
      lines.push('  countryNameToIsoMap={{ germany: "DE" }}');
    }
    lines.push("/>");

    return lines.join("\n");
  }, [
    mode,
    primaryMetric,
    colorScalePreset,
    autoRotate,
    preselectedCountry,
    useIsoFallbackMaps,
    scale.minColor,
    scale.maxColor,
  ]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [code]);

  return (
    <div className="panel code-snippet">
      <h3 className="panel__title">Live code</h3>
      <button type="button" className="btn btn--small" onClick={handleCopy}>
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre>{code}</pre>
    </div>
  );
}
