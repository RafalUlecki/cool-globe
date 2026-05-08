import { useState } from "react";
import { CoolGlobe } from "./index";
import type { StatisticsData } from "./index";

const statisticsData: StatisticsData = {
  countries: {
    LT: { population: 2801000, visits: 85000 },
    DE: { population: 83200000, visits: 2800000 },
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

function App() {
  const [resetSignal, setResetSignal] = useState(0);

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
      <CoolGlobe statisticsData={statisticsData} resetSignal={resetSignal} />
    </div>
  );
}

export default App;
