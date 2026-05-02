import React, { useMemo, useState } from "react";
import { folder, useControls, button } from "leva";
import * as THREE from "three";
import ChaosManager from "../ChaosManager";
import AttractorWrapper from "./AttractorWrapper";

const GenericAttractor = ({ config, sharedParams }) => {
  const [freeze, setFreeze] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const params = useControls({
    [config.label]: folder(config.params, { order: -1 }),
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

  const equation = useMemo(
    () => config.createEquation(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params]
  );

  const groupPosition = config.groupPosition
    ? config.groupPosition(params)
    : null;

  const chaosManager = (
    <ChaosManager
      equation={equation}
      sharedParams={sharedParams}
      lowSpeedColor={lowSpeedColor}
      highSpeedColor={highSpeedColor}
      freeze={freeze}
      restartTrigger={restartTrigger}
    />
  );

  return (
    <AttractorWrapper globalScale={globalScale} attractorId={config.id}>
      {groupPosition ? (
        <group position={groupPosition}>{chaosManager}</group>
      ) : (
        chaosManager
      )}
    </AttractorWrapper>
  );
};

export default GenericAttractor;
