import React, { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
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
  const particleRefs = useRef([]);
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

  useEffect(() => {
    particleRefs.current = particleRefs.current.slice(0, Npoints);
  }, [Npoints]);

  useFrame(() => {
    if (freeze) return;
    const refs = particleRefs.current;
    for (let i = 0; i < refs.length; i++) {
      refs[i]?.step?.();
    }
  });

  return (
    <>
      {initialPositions.map((pos, idx) => (
        <Particle
          key={idx}
          ref={(ref) => {
            particleRefs.current[idx] = ref;
          }}
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
