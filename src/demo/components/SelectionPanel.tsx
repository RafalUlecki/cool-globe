import type { GlobeSelection, StatisticsData } from "../../index";

function formatMetricValue(key: string, value: unknown): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return String(value);
  }
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

function buildBreadcrumb(selection: GlobeSelection): string {
  const parts = ["World"];
  if (selection.countryCode) {
    parts.push(selection.countryCode);
  }
  if (selection.regionName) {
    parts.push(selection.regionName);
  }
  return parts.join(" › ");
}

const LEVEL_LABELS: Record<number, string> = {
  0: "World view",
  1: "Country view",
  2: "Region view",
};

export function SelectionPanel({
  selection,
  statisticsData,
}: {
  selection: GlobeSelection;
  statisticsData: StatisticsData;
}) {
  if (selection.level === 0) {
    return (
      <div className="panel">
        <h3 className="panel__title">Selection</h3>
        <p className="selection__breadcrumb">{buildBreadcrumb(selection)}</p>
        <span className="selection__badge">{LEVEL_LABELS[0]}</span>
        <p className="selection__empty">Select a country on the globe</p>
      </div>
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
    <div className="panel">
      <h3 className="panel__title">Selection</h3>
      <p className="selection__breadcrumb">{buildBreadcrumb(selection)}</p>
      <h4 className="selection__title">{title}</h4>
      <span className="selection__badge">
        {LEVEL_LABELS[selection.level] ?? `Level ${selection.level}`}
      </span>
      {metrics ? (
        <dl className="selection__metrics">
          {Object.entries(metrics).map(([key, value]) => (
            <div key={key} className="selection__metric">
              <dt>{key}</dt>
              <dd>{formatMetricValue(key, value)}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="selection__empty">No data available</p>
      )}
    </div>
  );
}
