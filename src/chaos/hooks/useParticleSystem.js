import { useRef, useCallback } from "react";
import { ParticleSystem } from "../ParticleSystem";

export const useParticleSystem = (Npoints) => {
  const systemRef = useRef(null);

  if (!systemRef.current || systemRef.current.Npoints !== Npoints) {
    systemRef.current = new ParticleSystem(Npoints);
  }

  const restart = useCallback((initialPositions) => {
    systemRef.current.restart(initialPositions);
  }, []);

  const stepAll = useCallback((params) => {
    systemRef.current.stepAll(params);
  }, []);

  const getPosition = useCallback((p) => systemRef.current.getPosition(p), []);
  const getSpeed = useCallback((p) => systemRef.current.getSpeed(p), []);

  return {
    systemRef,
    restart,
    stepAll,
    getPosition,
    getSpeed,
  };
};
