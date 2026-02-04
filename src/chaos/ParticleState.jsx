import React, {
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as THREE from "three";

const ParticleState = forwardRef(({
  initialPosition,
  dt,
  trailLength,
  trailTarget,
  particleIndex = 0,
  totalParticles = 1,
  equation,
  freeze = false,
  restartTrigger,
}, ref) => {
  const positionRef = useRef(new THREE.Vector3());
  const wRef = useRef(0);
  const speedRef = useRef(0);
  const dtRef = useRef(dt);
  const equationRef = useRef(equation);
  const freezeRef = useRef(freeze);
  const trailLengthRef = useRef(trailLength);
  const trailTargetRef = useRef(trailTarget);
  const particleIndexRef = useRef(particleIndex);
  const totalParticlesRef = useRef(totalParticles);

  useEffect(() => {
    dtRef.current = dt;
  }, [dt]);

  useEffect(() => {
    equationRef.current = equation;
  }, [equation]);

  useEffect(() => {
    freezeRef.current = freeze;
  }, [freeze]);

  useEffect(() => {
    trailLengthRef.current = trailLength;
  }, [trailLength, particleIndex, totalParticles]);

  useEffect(() => {
    trailTargetRef.current = trailTarget;
  }, [trailTarget]);

  useEffect(() => {
    particleIndexRef.current = particleIndex;
  }, [particleIndex]);

  useEffect(() => {
    totalParticlesRef.current = totalParticles;
  }, [totalParticles]);

  // (Re)initialize buffer when the trail length changes.
  useEffect(() => {
    const pos = positionRef.current;
    const targetRef = trailTargetRef.current;
    const target = targetRef?.current ?? targetRef;
    const particle = particleIndexRef.current;
    const total = totalParticlesRef.current;
    if (target && trailLength > 0 && total > 0) {
      for (let i = 0; i < trailLength; i++) {
        const base = (i * total + particle) * 3;
        target[base] = pos.x;
        target[base + 1] = pos.y;
        target[base + 2] = pos.z;
      }
    }
  }, [trailLength]);

  // On restart, reset the particle's position and trail.
  useEffect(() => {
    positionRef.current.set(
      initialPosition[0],
      initialPosition[1],
      initialPosition[2]
    );
    wRef.current = 0;

    const targetRef = trailTargetRef.current;
    const target = targetRef?.current ?? targetRef;
    const particle = particleIndexRef.current;
    const total = totalParticlesRef.current;
    if (target && trailLength > 0 && total > 0) {
      for (let i = 0; i < trailLength; i++) {
        const base = (i * total + particle) * 3;
        target[base] = initialPosition[0];
        target[base + 1] = initialPosition[1];
        target[base + 2] = initialPosition[2];
      }
    }
  }, [restartTrigger, initialPosition, trailLength, particleIndex, totalParticles]);

  const step = useCallback((writeIndex, writeTrail = true, dtOverride) => {
    if (freezeRef.current) return positionRef.current;
    const currentTrailLength = trailLengthRef.current;
    if (currentTrailLength <= 0) return positionRef.current;
    const pos = positionRef.current;
    const dtLocal =
      typeof dtOverride === "number" ? dtOverride : dtRef.current;
    const [dx, dy, dz, dw] = equationRef.current(
      pos.x,
      pos.y,
      pos.z,
      dtLocal,
      wRef.current
    );
    // dx/dy/dz are deltas (already multiplied by dt), so divide by dt for speed.
    speedRef.current =
      dtLocal !== 0 ? Math.hypot(dx, dy, dz) / dtLocal : 0;
    const newX = pos.x + dx;
    const newY = pos.y + dy;
    const newZ = pos.z + dz;
    pos.set(newX, newY, newZ);
    if (typeof dw === "number") {
      wRef.current += dw;
    }

    if (writeTrail) {
      const targetRef = trailTargetRef.current;
      const target = targetRef?.current ?? targetRef;
      const particle = particleIndexRef.current;
      const total = totalParticlesRef.current;
      if (target && total > 0 && typeof writeIndex === "number") {
        const safeIndex =
          writeIndex < 0
            ? 0
            : writeIndex % Math.max(1, currentTrailLength);
        const baseOffset = (safeIndex * total + particle) * 3;
        target[baseOffset] = newX;
        target[baseOffset + 1] = newY;
        target[baseOffset + 2] = newZ;
      }
    }

    return pos;
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      step,
      getPosition: () => positionRef.current,
      getSpeed: () => speedRef.current,
    }),
    [step]
  );

  return null;
});

ParticleState.displayName = "ParticleState";

export default ParticleState;
