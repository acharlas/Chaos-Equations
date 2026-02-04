import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import { SprottEquation } from "../equations/SprottEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";

const SprottAttractor = ({ sharedParams }) => {
  const [freeze, setFreeze] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const { a } = useControls({
    Sprott: folder(
      {
        a: { value: 1, min: -1.5, max: 1.5, step: 0.01 },
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
    return SprottEquation(x, y, z, dtLocal, { a });
  };

  return (
    <AttractorWrapper globalScale={globalScale} attractorId="Sprott">
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

export default SprottAttractor;