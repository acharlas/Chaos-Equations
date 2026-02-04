import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import { RabinovichFabrikantEquation } from "../equations/RabinovichFabrikantEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";

const RabinovichFabrikantAttractor = ({ sharedParams }) => {
  const [freeze, setFreeze] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const { alpha, gamma } = useControls({
    RabinovichFabrikant: folder(
      {
        alpha: { value: 0.14, min: 0.05, max: 0.4, step: 0.01 },
        gamma: { value: 0.10, min: 0, max: 0.2, step: 0.01 },
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

  const localScale = 1;

  const lowSpeedColor = useMemo(
    () => new THREE.Color(lowSpeedHex),
    [lowSpeedHex]
  );
  const highSpeedColor = useMemo(
    () => new THREE.Color(highSpeedHex),
    [highSpeedHex]
  );

  const equation = (x, y, z, dtLocal) => {
    const k1 = RabinovichFabrikantEquation(x, y, z, dtLocal, { alpha, gamma });
    const k2 = RabinovichFabrikantEquation(
      x + k1[0] * 0.5,
      y + k1[1] * 0.5,
      z + k1[2] * 0.5,
      dtLocal,
      { alpha, gamma }
    );
    const k3 = RabinovichFabrikantEquation(
      x + k2[0] * 0.5,
      y + k2[1] * 0.5,
      z + k2[2] * 0.5,
      dtLocal,
      { alpha, gamma }
    );
    const k4 = RabinovichFabrikantEquation(
      x + k3[0],
      y + k3[1],
      z + k3[2],
      dtLocal,
      { alpha, gamma }
    );

    return [
      (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) / 6,
      (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) / 6,
      (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]) / 6,
    ];
  };

  return (
    <AttractorWrapper globalScale={globalScale} localScale={localScale}>
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

export default RabinovichFabrikantAttractor;