import React, { useState, useMemo } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";
import { AizawaEquation } from "../equations/AizawaEquation";

const AizawaAttractor = ({ sharedParams }) => {
  const [freeze, setFreeze] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const { a, b, c, d, e, f } = useControls({
    Aizawa: folder(
      {
        a: { value: 0.95, min: 0, max: 1.5, step: 0.01 },
        b: { value: 0.7, min: 0, max: 1.5, step: 0.01 },
        c: { value: 0.6, min: 0, max: 1.5, step: 0.01 },
        d: { value: 3.5, min: 0, max: 6, step: 0.1 },
        e: { value: 0.25, min: 0, max: 0.8, step: 0.01 },
        f: { value: 0.1, min: 0, max: 0.8, step: 0.01 },
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

  const equation = (x, y, z, dtLocal) => {
    return AizawaEquation(x, y, z, dtLocal, { a, b, c, d, e, f });
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

export default AizawaAttractor;
