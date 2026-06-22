import { Leva } from "leva";
import Scene from "./Scene";
import "./App.css";

export default function App() {
  return (
    <div className="App">
      <div className="leva-panel">
        <Leva fill titleBar={{ title: "Settings", drag: false }} />
      </div>
      <Scene />
      <footer className="site-footer">
        <a href="https://www.linkedin.com/in/axel-charlassier/" target="_blank" rel="noreferrer">LinkedIn</a>
        <a href="https://github.com/acharlas/Chaos-Equations" target="_blank" rel="noreferrer">GitHub</a>
        <a href="mailto:axel.charlassier@gmail.com">Hire me</a>
      </footer>
    </div>
  );
}
