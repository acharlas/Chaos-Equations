import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import { BoualiEquation } from "../equations/BoualiEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";

const BoualiAttractor = ({ sharedParams, position }) => {
  const [freeze, setFreeze] = useState(false);

  const { a, b, c } = useControls({
    Bouali: folder(
      {
        a: { value: 0.3, min: 0, max: 0.8, step: 0.01 },
        b: { value: 1, min: 0, max: 2, step: 0.01 },
        c: { value: 1, min: 0, max: 2, step: 0.01 },
      },
      { collapsed: true, order: -1 }
    ),
    freeze: button(() => setFreeze((prev) => !prev)),
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

  const equation = (x, y, z, dtLocal, out) => {
    BoualiEquation(x, y, z, dtLocal, { a, b, c }, out);
  };

  return (
    <AttractorWrapper globalScale={globalScale} attractorId="Bouali" position={position}>
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

export default BoualiAttractor;