import type { PlaygroundMode } from "../hooks/usePlaygroundState";
import {
  COLOR_SCALE_PRESETS,
  type ColorScalePreset,
  METRIC_OPTIONS,
  type MetricOption,
  PRESELECT_OPTIONS,
} from "../data/sampleStatistics";

interface ControlPanelProps {
  mode: PlaygroundMode;
  onModeChange: (mode: PlaygroundMode) => void;
  primaryMetric: MetricOption;
  onPrimaryMetricChange: (metric: MetricOption) => void;
  colorScalePreset: ColorScalePreset;
  onColorScalePresetChange: (preset: ColorScalePreset) => void;
  autoRotate: boolean;
  onAutoRotateChange: (value: boolean) => void;
  preselectedCountry: string;
  onPreselectedCountryChange: (value: string) => void;
  preselectDisabled: boolean;
  onReset: () => void;
  resetLabel: string;
  useIsoFallbackMaps: boolean;
  onUseIsoFallbackMapsChange: (value: boolean) => void;
}

export function ControlPanel({
  mode,
  onModeChange,
  primaryMetric,
  onPrimaryMetricChange,
  colorScalePreset,
  onColorScalePresetChange,
  autoRotate,
  onAutoRotateChange,
  preselectedCountry,
  onPreselectedCountryChange,
  preselectDisabled,
  onReset,
  resetLabel,
  useIsoFallbackMaps,
  onUseIsoFallbackMapsChange,
}: ControlPanelProps) {
  return (
    <div className="panel">
      <h3 className="panel__title">Controls</h3>

      <div className="control-group">
        <label htmlFor="mode-select">Selection mode</label>
        <select
          id="mode-select"
          value={mode}
          onChange={(event) =>
            onModeChange(event.target.value as PlaygroundMode)
          }
        >
          <option value="controlled">Controlled (parent drives selection)</option>
          <option value="uncontrolled">Uncontrolled (globe owns selection)</option>
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="metric-select">Primary metric</label>
        <select
          id="metric-select"
          value={primaryMetric}
          onChange={(event) =>
            onPrimaryMetricChange(event.target.value as MetricOption)
          }
        >
          {METRIC_OPTIONS.map((metric) => (
            <option key={metric} value={metric}>
              {metric}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="color-select">Color scale</label>
        <select
          id="color-select"
          value={colorScalePreset}
          onChange={(event) =>
            onColorScalePresetChange(event.target.value as ColorScalePreset)
          }
        >
          {(Object.keys(COLOR_SCALE_PRESETS) as ColorScalePreset[]).map(
            (preset) => (
              <option key={preset} value={preset}>
                {COLOR_SCALE_PRESETS[preset].label}
              </option>
            ),
          )}
        </select>
      </div>

      <div className="control-group control-group--row">
        <label htmlFor="auto-rotate">Auto-rotate</label>
        <label className="toggle">
          <input
            id="auto-rotate"
            type="checkbox"
            checked={autoRotate}
            onChange={(event) => onAutoRotateChange(event.target.checked)}
          />
          <span className="toggle__slider" />
        </label>
      </div>
      <p className="panel__hint">Spins only at world view (level 0).</p>

      <div className="control-group">
        <label htmlFor="preselect-select">Preselect country</label>
        <select
          id="preselect-select"
          value={preselectedCountry}
          disabled={preselectDisabled}
          onChange={(event) => onPreselectedCountryChange(event.target.value)}
        >
          {PRESELECT_OPTIONS.map((option) => (
            <option key={option.value || "none"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {preselectDisabled && (
          <p className="panel__hint">
            Disabled while controlled mode has an active selection.
          </p>
        )}
      </div>

      <button type="button" className="btn btn--primary btn--full" onClick={onReset}>
        {resetLabel}
      </button>

      <details className="advanced">
        <summary>Advanced — ISO fallback maps</summary>
        <div className="control-group control-group--row">
          <label htmlFor="iso-fallback">Enable test maps</label>
          <label className="toggle">
            <input
              id="iso-fallback"
              type="checkbox"
              checked={useIsoFallbackMaps}
              onChange={(event) =>
                onUseIsoFallbackMapsChange(event.target.checked)
              }
            />
            <span className="toggle__slider" />
          </label>
        </div>
        <p className="panel__hint">
          Injects sample <code>countryNumericToIsoMap</code> and{" "}
          <code>countryNameToIsoMap</code> entries.
        </p>
      </details>
    </div>
  );
}
