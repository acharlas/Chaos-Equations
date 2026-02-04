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

  const { lowSpeedHex, highSpeedHex, globalScale } = sharedParams;

  const params = {
    a: aParam,
    b: bParam,
    k: kParam,
    p: pParam,
    q: qParam,
    r: rParam,
  };



  const lowSpeedColor = useMemo(
    () => new THREE.Color(lowSpeedHex),
    [lowSpeedHex]
  );
  const highSpeedColor = useMemo(
    () => new THREE.Color(highSpeedHex),
    [highSpeedHex]
  );

  const equation = (x, y, z, dtLocal) => {
    return ChuaEquation(x, y, z, dtLocal, params);
  };

  return (
    <AttractorWrapper globalScale={globalScale} attractorId="Chua">
      <ChaosManager
        equation={equation}
        sharedParams={sharedParams}
        lowSpeedColor={lowSpeedColor}
        highSpeedColor={highSpeedColor}
        freeze={freeze}
        restartTrigger={restartTrigger}
      />
    </AttractorWrapper>
  );
};

export default ChuaAttractor;