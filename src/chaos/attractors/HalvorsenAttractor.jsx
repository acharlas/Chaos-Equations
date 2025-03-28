import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import { HalvorsenEquation } from "../equations/HalvorsenEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";

const HalvorsenAttractor = ({ sharedParams }) => {
  const [freeze, setFreeze] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const { a } = useControls({
    Halvorsen: folder(
      {
        a: { value: 1.5, min: 1.0, max: 5, step: 0.05 },
      },
      { order: -1 }
    ),
    freeze: button(() => setFreeze((prev) => !prev)),
    restart: button(() => setRestartTrigger((prev) => prev + 1)),
  });

  const { dt, Npoints, trailLength, lowSpeedHex, highSpeedHex, globalScale } =
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
