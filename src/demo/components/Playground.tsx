import { CoolGlobe } from "../../index";
import { sampleStatistics } from "../data/sampleStatistics";
import { usePlaygroundState } from "../hooks/usePlaygroundState";
import { CodeSnippet } from "./CodeSnippet";
import { ControlPanel } from "./ControlPanel";
import { useResetLabel } from "./useResetLabel";
import { SelectionPanel } from "./SelectionPanel";

export function Playground() {
  const state = usePlaygroundState();
  const resetLabel = useResetLabel(state.mode, state.preselectedCountry);

  const preselectDisabled =
    state.mode === "controlled" && state.selection.level > 0;

  return (
    <section id="playground" className="playground">
      <div className="playground__header">
        <h2>Interactive playground</h2>
        <p>
          Adjust every prop below and explore drill-down, metrics, and selection
          modes on the live globe.
        </p>
      </div>

      <div className="playground__layout">
        <aside className="playground__sidebar">
          <ControlPanel
            mode={state.mode}
            onModeChange={state.setMode}
            primaryMetric={state.primaryMetric}
            onPrimaryMetricChange={state.setPrimaryMetric}
            colorScalePreset={state.colorScalePreset}
            onColorScalePresetChange={state.setColorScalePreset}
            autoRotate={state.autoRotate}
            onAutoRotateChange={state.setAutoRotate}
            preselectedCountry={state.preselectedCountry}
            onPreselectedCountryChange={state.setPreselectedCountry}
            preselectDisabled={preselectDisabled}
            onReset={state.handleReset}
            resetLabel={resetLabel}
            useIsoFallbackMaps={state.useIsoFallbackMaps}
            onUseIsoFallbackMapsChange={state.setUseIsoFallbackMaps}
          />
          <SelectionPanel
            selection={state.selection}
            statisticsData={sampleStatistics}
          />
          <CodeSnippet
            mode={state.mode}
            primaryMetric={state.primaryMetric}
            colorScalePreset={state.colorScalePreset}
            autoRotate={state.autoRotate}
            preselectedCountry={state.preselectedCountry}
            useIsoFallbackMaps={state.useIsoFallbackMaps}
          />
        </aside>

        <div className="playground__globe">
          <CoolGlobe key={state.mode} {...state.globeProps} />
        </div>
      </div>
    </section>
  );
}
