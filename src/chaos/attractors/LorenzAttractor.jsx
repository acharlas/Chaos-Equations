import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import { LorenzEquation } from "../equations/LorenzEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";
import { commonAttractorControls } from "../controls/SharedControls";

const LorenzAttractor = () => {
  const [freeze, setFreeze] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const params = useControls({
    ...commonAttractorControls,
    freeze: button(() => setFreeze((prev) => !prev)),
    restart: button(() => setRestartTrigger((prev) => prev + 1)),
    Lorenz: folder({
      a: { value: 10, min: 5, max: 15, step: 0.5 },
      b: { value: 28, min: 20, max: 40, step: 1 },
      c: { value: 8 / 3, min: 2, max: 5, step: 0.1 },
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

  const lowSpeedColor = useMemo(
    () => new THREE.Color(lowSpeedHex),
    [lowSpeedHex]
  );
  const highSpeedColor = useMemo(
    () => new THREE.Color(highSpeedHex),
    [highSpeedHex]
  );

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
