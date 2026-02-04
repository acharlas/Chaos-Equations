import React, { useEffect, useState } from "react";
import Scene from "./Scene";
import "./App.css";
import { Leva } from "leva";
import { TooltipProvider } from "@radix-ui/react-tooltip";

export default function App() {
  //Should be change to a starting value and then change but somehow Leva don't re-render on resize.
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(
    window.innerWidth < 1024
  );
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileOrTablet(window.innerWidth < 1024);
    };
    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <TooltipProvider>
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
    </TooltipProvider>
  );
}
