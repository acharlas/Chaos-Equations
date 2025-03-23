import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Helper to ensure we have a THREE.Color from the provided value.
const toTHREEColor = (col) => {
  return col instanceof THREE.Color ? col : new THREE.Color(col);
};

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
  // Store the trail as an array of positions (each is [x, y, z])
  const trail = useRef([initialPosition]);

  // Pre-allocate buffers for positions and colors.
  const positionsBuffer = useRef(new Float32Array(trailLength * 3));
  const colorsBuffer = useRef(new Float32Array(trailLength * 3));

  // Create a BufferGeometry for the trail line.
  const geometryRef = useRef(new THREE.BufferGeometry());
  
  // On restart, reset the particle's position and trail.
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...initialPosition);
      trail.current = [initialPosition];
      positionsBuffer.current = new Float32Array(trailLength * 3);
      colorsBuffer.current = new Float32Array(trailLength * 3);
      geometryRef.current.setAttribute(
        "position",
        new THREE.BufferAttribute(positionsBuffer.current, 3)
      );
      geometryRef.current.setAttribute(
        "color",
        new THREE.BufferAttribute(colorsBuffer.current, 3)
      );
      geometryRef.current.setDrawRange(0, 0);
    }
  }, [restartTrigger, initialPosition, trailLength]);

  useFrame(() => {
    if (freeze) return;
    const pos = meshRef.current.position;
    const [dx, dy, dz] = equation(pos.x, pos.y, pos.z, dt);
    const newPos = [pos.x + dx, pos.y + dy, pos.z + dz];
    meshRef.current.position.set(...newPos);

    // Append new position; keep trail length fixed.
    trail.current.push(newPos);
    if (trail.current.length > trailLength) {
      trail.current.shift();
    }
    const n = trail.current.length;
    geometryRef.current.setDrawRange(0, n);

    // Update positions buffer in place.
    for (let i = 0; i < n; i++) {
      positionsBuffer.current[i * 3] = trail.current[i][0];
      positionsBuffer.current[i * 3 + 1] = trail.current[i][1];
      positionsBuffer.current[i * 3 + 2] = trail.current[i][2];
    }
    geometryRef.current.attributes.position.needsUpdate = true;

    // Ensure colors are THREE.Color objects.
    const lowCol = toTHREEColor(lowSpeedColor);
    const highCol = toTHREEColor(highSpeedColor);

    // Compute color for each point.
    for (let i = 0; i < n; i++) {
      // Calculate t based on the index (oldest=0, tip=1).
      const t = n > 1 ? i / (n - 1) : 0;
      // For a speed-based gradient, you could compute t based on speed,
      // but here we use an index-based gradient. You can mix in speed if desired.
      const col = lowCol.clone().lerp(highCol, t);
      colorsBuffer.current[i * 3] = col.r;
      colorsBuffer.current[i * 3 + 1] = col.g;
      colorsBuffer.current[i * 3 + 2] = col.b;
    }
    geometryRef.current.attributes.color.needsUpdate = true;
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
