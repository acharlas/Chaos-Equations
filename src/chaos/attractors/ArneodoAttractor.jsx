import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import { ArneodoEquation } from "../equations/ArneodoEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";

const ArneodoAttractor = ({ sharedParams }) => {
  const [freeze, setFreeze] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const { a, b, c } = useControls({
    Arneodo: folder(
      {
        a: { value: 5.5, min: 0, max: 7, step: 0.1 },
        b: { value: 3.5, min: 0, max: 7, step: 0.1 },
        c: { value: 1, min: 0, max: 3, step: 0.1 },
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
    return ArneodoEquation(x, y, z, dtLocal, { a, b, c });
  };

  return (
    <AttractorWrapper globalScale={globalScale} attractorId="Arneodo">
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

export default ArneodoAttractor;