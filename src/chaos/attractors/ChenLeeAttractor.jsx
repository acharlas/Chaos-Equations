import React, { useState, useMemo } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import AttractorWrapper from "./AttractorWrapper";
import { ChenLeeEquation } from "../equations/ChenLeeEquation";
import * as THREE from "three";

const ChenLeeAttractor = ({ sharedParams, position }) => {
  const [freeze, setFreeze] = useState(false);

  const params = useControls({
    ChenLee: folder(
      {
        a: { value: 0.9, min: 0, max: 5, step: 0.1 },
        b: { value: -3, min: -10, max: 0, step: 0.1 },
        c: { value: -0.38, min: -1, max: 1, step: 0.01 },
      },
      { collapsed: true, order: -1 }
    ),
    freeze: button(() => setFreeze((prev) => !prev)),
  });
  const { lowSpeedHex, highSpeedHex, globalScale } = sharedParams;


  const { a, b, c } = params;

  // Convert color hex to THREE.Color
  const lowSpeedColor = useMemo(
    () => new THREE.Color(lowSpeedHex),
    [lowSpeedHex]
  );
  const highSpeedColor = useMemo(
    () => new THREE.Color(highSpeedHex),
    [highSpeedHex]
  );

  const equation = (x, y, z, dtLocal, out) => {
    ChenLeeEquation(x, y, z, dtLocal, { a, b, c }, out);
  };

  return (
    <AttractorWrapper globalScale={globalScale} attractorId="ChenLee" position={position}>
      <ChaosManager
        equation={equation}
        sharedParams={sharedParams}
        lowSpeedColor={lowSpeedColor}
        highSpeedColor={highSpeedColor}
        freeze={freeze}
      />
    </AttractorWrapper>
  );
};

export default ChenLeeAttractor;