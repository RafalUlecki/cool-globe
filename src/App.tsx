import { useState, type CSSProperties } from "react";
import { CoolGlobe } from "./index";
import type { GlobeSelection, StatisticsData } from "./index";

const statisticsData: StatisticsData = {
  countries: {
    LT: { population: 2801000, visits: 85000 },
    DE: { population: 83200000, visits: 2800000, revenue: 124_700_000 },
    PL: { population: 38000000, visits: 1200000 },
  },
  regions: {
    DE: {
      Bayern: { population: 13100000, visits: 510000 },
      Berlin: { population: 3700000, visits: 320000 },
    },
    PL: {
      Masovian: { population: 5400000, visits: 260000, revenue: 1000000 },
    },
  },
};

function formatMetricValue(key: string, value: unknown): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return String(value);
  if (key.toLowerCase().includes("revenue")) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    value,
  );
}

function SelectionPanel({
  selection,
  statisticsData,
}: {
  selection: GlobeSelection;
  statisticsData: StatisticsData;
}) {
  const panelStyle: CSSProperties = {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 280,
    padding: 16,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    background: "rgba(255,255,255,0.95)",
    color: "#0f172a",
    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
  };

  if (selection.level === 0) {
    return (
      <aside style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600 }}>
          Selection
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
          Select a country on the globe
        </p>
      </aside>
    );
  }

  const metrics =
    selection.level === 2 && selection.countryCode && selection.regionName
      ? statisticsData.regions[selection.countryCode]?.[selection.regionName]
      : selection.countryCode
        ? statisticsData.countries[selection.countryCode]
        : undefined;

  const title =
    selection.level === 2
      ? `${selection.regionName}, ${selection.countryCode}`
      : selection.countryCode;

  return (
    <aside style={panelStyle}>
      <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 600 }}>
        {title}
      </h2>
      <p style={{ margin: "0 0 12px", color: "#64748b", fontSize: 13 }}>
        {selection.level === 2 ? "Region" : "Country"} view
      </p>
      {metrics ? (
        <dl style={{ margin: 0, display: "grid", gap: 8 }}>
          {Object.entries(metrics).map(([key, value]) => (
            <div
              key={key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontSize: 14,
              }}
            >
              <dt style={{ margin: 0, color: "#64748b", textTransform: "capitalize" }}>
                {key}
              </dt>
              <dd style={{ margin: 0, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {formatMetricValue(key, value)}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
          No data available
        </p>
      )}
    </aside>
  );
}

function App() {
  const [resetSignal, setResetSignal] = useState(0);
  const [selection, setSelection] = useState<GlobeSelection>({ level: 0 });

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "#f8fafc",
        position: "relative",
      }}
    >
      <button
        type="button"
        onClick={() => setResetSignal((previousValue) => previousValue + 1)}
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 10,
          height: 40,
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          padding: "0 12px",
          background: "rgba(255,255,255,0.9)",
          color: "#000",
          cursor: "pointer",
        }}
      >
        Reset Globe
      </button>
      <SelectionPanel selection={selection} statisticsData={statisticsData} />
      <CoolGlobe
        statisticsData={statisticsData}
        resetSignal={resetSignal}
        selectedCountry={selection.countryCode ?? null}
        selectedRegion={selection.regionName ?? null}
        onSelectionChange={setSelection}
      />
    </div>
  );
}

export default App;
