import React, {
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as THREE from "three";

const Particle = forwardRef(({
  initialPosition,
  dt,
  trailLength,
  equation,
  lowSpeedColor,
  highSpeedColor,
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

  // Pre-allocate buffers for positions and colors.
  const positionsBuffer = useRef(new Float32Array(trailLength * 3));
  const colorsBuffer = useRef(new Float32Array(trailLength * 3));
  const positionAttributeRef = useRef(null);
  const colorAttributeRef = useRef(null);

  // Create a BufferGeometry for the trail line.
  const geometryRef = useRef(new THREE.BufferGeometry());
  const lowColorRef = useRef(new THREE.Color());
  const highColorRef = useRef(new THREE.Color());

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

  // (Re)initialize buffers when the trail length changes.
  useEffect(() => {
    const size = trailLength * 3;
    trailBuffer.current = new Float32Array(size);
    positionsBuffer.current = new Float32Array(size);
    colorsBuffer.current = new Float32Array(size);

    const positionAttribute = new THREE.BufferAttribute(
      positionsBuffer.current,
      3
    );
    positionAttribute.setUsage(THREE.DynamicDrawUsage);
    geometryRef.current.setAttribute("position", positionAttribute);
    positionAttributeRef.current = positionAttribute;

    const colorAttribute = new THREE.BufferAttribute(colorsBuffer.current, 3);
    colorAttribute.setUsage(THREE.DynamicDrawUsage);
    geometryRef.current.setAttribute("color", colorAttribute);
    colorAttributeRef.current = colorAttribute;
    geometryRef.current.setDrawRange(0, 0);

    // Reset ring state.
    writeIndexRef.current = 0;
    countRef.current = 0;
  }, [trailLength]);

  // Precompute gradient colors when colors or trail length change.
  useEffect(() => {
    if (trailLength <= 0) return;
    const colorAttribute = colorAttributeRef.current;
    if (!colorAttribute) return;

    lowColorRef.current.set(lowSpeedColor);
    highColorRef.current.set(highSpeedColor);

    const lowCol = lowColorRef.current;
    const highCol = highColorRef.current;
    const dr = highCol.r - lowCol.r;
    const dg = highCol.g - lowCol.g;
    const db = highCol.b - lowCol.b;

    for (let i = 0; i < trailLength; i++) {
      const t = trailLength > 1 ? i / (trailLength - 1) : 0;
      const offset = i * 3;
      colorsBuffer.current[offset] = lowCol.r + dr * t;
      colorsBuffer.current[offset + 1] = lowCol.g + dg * t;
      colorsBuffer.current[offset + 2] = lowCol.b + db * t;
    }

    colorAttribute.needsUpdate = true;
  }, [lowSpeedColor, highSpeedColor, trailLength]);

  // On restart, reset the particle's position and trail.
  useEffect(() => {
    positionRef.current.set(
      initialPosition[0],
      initialPosition[1],
      initialPosition[2]
    );

    // Seed the trail with the initial position.
    trailBuffer.current.fill(0);
    positionsBuffer.current.fill(0);
    trailBuffer.current[0] = initialPosition[0];
    trailBuffer.current[1] = initialPosition[1];
    trailBuffer.current[2] = initialPosition[2];

    writeIndexRef.current = trailLength > 1 ? 1 : 0;
    countRef.current = 1;
    geometryRef.current.setDrawRange(0, 0);
  }, [restartTrigger, initialPosition, trailLength]);

  const step = useCallback(() => {
    if (freezeRef.current) return positionRef.current;
    const currentTrailLength = trailLengthRef.current;
    if (currentTrailLength <= 0) return;
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

    // Render in oldest -> newest order into contiguous buffers.
    const startIndex =
      nextCount === currentTrailLength ? writeIndexRef.current : 0;
    geometryRef.current.setDrawRange(0, nextCount);

    const positionAttribute = positionAttributeRef.current;
    if (!positionAttribute) return;

    const positions = positionsBuffer.current;
    const trail = trailBuffer.current;
    const totalComponents = nextCount * 3;

    if (nextCount === currentTrailLength && startIndex !== 0) {
      const firstCount = currentTrailLength - startIndex;
      const firstComponents = firstCount * 3;
      positions.set(
        trail.subarray(startIndex * 3, currentTrailLength * 3),
        0
      );
      positions.set(trail.subarray(0, startIndex * 3), firstComponents);
    } else {
      positions.set(trail.subarray(0, totalComponents), 0);
    }

    if (!positionAttribute.updateRange) {
      positionAttribute.updateRange = { offset: 0, count: -1 };
    }
    positionAttribute.updateRange.offset = 0;
    positionAttribute.updateRange.count = nextCount * 3;
    positionAttribute.needsUpdate = true;
    return pos;
  }, []);

  useImperativeHandle(ref, () => ({
    step,
    getPosition: () => positionRef.current,
  }), [step]);

  return (
    <>
      <line geometry={geometryRef.current}>
        <lineBasicMaterial vertexColors={true} linewidth={2} />
      </line>
    </>
  );
});

Particle.displayName = "Particle";

export default Particle;
