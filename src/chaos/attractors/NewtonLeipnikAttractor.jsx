import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import { NewtonLeipnikEquation } from "../equations/NewtonLeipnikEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";

const NewtonLeipnikAttractor = ({ sharedParams }) => {
  const [freeze, setFreeze] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const { a, b } = useControls({
    NewtonLeipnik: folder(
      {
        a: { value: 0.4, min: 0, max: 1, step: 0.01 },
        b: { value: 0.175, min: 0, max: 0.5, step: 0.001 },
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
    return NewtonLeipnikEquation(x, y, z, dtLocal, { a, b });
  };

  return (
    <AttractorWrapper globalScale={globalScale} attractorId="NewtonLeipnik">
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

export default NewtonLeipnikAttractor;