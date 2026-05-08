# cool-globe

Reusable interactive React globe component library focused on country and region drill-down.

## Installation

```bash
npm install cool-globe
```

## Peer dependencies

Install these in the consuming app:

- `react` (`^18 || ^19`)
- `react-dom` (`^18 || ^19`)
- `react-globe.gl` (`^2`)

## Basic usage

```tsx
import { useState } from "react";
import { CoolGlobe, type StatisticsData } from "cool-globe";

const statisticsData: StatisticsData = {
  countries: {
    LT: { population: 2801000, visits: 85000, revenue: 1200000 },
    DE: { population: 83200000, visits: 2800000, revenue: 52000000 },
  },
  regions: {
    LT: {
      Vilnius: { population: 580000, visits: 45000, revenue: 700000 },
    },
    DE: {
      Bayern: { population: 13100000, visits: 510000, revenue: 9800000 },
    },
  },
};

export default function Example() {
  const [resetSignal, setResetSignal] = useState(0);

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      <button
        type="button"
        onClick={() => setResetSignal((value) => value + 1)}
        style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}
      >
        Reset globe
      </button>
      <CoolGlobe statisticsData={statisticsData} resetSignal={resetSignal} />
    </div>
  );
}
```

## Props

- `statisticsData` (required): country/region metric tree.
- `resetSignal` (optional): when this value changes, globe view and selection state reset to default.
- `primaryMetric` (optional, default: `"visits"`): metric key used for color scale.
- `colorScale` (optional): `{ minColor, maxColor }`.
- `countryNumericToIsoMap` (optional): fallback mapping from numeric country ids to ISO2.
- `countryNameToIsoMap` (optional): fallback mapping from country names to ISO2.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## License

MIT
