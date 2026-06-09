import { useCallback, useState } from "react";

const INSTALL_CMD = "npm install cool-globe react-globe.gl three";

export function Hero() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, []);

  return (
    <header className="hero">
      <h1 className="hero__title">
        Interactive React globe for country &amp; region analytics
      </h1>
      <p className="hero__subtitle">
        Drill down from world to regions, color areas by metrics, and sync
        selection with your dashboard — all from a single React component.
      </p>
      <div className="hero__actions">
        <div className="hero__install">
          <code>{INSTALL_CMD}</code>
          <button
            type="button"
            className="btn btn--small"
            onClick={handleCopy}
            aria-label="Copy install command"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <a
          className="hero__link"
          href="https://github.com/RafalUlecki/cool-globe"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        <a
          className="hero__link"
          href="https://www.npmjs.com/package/cool-globe"
          target="_blank"
          rel="noreferrer"
        >
          npm
        </a>
      </div>
      <div className="hero__pills">
        <span className="hero__pill">Country → region drill-down</span>
        <span className="hero__pill">Metric-based coloring</span>
        <span className="hero__pill">Rich tooltips</span>
        <span className="hero__pill">Controlled &amp; uncontrolled API</span>
      </div>
    </header>
  );
}
