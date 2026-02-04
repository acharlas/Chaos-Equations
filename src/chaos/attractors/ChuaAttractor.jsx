import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import { ChuaEquation } from "../equations/ChuaEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";

const ChuaAttractor = ({ sharedParams }) => {
  const [freeze, setFreeze] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const { aParam, bParam, kParam, pParam, qParam, rParam } = useControls({
    Chua: folder(
      {
        aParam: { value: 0.1, min: 0, max: 1, step: 0.01, label: "a" },
        bParam: { value: -0.48, min: -2, max: 0, step: 0.01, label: "b" },
        kParam: { value: 1, min: 0, max: 2, step: 0.01, label: "k" },
        pParam: { value: -1.3, min: -3, max: 0, step: 0.01, label: "p" },
        qParam: { value: -0.0136, min: -0.1, max: 0, step: 0.0001, label: "q" },
        rParam: { value: -0.0297, min: -0.1, max: 0, step: 0.0001, label: "r" },
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

  const a = aParam;
  const b = bParam;
  const k = kParam;
  const p = pParam;
  const q = qParam;
  const r = rParam;


  const lowSpeedColor = useMemo(
    () => new THREE.Color(lowSpeedHex),
    [lowSpeedHex]
  );
  const highSpeedColor = useMemo(
    () => new THREE.Color(highSpeedHex),
    [highSpeedHex]
  );

  const equation = (x, y, z, dtLocal) => {
    return ChuaEquation(x, y, z, dtLocal, { a, b, k, p, q, r });
  };

  return (
    <AttractorWrapper globalScale={globalScale} attractorId="Chua">
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

export default ChuaAttractor;
