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
  const trailsGeometryRef = useRef(new THREE.BufferGeometry());
  const trailPositionsRef = useRef(new Float32Array(0));
  const trailColorsRef = useRef(new Float32Array(0));
  const trailPositionAttrRef = useRef(null);
  const trailColorAttrRef = useRef(null);
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

  useEffect(() => {
    const totalPoints = Npoints * trailLength;
    const positions = new Float32Array(totalPoints * 3);
    const colors = new Float32Array(totalPoints * 3);

    trailPositionsRef.current = positions;
    trailColorsRef.current = colors;

    const positionAttr = new THREE.BufferAttribute(positions, 3);
    positionAttr.setUsage(THREE.DynamicDrawUsage);
    trailsGeometryRef.current.setAttribute("position", positionAttr);
    trailPositionAttrRef.current = positionAttr;

    const colorAttr = new THREE.BufferAttribute(colors, 3);
    colorAttr.setUsage(THREE.DynamicDrawUsage);
    trailsGeometryRef.current.setAttribute("color", colorAttr);
    trailColorAttrRef.current = colorAttr;

    const segmentCount = Math.max(trailLength - 1, 0) * Npoints;
    if (segmentCount > 0) {
      const indexArray = new Uint32Array(segmentCount * 2);
      let index = 0;
      for (let p = 0; p < Npoints; p++) {
        const base = p * trailLength;
        for (let i = 0; i < trailLength - 1; i++) {
          indexArray[index++] = base + i;
          indexArray[index++] = base + i + 1;
        }
      }
      trailsGeometryRef.current.setIndex(
        new THREE.BufferAttribute(indexArray, 1)
      );
      trailsGeometryRef.current.setDrawRange(0, indexArray.length);
    } else {
      trailsGeometryRef.current.setIndex(null);
      trailsGeometryRef.current.setDrawRange(0, 0);
    }
  }, [Npoints, trailLength]);

  useEffect(() => {
    const colorAttr = trailColorAttrRef.current;
    const colors = trailColorsRef.current;
    if (!colorAttr || colors.length === 0) return;

    const lowCol = lowSpeedColor;
    const highCol = highSpeedColor;
    const dr = highCol.r - lowCol.r;
    const dg = highCol.g - lowCol.g;
    const db = highCol.b - lowCol.b;

    for (let p = 0; p < Npoints; p++) {
      const base = p * trailLength;
      for (let i = 0; i < trailLength; i++) {
        const t = trailLength > 1 ? i / (trailLength - 1) : 0;
        const offset = (base + i) * 3;
        colors[offset] = lowCol.r + dr * t;
        colors[offset + 1] = lowCol.g + dg * t;
        colors[offset + 2] = lowCol.b + db * t;
      }
    }

    colorAttr.needsUpdate = true;
  }, [lowSpeedColor, highSpeedColor, trailLength, Npoints]);

  useFrame(() => {
    const refs = particleRefs.current;
    const mesh = sphereMeshRef.current;
    const positions = trailPositionsRef.current;
    const positionAttr = trailPositionAttrRef.current;
    for (let i = 0; i < refs.length; i++) {
      const particle = refs[i];
      const position = particle?.step?.();
      if (mesh && position) {
        tempMatrix.current.identity();
        tempMatrix.current.setPosition(position);
        mesh.setMatrixAt(i, tempMatrix.current);
      }
      if (positions.length > 0) {
        particle?.copyTrailTo?.(positions, i * trailLength * 3);
      }
    }
    if (mesh) {
      mesh.instanceMatrix.needsUpdate = true;
    }
    if (positionAttr) {
      positionAttr.needsUpdate = true;
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
      <lineSegments geometry={trailsGeometryRef.current}>
        <lineBasicMaterial vertexColors={true} linewidth={2} />
      </lineSegments>
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
          freeze={freeze}
          restartTrigger={restartTrigger}
        />
      ))}
    </>
  );
};

export default ChaosManager;
