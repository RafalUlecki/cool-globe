### Description

`cool-globe` is an interactive React globe library for country and region analytics, drill-down exploration, and metric-based geospatial dashboards.

![cool-globe banner](https://raw.githubusercontent.com/RafalUlecki/cool-globe/master/assets/banner.png)

## Overview

`cool-globe` helps to present geographic analytics in a clean and interactive way:

- Renders a 3D world globe with country and region polygons.
- Supports click drill-down from countries to regions.
- Colors areas by metric intensity (`primaryMetric`).
- Shows dynamic tooltip metrics (for example `visits`, `population`, `revenue`).
- Handles "no data" regions clearly in tooltip output.
- Exposes a library-level `resetSignal` API so frontend apps control reset UX.
- Ships as npm-ready ESM/CJS bundles with TypeScript declarations.

## Installation

```bash
npm install cool-globe react-globe.gl three
```

> `react`, `react-dom`, `react-globe.gl` and `three` are **peer dependencies** — they must be installed by the consuming app. This guarantees a single shared `three.js` instance in the page (multiple `three` copies break WebGL state, materials and shaders).

### Peer dependency versions

- `react` (`^18 || ^19`)
- `react-dom` (`^18 || ^19`)
- `react-globe.gl` (`^2.37.1`)
- `three` (`^0.180.0`)

### Requirements

- Node.js `>= 18`

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
      <CoolGlobe
        statisticsData={statisticsData}
        resetSignal={resetSignal}
        preselectedCountry="LT"
      />
    </div>
  );
}
```

## Props

- `statisticsData` (required): country/region metric tree.
- `resetSignal` (optional): when this value changes, globe view and selection state reset. With `preselectedCountry`, reset returns to that country instead of the world view.
- `autoRotate` (optional, default: `false`): when `true`, the globe spins slowly at the world view (zoom level 0, no country selected). Spinning stops on country/region selection, zoom-in, or globe click.
- `preselectedCountry` (optional): ISO 3166-1 alpha-2 code (e.g. `"LT"`). Auto-selects and zooms to this country once geo data and the globe are ready.
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
