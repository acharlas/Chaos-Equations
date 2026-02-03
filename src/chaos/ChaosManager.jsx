import React, { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import ParticleState from "./ParticleState";

const ChaosManager = ({
  Npoints,
  trailLength,
  dt,
  substeps = 1,
  equation,
  lowSpeedColor,
  highSpeedColor,
  freeze,
  restartTrigger,
}) => {
  const { gl } = useThree();
  const particleRefs = useRef([]);
  const sphereMeshRef = useRef();
  const tempMatrix = useRef(new THREE.Matrix4());
  const trailsGeometryRef = useRef(new THREE.BufferGeometry());
  const trailPositionsRef = useRef(new Float32Array(0));
  const trailColorsRef = useRef(new Float32Array(0));
  const trailPositionAttrRef = useRef(null);
  const trailColorAttrRef = useRef(null);
  const trailIndexAttrRef = useRef(null);
  const breakSegmentsRef = useRef([]);
  const supportsUint32Indices = useMemo(() => {
    if (!gl) return true;
    return (
      gl.capabilities?.isWebGL2 ||
      gl.extensions?.has?.("OES_element_index_uint") === true
    );
  }, [gl]);

  const renderTrailLength = useMemo(() => {
    if (supportsUint32Indices) return trailLength;
    const maxTrail = Math.floor(65535 / Math.max(Npoints, 1));
    return Math.max(1, Math.min(trailLength, maxTrail));
  }, [supportsUint32Indices, trailLength, Npoints]);

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
    breakSegmentsRef.current = new Array(Npoints).fill(-1);
  }, [Npoints]);

  useEffect(() => {
    if (!sphereMeshRef.current) return;
    sphereMeshRef.current.count = Npoints;
    sphereMeshRef.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    sphereMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [Npoints]);

  useEffect(() => {
    const previousGeometry = trailsGeometryRef.current;
    const previousPositionAttr = trailPositionAttrRef.current;
    const previousColorAttr = trailColorAttrRef.current;
    const previousIndex = previousGeometry.getIndex?.();

    const totalPoints = Npoints * renderTrailLength;
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

    const segmentCount = Math.max(renderTrailLength - 1, 0) * Npoints;
    if (segmentCount > 0) {
      const IndexArrayType =
        totalPoints <= 65535 ? Uint16Array : Uint32Array;
      const indexArray = new IndexArrayType(segmentCount * 2);
      let index = 0;
      for (let p = 0; p < Npoints; p++) {
        const base = p * renderTrailLength;
        for (let i = 0; i < renderTrailLength - 1; i++) {
          indexArray[index++] = base + i;
          indexArray[index++] = base + i + 1;
        }
      }
      const indexAttr = new THREE.BufferAttribute(indexArray, 1);
      trailsGeometryRef.current.setIndex(indexAttr);
      trailIndexAttrRef.current = indexAttr;
      trailsGeometryRef.current.setDrawRange(0, indexArray.length);
    } else {
      trailsGeometryRef.current.setIndex(null);
      trailIndexAttrRef.current = null;
      trailsGeometryRef.current.setDrawRange(0, 0);
    }

    breakSegmentsRef.current = new Array(Npoints).fill(-1);

    if (previousIndex && previousIndex !== trailsGeometryRef.current.getIndex()) {
      previousIndex.dispose?.();
    }
    if (previousPositionAttr && previousPositionAttr !== positionAttr) {
      previousPositionAttr.dispose?.();
    }
    if (previousColorAttr && previousColorAttr !== colorAttr) {
      previousColorAttr.dispose?.();
    }
  }, [Npoints, renderTrailLength]);

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
      const base = p * renderTrailLength;
      for (let i = 0; i < renderTrailLength; i++) {
        const t = renderTrailLength > 1 ? i / (renderTrailLength - 1) : 0;
        const offset = (base + i) * 3;
        colors[offset] = lowCol.r + dr * t;
        colors[offset + 1] = lowCol.g + dg * t;
        colors[offset + 2] = lowCol.b + db * t;
      }
    }

    colorAttr.needsUpdate = true;
  }, [lowSpeedColor, highSpeedColor, renderTrailLength, Npoints]);

  useFrame(() => {
    if (freeze) return;
    const refs = particleRefs.current;
    const mesh = sphereMeshRef.current;
    const positionAttr = trailPositionAttrRef.current;
    const indexAttr = trailIndexAttrRef.current;
    const steps = Math.max(1, substeps);
    const breakSegments = breakSegmentsRef.current;
    let minIndexUpdate = null;
    let maxIndexUpdate = null;
    for (let i = 0; i < refs.length; i++) {
      const particle = refs[i];
      let position = null;
      if (particle?.step) {
        for (let s = 0; s < steps; s++) {
          position = particle.step(s === steps - 1);
        }
      }
      if (mesh && position) {
        tempMatrix.current.identity();
        tempMatrix.current.setPosition(position);
        mesh.setMatrixAt(i, tempMatrix.current);
      }
      if (indexAttr && renderTrailLength > 1 && particle?.getWriteIndex) {
        const writeIndex = particle.getWriteIndex();
        const nextBreak = writeIndex === 0 ? -1 : writeIndex - 1;
        const prevBreak = breakSegments[i] ?? -1;
        if (prevBreak !== nextBreak) {
          const baseVertex = i * renderTrailLength;
          const baseSegmentOffset = i * (renderTrailLength - 1) * 2;
          const indexArray = indexAttr.array;
          if (prevBreak >= 0) {
            const restoreOffset = baseSegmentOffset + prevBreak * 2;
            indexArray[restoreOffset] = baseVertex + prevBreak;
            indexArray[restoreOffset + 1] = baseVertex + prevBreak + 1;
            minIndexUpdate =
              minIndexUpdate === null
                ? restoreOffset
                : Math.min(minIndexUpdate, restoreOffset);
            maxIndexUpdate =
              maxIndexUpdate === null
                ? restoreOffset + 1
                : Math.max(maxIndexUpdate, restoreOffset + 1);
          }
          if (nextBreak >= 0) {
            const breakOffset = baseSegmentOffset + nextBreak * 2;
            const v = baseVertex + nextBreak;
            indexArray[breakOffset] = v;
            indexArray[breakOffset + 1] = v;
            minIndexUpdate =
              minIndexUpdate === null
                ? breakOffset
                : Math.min(minIndexUpdate, breakOffset);
            maxIndexUpdate =
              maxIndexUpdate === null
                ? breakOffset + 1
                : Math.max(maxIndexUpdate, breakOffset + 1);
          }
          breakSegments[i] = nextBreak;
        }
      }
    }
    if (mesh) {
      mesh.instanceMatrix.needsUpdate = true;
    }
    if (positionAttr) {
      positionAttr.needsUpdate = true;
    }
    if (indexAttr && minIndexUpdate !== null) {
      if (!indexAttr.updateRange) {
        indexAttr.updateRange = { offset: 0, count: -1 };
      }
      indexAttr.updateRange.offset = minIndexUpdate;
      indexAttr.updateRange.count = maxIndexUpdate - minIndexUpdate + 1;
      indexAttr.needsUpdate = true;
    }
  });

  return (
    <>
      {renderTrailLength !== trailLength && (
        <Html fullscreen>
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              padding: "6px 10px",
              background: "rgba(0, 0, 0, 0.6)",
              color: "#fff",
              fontFamily: "monospace",
              fontSize: 12,
              borderRadius: 6,
              pointerEvents: "none",
            }}
          >
            Trail length clamped to {renderTrailLength} (requested {trailLength})
          </div>
        </Html>
      )}
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
        <ParticleState
          key={idx}
          ref={(ref) => {
            particleRefs.current[idx] = ref;
          }}
          initialPosition={pos}
          dt={dt}
          trailTarget={trailPositionsRef}
          trailOffset={idx * renderTrailLength * 3}
          trailLength={renderTrailLength}
          equation={equation}
          freeze={freeze}
          restartTrigger={restartTrigger}
        />
      ))}
    </>
  );
};

export default ChaosManager;
