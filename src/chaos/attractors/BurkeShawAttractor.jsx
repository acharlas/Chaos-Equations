import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import { BurkeShawEquation } from "../equations/BurkeShawEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";

const BurkeShawAttractor = ({ sharedParams }) => {
  const [freeze, setFreeze] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const { a, b } = useControls({
    BurkeShaw: folder(
      {
        a: { value: 10, min: 0, max: 20, step: 0.1 },
        b: { value: 13, min: 0, max: 20, step: 0.1 },
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
    return BurkeShawEquation(x, y, z, dtLocal, { a, b });
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

export default BurkeShawAttractor;
