import React, { useEffect, useState } from "react";
import Scene from "./Scene";
import "./App.css";
import { Leva } from "leva";

export default function App() {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const checkScreenSize = () => {
      setIsMobileOrTablet(window.innerWidth < 1024);
    };
    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="App">
      <div className="leva-panel">
        <Leva
          fill
          collapsed={isMobileOrTablet}
          titleBar={{ title: "Settings", drag: false }}
        />
      </div>
      <Scene />
    </div>
  );
}
