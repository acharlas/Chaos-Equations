import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import { HyperRosslerEquation } from "../equations/HyperRosslerEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";

const HyperRosslerAttractor = ({ sharedParams }) => {
  const [freeze, setFreeze] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const { a, b, c, d, e } = useControls({
    HyperRossler: folder(
      {
        a: { value: 0.25, min: 0, max: 0.6, step: 0.01 },
        b: { value: 3, min: 1, max: 4, step: 0.1 },
        c: { value: 0.5, min: 0, max: 1.2, step: 0.01 },
        d: { value: 0.05, min: -0.2, max: 0.2, step: 0.01 },
        e: { value: 0.1, min: -0.2, max: 0.2, step: 0.01 },
      },
      { order: -1 }
    ),
    freeze: button(() => setFreeze((prev) => !prev)),
    restart: button(() => setRestartTrigger((prev) => prev + 1)),
  });

  const {
    dt,
    substeps,
    Npoints,
    trailLength,
    lowSpeedHex,
    highSpeedHex,
    globalScale,
    speedContrast,
  } =
    sharedParams;

  const lowSpeedColor = useMemo(
    () => new THREE.Color(lowSpeedHex),
    [lowSpeedHex]
  );
  const highSpeedColor = useMemo(
    () => new THREE.Color(highSpeedHex),
    [highSpeedHex]
  );

  const equation = (x, y, z, dtLocal, w) => {
    return HyperRosslerEquation(x, y, z, w, dtLocal, { a, b, c, d, e });
  };

  return (
    <AttractorWrapper globalScale={globalScale}>
      <ChaosManager
        Npoints={Npoints}
        trailLength={trailLength}
        dt={dt}
        substeps={substeps}
        equation={equation}
        lowSpeedColor={lowSpeedColor}
        highSpeedColor={highSpeedColor}
        speedContrast={speedContrast}
        freeze={freeze}
        restartTrigger={restartTrigger}
      />
    </AttractorWrapper>
  );
};

export default HyperRosslerAttractor;
