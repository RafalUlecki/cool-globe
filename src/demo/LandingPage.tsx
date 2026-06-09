import { Hero } from "./components/Hero";
import { Playground } from "./components/Playground";
import "./styles/landing.css";

export function LandingPage() {
  return (
    <div className="landing">
      <Hero />
      <Playground />
      <footer className="footer">
        <a
          href="https://github.com/RafalUlecki/cool-globe"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        <a
          href="https://www.npmjs.com/package/cool-globe"
          target="_blank"
          rel="noreferrer"
        >
          npm
        </a>
      </footer>
    </div>
  );
}
