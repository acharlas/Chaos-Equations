import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import AttractorWrapper from "./AttractorWrapper";
import { ThomasEquation } from "../equations/ThomasEquation";
import * as THREE from "three";
import { commonAttractorControls } from "../controls/SharedControls";

const ThomasAttractor = () => {
  const [freeze, setFreeze] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const params = useControls({
    ...commonAttractorControls,
    freeze: button(() => setFreeze((prev) => !prev)),
    restart: button(() => setRestartTrigger((prev) => prev + 1)),
    Thomas: folder({
      b: { value: 0.19, min: 0, max: 0.3, step: 0.01 },
    }),
  });

  const {
    b,
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
    return ThomasEquation(x, y, z, dtLocal, { b });
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

export default ThomasAttractor;
