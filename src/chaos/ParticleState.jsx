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
  trailOffset = 0,
  equation,
  freeze = false,
  restartTrigger,
}, ref) => {
  const positionRef = useRef(new THREE.Vector3());
  const wRef = useRef(0);
  const speedRef = useRef(0);
  const writeIndexRef = useRef(0);
  const dtRef = useRef(dt);
  const equationRef = useRef(equation);
  const freezeRef = useRef(freeze);
  const trailLengthRef = useRef(trailLength);
  const trailTargetRef = useRef(trailTarget);
  const trailOffsetRef = useRef(trailOffset);

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
  }, [trailLength]);

  useEffect(() => {
    trailTargetRef.current = trailTarget;
  }, [trailTarget]);

  useEffect(() => {
    trailOffsetRef.current = trailOffset;
  }, [trailOffset]);

  // (Re)initialize buffer when the trail length changes.
  useEffect(() => {
    const pos = positionRef.current;
    if (trailLength > 0) {
      writeIndexRef.current = trailLength > 1 ? 1 : 0;
    } else {
      writeIndexRef.current = 0;
    }

    const targetRef = trailTargetRef.current;
    const target = targetRef?.current ?? targetRef;
    const offset = trailOffsetRef.current;
    if (target && trailLength > 0) {
      const size = trailLength * 3;
      for (let i = 0; i < size; i += 3) {
        target[offset + i] = pos.x;
        target[offset + i + 1] = pos.y;
        target[offset + i + 2] = pos.z;
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

    if (trailLength > 0) {
      writeIndexRef.current = trailLength > 1 ? 1 : 0;
    } else {
      writeIndexRef.current = 0;
    }

    const targetRef = trailTargetRef.current;
    const target = targetRef?.current ?? targetRef;
    const offset = trailOffsetRef.current;
    if (target && trailLength > 0) {
      const size = trailLength * 3;
      for (let i = 0; i < size; i += 3) {
        target[offset + i] = initialPosition[0];
        target[offset + i + 1] = initialPosition[1];
        target[offset + i + 2] = initialPosition[2];
      }
    }
  }, [restartTrigger, initialPosition, trailLength]);

  const step = useCallback((writeTrail = true, dtOverride) => {
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
      const writeIndex = writeIndexRef.current;
      const writeOffset = writeIndex * 3;
      writeIndexRef.current = (writeIndex + 1) % currentTrailLength;

      const targetRef = trailTargetRef.current;
      const target = targetRef?.current ?? targetRef;
      if (target) {
        const baseOffset = trailOffsetRef.current + writeOffset;
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
      getWriteIndex: () => writeIndexRef.current,
      getSpeed: () => speedRef.current,
    }),
    [step]
  );

  return null;
});

ParticleState.displayName = "ParticleState";

export default ParticleState;
