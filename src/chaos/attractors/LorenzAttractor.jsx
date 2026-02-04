import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import { LorenzEquation } from "../equations/LorenzEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";

const LorenzAttractor = ({ sharedParams }) => {
  const [freeze, setFreeze] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const { a, b, c } = useControls({
    Lorenz: folder(
      {
        a: { value: 10, min: 5, max: 15, step: 0.5 },
        b: { value: 28, min: 20, max: 40, step: 1 },
        c: { value: 2.7, min: 2, max: 5, step: 0.1 },
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
    speedMin,
    speedMax,
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
    return LorenzEquation(x, y, z, dtLocal, { a, b, c });
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
        speedMin={speedMin}
        speedMax={speedMax}
        freeze={freeze}
        restartTrigger={restartTrigger}
      />
    </AttractorWrapper>
  );
};

export default LorenzAttractor;
