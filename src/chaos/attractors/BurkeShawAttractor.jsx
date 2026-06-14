import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import { BurkeShawEquation } from "../equations/BurkeShawEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";

const BurkeShawAttractor = ({ sharedParams, position }) => {
  const [freeze, setFreeze] = useState(false);

  const { a, b } = useControls({
    BurkeShaw: folder(
      {
        a: { value: 10, min: 5, max: 18, step: 0.1 },
        b: { value: 13, min: 5, max: 18, step: 0.1 },
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
    BurkeShawEquation(x, y, z, dtLocal, { a, b }, out);
  };

  return (
    <AttractorWrapper globalScale={globalScale} attractorId="BurkeShaw" position={position}>
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

export default BurkeShawAttractor;