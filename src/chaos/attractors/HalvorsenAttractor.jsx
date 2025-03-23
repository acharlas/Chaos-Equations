import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import { HalvorsenEquation } from "../equations/HalvorsenEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";
import { commonAttractorControls } from "../SharedControls";

const HalvorsenAttractor = () => {
  // Local state for freeze and restart.
  const [freeze, setFreeze] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  // Use Leva controls including two buttons.
  const params = useControls({
    Halvorsen: folder({
      a: { value: 1.5, min: 1.4, max: 4, step: 0.05 },
      ...commonAttractorControls,
      freeze: button(() => setFreeze((prev) => !prev)),
      restart: button(() => setRestartTrigger((prev) => prev + 1)),
    }),
  });

  const {
    a,
    dt,
    Npoints,
    trailLength,
    lowSpeedHex,
    highSpeedHex,
    globalScale,
  } = params;

  const lowSpeedColor = useMemo(() => new THREE.Color(lowSpeedHex), [lowSpeedHex]);
  const highSpeedColor = useMemo(() => new THREE.Color(highSpeedHex), [highSpeedHex]);

  // Bind the Halvorsen equation parameters.
  const equation = (x, y, z, dtLocal) => {
    return HalvorsenEquation(x, y, z, dtLocal, { a });
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

export default HalvorsenAttractor;
