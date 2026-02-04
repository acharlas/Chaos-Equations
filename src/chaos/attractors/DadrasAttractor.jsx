import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import { DadrasEquation } from "../equations/DadrasEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";

const DadrasAttractor = ({ sharedParams }) => {
  const [freeze, setFreeze] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const { a, b, c, d, e } = useControls({
    Dadras: folder(
      {
        a: { value: 3, min: 0, max: 6, step: 0.1 },
        b: { value: 2.7, min: 0, max: 5, step: 0.1 },
        c: { value: 1.7, min: 0, max: 5, step: 0.1 },
        d: { value: 2, min: 0, max: 5, step: 0.1 },
        e: { value: 9, min: 0, max: 15, step: 0.1 },
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
    return DadrasEquation(x, y, z, dtLocal, { a, b, c, d, e });
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

export default DadrasAttractor;
