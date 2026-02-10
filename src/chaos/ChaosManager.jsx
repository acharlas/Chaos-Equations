import React, { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import ParticleState from "./ParticleState";

const NUMBER_FORMATTER = new Intl.NumberFormat(undefined);
const AUTO_SPEED_LOW_PERCENTILE = 10;
const AUTO_SPEED_HIGH_PERCENTILE = 90;
const AUTO_SPEED_SMOOTHING = 0.15;
// Performance policy: update speed range every N frames and sample up to M particles.
const SPEED_RANGE_UPDATE_INTERVAL = 10;
const MAX_SPEED_SAMPLES = 2000;
const DEFAULT_MAX_TRAIL_POINTS = 300000; // Performance budget: Npoints * trailLength.
const computePercentileRange = (values) => {
  if (!values || values.length === 0) return null;
  values.sort((a, b) => a - b);
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
  const last = values.length - 1;
  const lowIndex = Math.max(0, Math.floor(last * lowPct));
  const highIndex = Math.max(0, Math.floor(last * highPct));
  return { min: values[lowIndex], max: values[highIndex] };
};

const ChaosManager = ({
  sharedParams,
  equation,
  lowSpeedColor,
  highSpeedColor,
  freeze,
  restartTrigger,
}) => {
  const { gl } = useThree();
  if (!sharedParams) {
    throw new Error("ChaosManager requires sharedParams.");
  }
  const Npoints = sharedParams?.Npoints ?? 0;
  const trailLength = sharedParams?.trailLength ?? 0;
  const dt = sharedParams?.dt ?? 0.005;
  const substeps = sharedParams?.substeps ?? 1;
  const speedContrast = sharedParams?.speedContrast ?? 0.5;
  const maxTrailPoints = sharedParams?.maxTrailPoints ?? DEFAULT_MAX_TRAIL_POINTS;
  const particleRefs = useRef([]);
  const sphereMeshRef = useRef();
  const tempMatrix = useRef(new THREE.Matrix4());
  const trailsGeometryRef = useRef(new THREE.BufferGeometry());
  const trailPositionsRef = useRef(new Float32Array(0));
  const trailColorsRef = useRef(new Float32Array(0));
  const trailSpeedsRef = useRef(new Float32Array(0));
  const trailPositionAttrRef = useRef(null);
  const trailColorAttrRef = useRef(null);
  const trailIndexAttrRef = useRef(null);
  const breakSegmentsRef = useRef([]);
  const globalWriteIndexRef = useRef(0);
  const speedSamplesRef = useRef(new Float32Array(0));
  const speedListRef = useRef([]);
  const frameCountRef = useRef(0);
  const autoSpeedMinRef = useRef(0);
  const autoSpeedMaxRef = useRef(1);
  const autoRangeInitializedRef = useRef(false);
  const lastClampWarningRef = useRef("");
  const supportsUint32Indices = useMemo(() => {
    if (!gl) return true;
    return (
      gl.capabilities?.isWebGL2 ||
      gl.extensions?.has?.("OES_element_index_uint") === true
    );
  }, [gl]);

  const budgetCap = useMemo(() => {
    const maxByBudget = Math.floor(maxTrailPoints / Math.max(1, Npoints));
    return Math.max(1, maxByBudget);
  }, [maxTrailPoints, Npoints]);

  const budgetTrailLength = useMemo(
    () => Math.min(trailLength, budgetCap),
    [trailLength, budgetCap]
  );

  const renderTrailLength = useMemo(() => {
    if (supportsUint32Indices) return budgetTrailLength;
    const maxTrail = Math.floor(65535 / Math.max(Npoints, 1));
    return Math.max(1, Math.min(budgetTrailLength, maxTrail));
  }, [supportsUint32Indices, budgetTrailLength, Npoints]);

  useEffect(() => {
    if (renderTrailLength === trailLength) {
      lastClampWarningRef.current = "";
      return;
    }
    if (lastClampWarningRef.current === "clamped") return;
    lastClampWarningRef.current = "clamped";
    const requestedPoints = trailLength * Math.max(1, Npoints);
    const clampReasons = [];
    if (budgetCap < trailLength) {
      clampReasons.push("performance budget");
    }
    if (!supportsUint32Indices && renderTrailLength < budgetTrailLength) {
      clampReasons.push("WebGL index limit");
    }
    const clampReasonText =
      clampReasons.length > 0 ? ` (${clampReasons.join(", ")})` : "";
    const budgetInfo =
      budgetCap < trailLength
        ? `, budget cap ${NUMBER_FORMATTER.format(budgetCap)} (requested ${NUMBER_FORMATTER.format(requestedPoints)})`
        : "";
    console.warn(
      `Trail length clamped to ${renderTrailLength} (requested ${trailLength}${budgetInfo})${clampReasonText}.`
    );
  }, [
    budgetCap,
    budgetTrailLength,
    Npoints,
    renderTrailLength,
    supportsUint32Indices,
    trailLength,
  ]);

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
    autoRangeInitializedRef.current = false;
  }, [Npoints]);

  useEffect(() => {
    const speeds = trailSpeedsRef.current;
    if (speeds && speeds.length > 0) {
      speeds.fill(0);
    }
  }, [restartTrigger, renderTrailLength, Npoints]);

  useEffect(() => {
    globalWriteIndexRef.current = renderTrailLength > 1 ? 1 : 0;
    // reset global write index when trail length changes or restarts
  }, [renderTrailLength, restartTrigger, Npoints]);

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
    const speeds = new Float32Array(totalPoints);

    trailPositionsRef.current = positions;
    trailColorsRef.current = colors;
    trailSpeedsRef.current = speeds;

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
        for (let i = 0; i < renderTrailLength; i++) {
          const a = i * Npoints + p;
          const b = ((i + 1) % renderTrailLength) * Npoints + p;
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
    const highCol = highSpeedColor;
    const dr = highCol.r - lowCol.r;
    const dg = highCol.g - lowCol.g;
    const db = highCol.b - lowCol.b;
    const speeds = trailSpeedsRef.current;
    let rangeMin = autoRangeInitializedRef.current ? autoSpeedMinRef.current : 0;
    let rangeMax = autoRangeInitializedRef.current ? autoSpeedMaxRef.current : 1;
    if (!Number.isFinite(rangeMin) || !Number.isFinite(rangeMax)) {
      rangeMin = 0;
      rangeMax = 1;
    }
    if (!autoRangeInitializedRef.current && speeds.length > 0) {
      const validSpeeds = [];
      for (let i = 0; i < speeds.length; i++) {
        const s = speeds[i];
        if (Number.isFinite(s)) validSpeeds.push(s);
      }
      const range = computePercentileRange(validSpeeds);
      if (range) {
        rangeMin = range.min;
        rangeMax = range.max;
      }
    }
    const speedRange = Math.max(1e-6, rangeMax - rangeMin);
    const gamma = Math.max(
      1e-3,
      Math.pow(2, (Math.min(1, Math.max(0, speedContrast)) - 0.5) * 4)
    );

    if (speeds.length * 3 === colors.length) {
      for (let i = 0; i < speeds.length; i++) {
        const tRaw = Math.min(
          1,
          Math.max(0, (speeds[i] - rangeMin) / speedRange)
        );
        const t = gamma === 1 ? tRaw : Math.pow(tRaw, gamma);
        const offset = i * 3;
        colors[offset] = lowCol.r + dr * t;
        colors[offset + 1] = lowCol.g + dg * t;
        colors[offset + 2] = lowCol.b + db * t;
      }
    } else {
      for (let i = 0; i < colors.length; i += 3) {
        colors[i] = lowCol.r;
        colors[i + 1] = lowCol.g;
        colors[i + 2] = lowCol.b;
      }
    }

    colorAttr.needsUpdate = true;
  }, [lowSpeedColor, highSpeedColor, renderTrailLength, Npoints, speedContrast]);

  useFrame(() => {
    if (freeze) return;
    const refs = particleRefs.current;
    const mesh = sphereMeshRef.current;
    const positionAttr = trailPositionAttrRef.current;
    const colorAttr = trailColorAttrRef.current;
    const colors = trailColorsRef.current;
    const trailSpeeds = trailSpeedsRef.current;
    const indexAttr = trailIndexAttrRef.current;
    const steps = Math.max(1, substeps);
    const dtStep = dt / steps;
    const breakSegments = breakSegmentsRef.current;
    const speedSamples = speedSamplesRef.current;
    const speedList = speedListRef.current;
    const shouldUpdateRange =
      frameCountRef.current % SPEED_RANGE_UPDATE_INTERVAL === 0;
    frameCountRef.current += 1;
    const sampleStride = shouldUpdateRange
      ? Math.max(1, Math.floor(refs.length / MAX_SPEED_SAMPLES))
      : 0;
    const lowCol = lowSpeedColor;
    const highCol = highSpeedColor;
    const dr = highCol.r - lowCol.r;
    const dg = highCol.g - lowCol.g;
    const db = highCol.b - lowCol.b;
    const currentWriteIndex =
      renderTrailLength > 0 ? globalWriteIndexRef.current : -1;
    const nextWriteIndex =
      renderTrailLength > 0
        ? (currentWriteIndex + 1) % renderTrailLength
        : -1;
    let minIndexUpdate = null;
    let maxIndexUpdate = null;
    speedList.length = 0;
    for (let i = 0; i < refs.length; i++) {
      const particle = refs[i];
      let position = null;
      if (particle?.step) {
        for (let s = 0; s < steps; s++) {
          position = particle.step(
            currentWriteIndex,
            s === steps - 1,
            dtStep
          );
        }
      }
      if (mesh && position) {
        tempMatrix.current.identity();
        tempMatrix.current.setPosition(position);
        mesh.setMatrixAt(i, tempMatrix.current);
      }
      let speed = 0;
      let rawSpeed = 0;
      if (particle?.getSpeed) {
        rawSpeed = particle.getSpeed();
        speed = Number.isFinite(rawSpeed) ? rawSpeed : 0;
      }
      speedSamples[i] = speed;
      if (
        shouldUpdateRange &&
        nextWriteIndex >= 0 &&
        Number.isFinite(rawSpeed) &&
        i % sampleStride === 0
      ) {
        speedList.push(rawSpeed);
      }
      if (indexAttr && renderTrailLength > 1 && nextWriteIndex >= 0) {
        const nextBreak =
          renderTrailLength > 1
            ? (nextWriteIndex - 1 + renderTrailLength) % renderTrailLength
            : -1;
        const prevBreak = breakSegments[i] ?? -1;
        if (prevBreak !== nextBreak) {
          const baseSegmentOffset = i * renderTrailLength * 2;
          const indexArray = indexAttr.array;
          if (prevBreak >= 0) {
            const restoreOffset = baseSegmentOffset + prevBreak * 2;
            indexArray[restoreOffset] = prevBreak * Npoints + i;
            indexArray[restoreOffset + 1] =
              ((prevBreak + 1) % renderTrailLength) * Npoints + i;
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
            const v = nextBreak * Npoints + i;
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
    if (nextWriteIndex >= 0) {
      globalWriteIndexRef.current = nextWriteIndex;
    }
    let rangeMin = autoRangeInitializedRef.current
      ? autoSpeedMinRef.current
      : 0;
    let rangeMax = autoRangeInitializedRef.current
      ? autoSpeedMaxRef.current
      : 1;
    if (shouldUpdateRange && speedList.length > 0) {
      const range = computePercentileRange(speedList);
      const frameMin = range?.min;
      const frameMax = range?.max;
      if (frameMin === undefined || frameMax === undefined) {
        // keep prior range
      } else {
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
    let minPositionUpdate = null;
    let maxPositionUpdate = null;
    if (renderTrailLength > 0) {
      for (let i = 0; i < refs.length; i++) {
        if (nextWriteIndex < 0) continue;
        const lastIndex =
          nextWriteIndex === 0 ? renderTrailLength - 1 : nextWriteIndex - 1;
        const pointIndex = lastIndex * Npoints + i;
        const offset = pointIndex * 3;
        const speed = speedSamples[i];
        if (pointIndex < trailSpeeds.length) {
          trailSpeeds[pointIndex] = speed;
        }
        if (colorAttr && colors.length > 0) {
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
        minPositionUpdate =
          minPositionUpdate === null
            ? offset
            : Math.min(minPositionUpdate, offset);
        maxPositionUpdate =
          maxPositionUpdate === null
            ? offset + 2
            : Math.max(maxPositionUpdate, offset + 2);
      }
    }
    if (mesh) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.computeBoundingSphere) {
        mesh.computeBoundingSphere();
      }
    }
    if (positionAttr && minPositionUpdate !== null) {
      if (!positionAttr.updateRange) {
        positionAttr.updateRange = { offset: 0, count: -1 };
      }
      positionAttr.updateRange.offset = minPositionUpdate;
      positionAttr.updateRange.count =
        maxPositionUpdate - minPositionUpdate + 1;
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
      <instancedMesh
        key={Npoints}
        ref={sphereMeshRef}
        args={[null, null, Npoints]}
      >
        <sphereGeometry args={[0.01, 16, 16]} />
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
          trailLength={renderTrailLength}
          particleIndex={idx}
          totalParticles={Npoints}
          equation={equation}
          freeze={freeze}
          restartTrigger={restartTrigger}
        />
      ))}
    </>
  );
};

export default ChaosManager;
