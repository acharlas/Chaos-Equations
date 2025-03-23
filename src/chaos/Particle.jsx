import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Particle = ({
  initialPosition,
  dt,
  trailLength,
  lowSpeedColor,
  highSpeedColor,
  equation,
  sphereSize = 0.1,
  freeze = false,
  restartTrigger,
}) => {
  const meshRef = useRef();
  const [trail, setTrail] = useState([initialPosition]);

  // When restartTrigger changes, reset particle position and trail.
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...initialPosition);
      setTrail([initialPosition]);
    }
  }, [restartTrigger, initialPosition]);

  useFrame(() => {
    if (freeze) return; // Skip updates if frozen.
    const pos = meshRef.current.position;
    const [dx, dy, dz] = equation(pos.x, pos.y, pos.z, dt);
    const newPos = [pos.x + dx, pos.y + dy, pos.z + dz];
    meshRef.current.position.set(...newPos);
    setTrail((prev) => {
      const newTrail = [...prev, newPos];
      return newTrail.length > trailLength
        ? newTrail.slice(newTrail.length - trailLength)
        : newTrail;
    });
  });

  // Compute a smooth gradient based on the index (oldest=lowSpeedColor, tip=highSpeedColor).
  const n = trail.length;
  const trailColors = [];
  for (let i = 0; i < n; i++) {
    let t = n > 1 ? i / (n - 1) : 0;
    const col = lowSpeedColor.clone().lerp(highSpeedColor, t);
    trailColors.push(col);
  }

  // CustomLine renders the trail as a line with vertex colors.
  const CustomLine = ({ points, colors }) => {
    const lineRef = useRef();
    useFrame(() => {
      if (lineRef.current) {
        const positions = new Float32Array(points.flat());
        lineRef.current.geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3)
        );
        const colorArray = new Float32Array(
          colors.flatMap((c) => [c.r, c.g, c.b])
        );
        lineRef.current.geometry.setAttribute(
          "color",
          new THREE.BufferAttribute(colorArray, 3)
        );
        lineRef.current.geometry.attributes.position.needsUpdate = true;
        lineRef.current.geometry.attributes.color.needsUpdate = true;
      }
    });
    return (
      <line ref={lineRef}>
        <bufferGeometry />
        <lineBasicMaterial vertexColors={true} linewidth={2} />
      </line>
    );
  };

  return (
    <>
      <mesh ref={meshRef} position={initialPosition}>
        <sphereGeometry args={[sphereSize, 16, 16]} />
        <meshBasicMaterial
          color="white"
          transparent={true}
          opacity={1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {trail.length >= 2 && <CustomLine points={trail} colors={trailColors} />}
    </>
  );
};

export default Particle;
