import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Particle = ({
  initialPosition,
  dt,
  trailLength,
  equation,
  lowSpeedColor,
  highSpeedColor,
  sphereSize = 0.05,
  freeze = false,
  restartTrigger,
}) => {
  const meshRef = useRef();
  // Fixed-size ring buffer for trail positions.
  const trailBuffer = useRef(new Float32Array(trailLength * 3));
  const writeIndexRef = useRef(0);
  const countRef = useRef(0);

  // Pre-allocate buffers for positions and colors.
  const positionsBuffer = useRef(new Float32Array(trailLength * 3));
  const colorsBuffer = useRef(new Float32Array(trailLength * 3));

  // Create a BufferGeometry for the trail line.
  const geometryRef = useRef(new THREE.BufferGeometry());
  const lowColorRef = useRef(new THREE.Color());
  const highColorRef = useRef(new THREE.Color());

  useEffect(() => {
    lowColorRef.current.set(lowSpeedColor);
  }, [lowSpeedColor]);

  useEffect(() => {
    highColorRef.current.set(highSpeedColor);
  }, [highSpeedColor]);

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

    const colorAttribute = new THREE.BufferAttribute(colorsBuffer.current, 3);
    colorAttribute.setUsage(THREE.DynamicDrawUsage);
    geometryRef.current.setAttribute("color", colorAttribute);
    geometryRef.current.setDrawRange(0, 0);

    // Reset ring state.
    writeIndexRef.current = 0;
    countRef.current = 0;
  }, [trailLength]);

  // On restart, reset the particle's position and trail.
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...initialPosition);

      // Seed the trail with the initial position.
      trailBuffer.current.fill(0);
      positionsBuffer.current.fill(0);
      colorsBuffer.current.fill(0);
      trailBuffer.current[0] = initialPosition[0];
      trailBuffer.current[1] = initialPosition[1];
      trailBuffer.current[2] = initialPosition[2];

      writeIndexRef.current = trailLength > 1 ? 1 : 0;
      countRef.current = 1;
      geometryRef.current.setDrawRange(0, 0);
    }
  }, [restartTrigger, initialPosition, trailLength]);

  useFrame(() => {
    if (freeze) return;
    if (!meshRef.current) return;
    if (trailLength <= 0) return;
    const pos = meshRef.current.position;
    const [dx, dy, dz] = equation(pos.x, pos.y, pos.z, dt);
    const newX = pos.x + dx;
    const newY = pos.y + dy;
    const newZ = pos.z + dz;
    meshRef.current.position.set(newX, newY, newZ);

    // Write into ring buffer.
    const writeIndex = writeIndexRef.current;
    const writeOffset = writeIndex * 3;
    trailBuffer.current[writeOffset] = newX;
    trailBuffer.current[writeOffset + 1] = newY;
    trailBuffer.current[writeOffset + 2] = newZ;

    writeIndexRef.current = (writeIndex + 1) % trailLength;
    const nextCount = Math.min(countRef.current + 1, trailLength);
    countRef.current = nextCount;

    // Render in oldest -> newest order into contiguous buffers.
    const startIndex = nextCount === trailLength ? writeIndexRef.current : 0;
    geometryRef.current.setDrawRange(0, nextCount);

    const positionAttribute = geometryRef.current.getAttribute("position");
    const colorAttribute = geometryRef.current.getAttribute("color");
    if (!positionAttribute || !colorAttribute) return;

    const lowCol = lowColorRef.current;
    const highCol = highColorRef.current;
    const dr = highCol.r - lowCol.r;
    const dg = highCol.g - lowCol.g;
    const db = highCol.b - lowCol.b;

    for (let i = 0; i < nextCount; i++) {
      const srcIndex = (startIndex + i) % trailLength;
      const srcOffset = srcIndex * 3;
      const dstOffset = i * 3;

      positionsBuffer.current[dstOffset] = trailBuffer.current[srcOffset];
      positionsBuffer.current[dstOffset + 1] =
        trailBuffer.current[srcOffset + 1];
      positionsBuffer.current[dstOffset + 2] =
        trailBuffer.current[srcOffset + 2];

      const t = nextCount > 1 ? i / (nextCount - 1) : 0;
      colorsBuffer.current[dstOffset] = lowCol.r + dr * t;
      colorsBuffer.current[dstOffset + 1] = lowCol.g + dg * t;
      colorsBuffer.current[dstOffset + 2] = lowCol.b + db * t;
    }

    if (!positionAttribute.updateRange) {
      positionAttribute.updateRange = { offset: 0, count: -1 };
    }
    positionAttribute.updateRange.offset = 0;
    positionAttribute.updateRange.count = nextCount * 3;
    positionAttribute.needsUpdate = true;
    if (!colorAttribute.updateRange) {
      colorAttribute.updateRange = { offset: 0, count: -1 };
    }
    colorAttribute.updateRange.offset = 0;
    colorAttribute.updateRange.count = nextCount * 3;
    colorAttribute.needsUpdate = true;
  });

  return (
    <>
      <mesh ref={meshRef} position={initialPosition}>
        <sphereGeometry args={[sphereSize, 16, 16]} />
        <meshBasicMaterial
          color={highSpeedColor}
          transparent={true}
          opacity={1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <line geometry={geometryRef.current}>
        <lineBasicMaterial vertexColors={true} linewidth={2} />
      </line>
    </>
  );
};

export default Particle;
