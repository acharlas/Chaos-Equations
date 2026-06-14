import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import { HalvorsenEquation } from "../equations/HalvorsenEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";

const HalvorsenAttractor = ({ sharedParams, position }) => {
  const [freeze, setFreeze] = useState(false);

  const { a } = useControls({
    Halvorsen: folder(
      {
        a: { value: 1.4, min: 1.0, max: 2.5, step: 0.05 },
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
    HalvorsenEquation(x, y, z, dtLocal, { a }, out);
  };

  return (
    <AttractorWrapper globalScale={globalScale} attractorId="Halvorsen" position={position}>
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

export default HalvorsenAttractor;