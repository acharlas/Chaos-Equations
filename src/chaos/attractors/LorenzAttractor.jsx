import React, { useMemo, useState } from "react";
import { folder, useControls } from "leva";
import ChaosManager from "../ChaosManager";
import { LorenzEquation } from "../equations/LorenzEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";
import { commonAttractorControls } from "../SharedControls";

const LorenzAttractor = () => {
  // Local state for freeze and restart actions
  const [freeze, setFreeze] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const params = useControls({
    Lorenz: folder({
      a: { value: 10, min: 5, max: 15, step: 0.5 },
      b: { value: 28, min: 20, max: 40, step: 1 },
      c: { value: 8 / 3, min: 2, max: 5, step: 0.1 },
      ...commonAttractorControls,
      freeze: { button: () => setFreeze(prev => !prev) },
      restart: { button: () => setRestartTrigger(prev => prev + 1) }
    }),
  });

  const {
    a,
    b,
    c,
    dt,
    Npoints,
    trailLength,
    lowSpeedHex,
    highSpeedHex,
    globalScale,
  } = params;

  // Create THREE.Color instances from the hex values
  const lowSpeedColor = useMemo(() => new THREE.Color(lowSpeedHex), [lowSpeedHex]);
  const highSpeedColor = useMemo(() => new THREE.Color(highSpeedHex), [highSpeedHex]);

  // Define the Lorenz equation with current parameters.
  // Note: LorenzEquation returns an object with dx, dy, dz, so we convert it to an array.
  const equation = (x, y, z, dtLocal) => {
    const { dx, dy, dz } = LorenzEquation(x, y, z, dtLocal, { a, b, c });
    return [dx, dy, dz];
  };

  return (
    <AttractorWrapper globalScale={globalScale}>
      <ChaosManager
        Npoints={Npoints}
        trailLength={trailLength}
        dt={dt}
        equation={equation}
        lowSpeedColor={lowSpeedColor}
        highSpeedColor={highSpeedColor}
        freeze={freeze}
        restartTrigger={restartTrigger}
      />
    </AttractorWrapper>
  );
};

export default LorenzAttractor;
