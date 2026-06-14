import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import ChaosManager from "../ChaosManager";
import { ArneodoEquation } from "../equations/ArneodoEquation";
import AttractorWrapper from "./AttractorWrapper";
import * as THREE from "three";

const ArneodoAttractor = ({ sharedParams, position }) => {
  const [freeze, setFreeze] = useState(false);

  const { a, b, c } = useControls({
    Arneodo: folder(
      {
        a: { value: 5.5, min: 0, max: 7, step: 0.1 },
        b: { value: 3.5, min: 0, max: 7, step: 0.1 },
        c: { value: 1, min: 0, max: 3, step: 0.1 },
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
    ArneodoEquation(x, y, z, dtLocal, { a, b, c }, out);
  };

  return (
    <AttractorWrapper globalScale={globalScale} attractorId="Arneodo" position={position}>
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

export default ArneodoAttractor;