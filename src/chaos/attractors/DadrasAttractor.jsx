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
        a: { value: 3, min: 1, max: 5, step: 0.1 },
        b: { value: 2.7, min: 1, max: 4, step: 0.1 },
        c: { value: 1.7, min: 1, max: 3, step: 0.1 },
        d: { value: 2, min: 1, max: 3, step: 0.1 },
        e: { value: 9, min: 5, max: 12, step: 0.1 },
      },
      { order: -1 }
    ),
    freeze: button(() => setFreeze((prev) => !prev)),
    restart: button(() => setRestartTrigger((prev) => prev + 1)),
  });

  const { lowSpeedHex, highSpeedHex, globalScale } = sharedParams;


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
    <AttractorWrapper globalScale={globalScale} attractorId="Dadras">
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

export default DadrasAttractor;