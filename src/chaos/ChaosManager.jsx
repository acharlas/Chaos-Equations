import React, { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
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
  const sphereMeshRef = useRef();
  const tempMatrix = useRef(new THREE.Matrix4());
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

  useEffect(() => {
    if (!sphereMeshRef.current) return;
    sphereMeshRef.current.count = Npoints;
    sphereMeshRef.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    sphereMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [Npoints]);

  useFrame(() => {
    const refs = particleRefs.current;
    const mesh = sphereMeshRef.current;
    for (let i = 0; i < refs.length; i++) {
      const position = refs[i]?.step?.();
      if (!mesh || !position) continue;
      tempMatrix.current.identity();
      tempMatrix.current.setPosition(position);
      mesh.setMatrixAt(i, tempMatrix.current);
    }
    if (mesh) {
      mesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh
        key={Npoints}
        ref={sphereMeshRef}
        args={[null, null, Npoints]}
      >
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial
          color={highSpeedColor}
          transparent={true}
          opacity={1}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
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
