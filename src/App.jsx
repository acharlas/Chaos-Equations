import { Leva } from "leva";
import linkedinSvg from "/linkedin.svg";
import githubSvg from "/github.svg";
import Scene from "./Scene";
import "./App.css";

const ICON = {
  LinkedIn: {
    href: "https://www.linkedin.com/in/axel-charlassier/",
    label: "Axel Charlassier on LinkedIn",
    title: "Axel Charlassier — LinkedIn",
    src: linkedinSvg,
  },
  GitHub: {
    href: "https://github.com/acharlas/Chaos-Equations",
    label: "Chaos-Equations on GitHub",
    title: "Chaos-Equations — GitHub",
    src: githubSvg,
  },
};

export default function App() {
  return (
    <div className="App">
      <div className="leva-panel">
        <Leva fill titleBar={{ title: "Settings", drag: false }} />
      </div>
      <Scene />
      <footer className="site-footer">
        {Object.values(ICON).map((i) => (
          <a
            key={i.href}
            className="footer-link"
            href={i.href}
            target="_blank"
            rel="noreferrer"
            aria-label={i.label}
            title={i.title}
          >
            <img className="footer-icon" src={i.src} alt="" aria-hidden="true" />
          </a>
        ))}
        <span className="footer-divider" aria-hidden="true" />
        <a className="footer-otw" href="mailto:axel.charlassier@gmail.com">
          Like what you see? Hire me!
        </a>
      </footer>
    </div>
  );
}
