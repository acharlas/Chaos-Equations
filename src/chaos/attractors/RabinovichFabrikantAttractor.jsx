import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import { RabinovichFabrikantEquation } from "../equations/RabinovichFabrikantEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";

const RabinovichFabrikantAttractor = ({ sharedParams, position }) => {
  const [freeze, setFreeze] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const { alpha, gamma } = useControls({
    RabinovichFabrikant: folder(
      {
        alpha: { value: 0.14, min: 0.05, max: 0.4, step: 0.01 },
        gamma: { value: 0.10, min: 0, max: 0.2, step: 0.01 },
      },
      { collapsed: true, order: -1 }
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

  const rk4ScratchRef = useMemo(
    () => ({
      k1: new Float32Array(3),
      k2: new Float32Array(3),
      k3: new Float32Array(3),
      k4: new Float32Array(3),
    }),
    [],
  );
  const equation = (x, y, z, dtLocal, out) => {
    const k1 = rk4ScratchRef.k1;
    const k2 = rk4ScratchRef.k2;
    const k3 = rk4ScratchRef.k3;
    const k4 = rk4ScratchRef.k4;
    const params = { alpha, gamma };
    RabinovichFabrikantEquation(x, y, z, dtLocal, params, k1);
    RabinovichFabrikantEquation(
      x + k1[0] * 0.5,
      y + k1[1] * 0.5,
      z + k1[2] * 0.5,
      dtLocal,
      params,
      k2,
    );
    RabinovichFabrikantEquation(
      x + k2[0] * 0.5,
      y + k2[1] * 0.5,
      z + k2[2] * 0.5,
      dtLocal,
      params,
      k3,
    );
    RabinovichFabrikantEquation(
      x + k3[0],
      y + k3[1],
      z + k3[2],
      dtLocal,
      params,
      k4,
    );
    out[0] = (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) / 6;
    out[1] = (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) / 6;
    out[2] = (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]) / 6;
  };

  return (
    <AttractorWrapper globalScale={globalScale} attractorId="RabinovichFabrikant" position={position}>
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

export default RabinovichFabrikantAttractor;