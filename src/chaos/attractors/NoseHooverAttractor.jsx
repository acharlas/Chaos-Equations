import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import { NoseHooverEquation } from "../equations/NoseHooverEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";

const NoseHooverAttractor = ({ sharedParams }) => {
  const [freeze, setFreeze] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const { a } = useControls({
    NoseHoover: folder(
      {
        a: { value: 1.5, min: 0.5, max: 3, step: 0.01 },
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
    return NoseHooverEquation(x, y, z, dtLocal, { a });
  };

  return (
    <AttractorWrapper globalScale={globalScale} attractorId="NoseHoover">
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

export default NoseHooverAttractor;