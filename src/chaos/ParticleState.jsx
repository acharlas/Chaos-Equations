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
  equation,
  freeze = false,
  restartTrigger,
}, ref) => {
  const positionRef = useRef(new THREE.Vector3());
  // Fixed-size ring buffer for trail positions.
  const trailBuffer = useRef(new Float32Array(trailLength * 3));
  const writeIndexRef = useRef(0);
  const countRef = useRef(0);
  const dtRef = useRef(dt);
  const equationRef = useRef(equation);
  const freezeRef = useRef(freeze);
  const trailLengthRef = useRef(trailLength);

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

  // (Re)initialize buffer when the trail length changes.
  useEffect(() => {
    const size = trailLength * 3;
    trailBuffer.current = new Float32Array(size);

    const pos = positionRef.current;
    if (trailLength > 0) {
      trailBuffer.current[0] = pos.x;
      trailBuffer.current[1] = pos.y;
      trailBuffer.current[2] = pos.z;
      writeIndexRef.current = trailLength > 1 ? 1 : 0;
      countRef.current = 1;
    } else {
      writeIndexRef.current = 0;
      countRef.current = 0;
    }
  }, [trailLength]);

  // On restart, reset the particle's position and trail.
  useEffect(() => {
    positionRef.current.set(
      initialPosition[0],
      initialPosition[1],
      initialPosition[2]
    );

    const buffer = trailBuffer.current;
    buffer.fill(0);
    if (trailLength > 0) {
      buffer[0] = initialPosition[0];
      buffer[1] = initialPosition[1];
      buffer[2] = initialPosition[2];
      writeIndexRef.current = trailLength > 1 ? 1 : 0;
      countRef.current = 1;
    } else {
      writeIndexRef.current = 0;
      countRef.current = 0;
    }
  }, [restartTrigger, initialPosition, trailLength]);

  const step = useCallback(() => {
    if (freezeRef.current) return positionRef.current;
    const currentTrailLength = trailLengthRef.current;
    if (currentTrailLength <= 0) return positionRef.current;
    const pos = positionRef.current;
    const [dx, dy, dz] = equationRef.current(
      pos.x,
      pos.y,
      pos.z,
      dtRef.current
    );
    const newX = pos.x + dx;
    const newY = pos.y + dy;
    const newZ = pos.z + dz;
    pos.set(newX, newY, newZ);

    // Write into ring buffer.
    const writeIndex = writeIndexRef.current;
    const writeOffset = writeIndex * 3;
    trailBuffer.current[writeOffset] = newX;
    trailBuffer.current[writeOffset + 1] = newY;
    trailBuffer.current[writeOffset + 2] = newZ;

    writeIndexRef.current = (writeIndex + 1) % currentTrailLength;
    const nextCount = Math.min(countRef.current + 1, currentTrailLength);
    countRef.current = nextCount;

    return pos;
  }, []);

  const copyTrailTo = useCallback((targetArray, targetOffset) => {
    const currentTrailLength = trailLengthRef.current;
    if (currentTrailLength <= 0) return;
    const count = countRef.current;
    if (count <= 0) return;

    const startIndex =
      count === currentTrailLength ? writeIndexRef.current : 0;
    const trail = trailBuffer.current;

    if (count === currentTrailLength && startIndex !== 0) {
      const firstCount = currentTrailLength - startIndex;
      const firstComponents = firstCount * 3;
      targetArray.set(
        trail.subarray(startIndex * 3, currentTrailLength * 3),
        targetOffset
      );
      targetArray.set(
        trail.subarray(0, startIndex * 3),
        targetOffset + firstComponents
      );
      return;
    }

    const countComponents = count * 3;
    targetArray.set(trail.subarray(0, countComponents), targetOffset);

    if (count < currentTrailLength) {
      const lastOffset = (count - 1) * 3;
      const lastX = trail[lastOffset];
      const lastY = trail[lastOffset + 1];
      const lastZ = trail[lastOffset + 2];
      let dst = targetOffset + countComponents;
      const end = targetOffset + currentTrailLength * 3;
      for (; dst < end; dst += 3) {
        targetArray[dst] = lastX;
        targetArray[dst + 1] = lastY;
        targetArray[dst + 2] = lastZ;
      }
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      step,
      getPosition: () => positionRef.current,
      copyTrailTo,
    }),
    [step, copyTrailTo]
  );

  return null;
});

ParticleState.displayName = "ParticleState";

export default ParticleState;
