import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import { RosslerEquation } from "../equations/RosslerEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";

const RosslerAttractor = ({ sharedParams }) => {
  const [freeze, setFreeze] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const { a, b, c } = useControls({
    Rossler: folder(
      {
        a: { value: 0.2, min: 0, max: 0.4, step: 0.01 },
        b: { value: 0.2, min: 0, max: 0.4, step: 0.01 },
        c: { value: 5.7, min: 2, max: 10, step: 0.1 },
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
    maxTrailPoints,
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
    return RosslerEquation(x, y, z, dtLocal, { a, b, c });
  };

  return (
    <AttractorWrapper globalScale={globalScale} attractorId="Rossler">
      <ChaosManager
        Npoints={Npoints}
        trailLength={trailLength}
        dt={dt}
        substeps={substeps}
        equation={equation}
        lowSpeedColor={lowSpeedColor}
        highSpeedColor={highSpeedColor}
        speedContrast={speedContrast}
        maxTrailPoints={maxTrailPoints}
        freeze={freeze}
        restartTrigger={restartTrigger}
      />
    </AttractorWrapper>
  );
};

export default RosslerAttractor;