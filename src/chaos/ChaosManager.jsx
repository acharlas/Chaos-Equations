import React, { useMemo } from "react";
import Particle from "./Particle";

const ChaosManager = ({
  Npoints,
  trailLength,
  dt,
  equation,
  lowSpeedColor,
  highSpeedColor,
  freeze,
  restartTrigger,
}) => {
  const initialPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < Npoints; i++) {
      positions.push([
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
      ]);
    }
    return positions;
  }, [Npoints]);

  return (
    <>
      {initialPositions.map((pos, idx) => (
        <Particle
          key={idx}
          initialPosition={pos}
          dt={dt}
          trailLength={trailLength}
          equation={equation}
          lowSpeedColor={lowSpeedColor}
          highSpeedColor={highSpeedColor}
          freeze={freeze}
          restartTrigger={restartTrigger}
        />
      ))}
    </>
  );
};

export default ChaosManager;
