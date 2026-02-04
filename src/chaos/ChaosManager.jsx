import React, { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import ParticleState from "./ParticleState";

const AUTO_SPEED_LOW_PERCENTILE = 10;
const AUTO_SPEED_HIGH_PERCENTILE = 90;
const AUTO_SPEED_SMOOTHING = 0.15;

const ChaosManager = ({
  Npoints,
  trailLength,
  dt,
  substeps = 1,
  equation,
  lowSpeedColor,
  highSpeedColor,
  speedContrast = 0.5,
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
  const speedSamplesRef = useRef(new Float32Array(0));
  const writeIndexSamplesRef = useRef(new Int32Array(0));
  const speedListRef = useRef([]);
  const autoSpeedMinRef = useRef(0);
  const autoSpeedMaxRef = useRef(1);
  const autoRangeInitializedRef = useRef(false);
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
    speedSamplesRef.current = new Float32Array(Npoints);
    writeIndexSamplesRef.current = new Int32Array(Npoints).fill(-1);
    autoRangeInitializedRef.current = false;
  }, [Npoints]);

  useEffect(() => {
    autoRangeInitializedRef.current = false;
  }, [restartTrigger]);

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

    const segmentCount =
      renderTrailLength > 1 ? renderTrailLength * Npoints : 0;
    if (segmentCount > 0) {
      const IndexArrayType =
        totalPoints <= 65535 ? Uint16Array : Uint32Array;
      const indexArray = new IndexArrayType(segmentCount * 2);
      let index = 0;
      for (let p = 0; p < Npoints; p++) {
        const base = p * renderTrailLength;
        for (let i = 0; i < renderTrailLength; i++) {
          const a = base + i;
          const b = base + ((i + 1) % renderTrailLength);
          indexArray[index++] = a;
          indexArray[index++] = b;
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
    for (let i = 0; i < colors.length; i += 3) {
      colors[i] = lowCol.r;
      colors[i + 1] = lowCol.g;
      colors[i + 2] = lowCol.b;
    }

    colorAttr.needsUpdate = true;
  }, [lowSpeedColor, highSpeedColor, renderTrailLength, Npoints]);

  useFrame(() => {
    if (freeze) return;
    const refs = particleRefs.current;
    const mesh = sphereMeshRef.current;
    const positionAttr = trailPositionAttrRef.current;
    const colorAttr = trailColorAttrRef.current;
    const colors = trailColorsRef.current;
    const indexAttr = trailIndexAttrRef.current;
    const steps = Math.max(1, substeps);
    const dtStep = dt / steps;
    const breakSegments = breakSegmentsRef.current;
    const speedSamples = speedSamplesRef.current;
    const writeIndexSamples = writeIndexSamplesRef.current;
    const speedList = speedListRef.current;
    const lowCol = lowSpeedColor;
    const highCol = highSpeedColor;
    const dr = highCol.r - lowCol.r;
    const dg = highCol.g - lowCol.g;
    const db = highCol.b - lowCol.b;
    let minIndexUpdate = null;
    let maxIndexUpdate = null;
    speedList.length = 0;
    for (let i = 0; i < refs.length; i++) {
      const particle = refs[i];
      let position = null;
      if (particle?.step) {
        for (let s = 0; s < steps; s++) {
          position = particle.step(s === steps - 1, dtStep);
        }
      }
      if (mesh && position) {
        tempMatrix.current.identity();
        tempMatrix.current.setPosition(position);
        mesh.setMatrixAt(i, tempMatrix.current);
      }
      const writeIndex = particle?.getWriteIndex ? particle.getWriteIndex() : -1;
      writeIndexSamples[i] = writeIndex ?? -1;
      let speed = 0;
      let rawSpeed = 0;
      if (particle?.getSpeed) {
        rawSpeed = particle.getSpeed();
        speed = Number.isFinite(rawSpeed) ? rawSpeed : 0;
      }
      speedSamples[i] = speed;
      if (writeIndex !== null && writeIndex >= 0 && Number.isFinite(rawSpeed)) {
        speedList.push(rawSpeed);
      }
      if (indexAttr && renderTrailLength > 1 && writeIndex !== null && writeIndex >= 0) {
        const nextBreak =
          renderTrailLength > 1
            ? (writeIndex - 1 + renderTrailLength) % renderTrailLength
            : -1;
        const prevBreak = breakSegments[i] ?? -1;
        if (prevBreak !== nextBreak) {
          const baseVertex = i * renderTrailLength;
          const baseSegmentOffset = i * renderTrailLength * 2;
          const indexArray = indexAttr.array;
          if (prevBreak >= 0) {
            const restoreOffset = baseSegmentOffset + prevBreak * 2;
            indexArray[restoreOffset] = baseVertex + prevBreak;
            indexArray[restoreOffset + 1] =
              baseVertex + ((prevBreak + 1) % renderTrailLength);
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
    let rangeMin = autoRangeInitializedRef.current
      ? autoSpeedMinRef.current
      : 0;
    let rangeMax = autoRangeInitializedRef.current
      ? autoSpeedMaxRef.current
      : 1;
    if (speedList.length > 0) {
      speedList.sort((a, b) => a - b);
      const clampedLow = Math.min(
        AUTO_SPEED_LOW_PERCENTILE,
        AUTO_SPEED_HIGH_PERCENTILE - 1
      );
      const clampedHigh = Math.max(
        AUTO_SPEED_HIGH_PERCENTILE,
        AUTO_SPEED_LOW_PERCENTILE + 1
      );
      const lowPct = Math.max(0, Math.min(100, clampedLow)) / 100;
      const highPct = Math.max(0, Math.min(100, clampedHigh)) / 100;
      const last = speedList.length - 1;
      const lowIndex = Math.max(0, Math.floor(last * lowPct));
      const highIndex = Math.max(0, Math.floor(last * highPct));
      const frameMin = speedList[lowIndex];
      const frameMax = speedList[highIndex];
      const alpha = Math.min(1, Math.max(0, AUTO_SPEED_SMOOTHING));
      if (!autoRangeInitializedRef.current) {
        autoSpeedMinRef.current = frameMin;
        autoSpeedMaxRef.current = frameMax;
        autoRangeInitializedRef.current = true;
      } else {
        autoSpeedMinRef.current += (frameMin - autoSpeedMinRef.current) * alpha;
        autoSpeedMaxRef.current += (frameMax - autoSpeedMaxRef.current) * alpha;
      }
      if (autoSpeedMaxRef.current <= autoSpeedMinRef.current + 1e-6) {
        autoSpeedMaxRef.current = autoSpeedMinRef.current + 1e-6;
      }
      rangeMin = autoSpeedMinRef.current;
      rangeMax = autoSpeedMaxRef.current;
    }
    if (!Number.isFinite(rangeMin) || !Number.isFinite(rangeMax)) {
      rangeMin = 0;
      rangeMax = 1;
      autoRangeInitializedRef.current = false;
    }
    const speedRange = Math.max(1e-6, rangeMax - rangeMin);
    const gamma = Math.max(
      1e-3,
      Math.pow(2, (Math.min(1, Math.max(0, speedContrast)) - 0.5) * 4)
    );
    let minColorUpdate = null;
    let maxColorUpdate = null;
    if (colorAttr && colors.length > 0 && renderTrailLength > 0) {
      for (let i = 0; i < refs.length; i++) {
        const writeIndex = writeIndexSamples[i];
        if (writeIndex < 0) continue;
        const lastIndex =
          writeIndex === 0 ? renderTrailLength - 1 : writeIndex - 1;
        const offset = (i * renderTrailLength + lastIndex) * 3;
        const speed = speedSamples[i];
        const tRaw = Math.min(
          1,
          Math.max(0, (speed - rangeMin) / speedRange)
        );
        const t = gamma === 1 ? tRaw : Math.pow(tRaw, gamma);
        colors[offset] = lowCol.r + dr * t;
        colors[offset + 1] = lowCol.g + dg * t;
        colors[offset + 2] = lowCol.b + db * t;
        minColorUpdate =
          minColorUpdate === null
            ? offset
            : Math.min(minColorUpdate, offset);
        maxColorUpdate =
          maxColorUpdate === null
            ? offset + 2
            : Math.max(maxColorUpdate, offset + 2);
      }
    }
    if (mesh) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.computeBoundingSphere) {
        mesh.computeBoundingSphere();
      }
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
    if (colorAttr && minColorUpdate !== null) {
      if (!colorAttr.updateRange) {
        colorAttr.updateRange = { offset: 0, count: -1 };
      }
      colorAttr.updateRange.offset = minColorUpdate;
      colorAttr.updateRange.count = maxColorUpdate - minColorUpdate + 1;
      colorAttr.needsUpdate = true;
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
      <lineSegments geometry={trailsGeometryRef.current} frustumCulled={false}>
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
