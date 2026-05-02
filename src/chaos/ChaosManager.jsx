import React, { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTrailGeometry } from "./hooks/useTrailGeometry";
import { useAutoSpeedRange } from "./hooks/useAutoSpeedRange";
import { useParticleSystem } from "./hooks/useParticleSystem";
import { computeGamma } from "./utils/colorUtils";

const NUMBER_FORMATTER = new Intl.NumberFormat(undefined);
const SPEED_RANGE_UPDATE_INTERVAL = 30;
const MAX_SPEED_SAMPLES = 2000;

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
  const maxTrailPoints = sharedParams?.maxTrailPoints ?? undefined;

  const supportsUint32Indices = useMemo(() => {
    if (!gl) return true;
    return (
      gl.capabilities?.isWebGL2 ||
      gl.extensions?.has?.("OES_element_index_uint") === true
    );
  }, [gl]);

  const {
    geometryRef,
    positionsRef,
    colorsRef,
    speedsRef,
    positionAttrRef,
    colorAttrRef,
    indexAttrRef,
    breakSegmentsRef,
    renderTrailLength,
    budgetCap,
    budgetTrailLength,
  } = useTrailGeometry(Npoints, trailLength, maxTrailPoints, supportsUint32Indices);

  const { updateRange, reset: resetSpeedRange, getCurrentRange } = useAutoSpeedRange();
  const { restart, stepAll, getPosition, getSpeed } = useParticleSystem(Npoints);

  const sphereMeshRef = useRef();
  const tempMatrix = useRef(new THREE.Matrix4());
  const globalWriteIndexRef = useRef(0);
  const speedListRef = useRef([]);
  const speedCacheRef = useRef(new Float32Array(0));
  const frameCountRef = useRef(0);
  const lastClampWarningRef = useRef("");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Npoints, restartTrigger]);

  useEffect(() => {
    if (speedCacheRef.current.length !== Npoints) {
      speedCacheRef.current = new Float32Array(Npoints);
    }
    restart(initialPositions);
  }, [Npoints, restart, initialPositions]);

  useEffect(() => {
    const speeds = speedsRef.current;
    if (speeds && speeds.length > 0) {
      speeds.fill(0);
    }
  }, [restartTrigger, renderTrailLength, Npoints, speedsRef]);

  useEffect(() => {
    globalWriteIndexRef.current = renderTrailLength > 1 ? 1 : 0;
  }, [renderTrailLength, restartTrigger, Npoints]);

  // When trail length changes, fill the new buffer with current particle positions
  // so trails don't collapse to origin
  useEffect(() => {
    const positions = positionsRef.current;
    if (!positions || positions.length === 0 || renderTrailLength <= 0) return;

    for (let p = 0; p < Npoints; p++) {
      const pos = getPosition(p);
      for (let i = 0; i < renderTrailLength; i++) {
        const base = (i * Npoints + p) * 3;
        positions[base] = pos.x;
        positions[base + 1] = pos.y;
        positions[base + 2] = pos.z;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderTrailLength, Npoints]);

  useEffect(() => {
    restart(initialPositions);
    resetSpeedRange();
  }, [restartTrigger, restart, initialPositions, resetSpeedRange]);

  useEffect(() => {
    if (!sphereMeshRef.current) return;
    sphereMeshRef.current.count = Npoints;
    sphereMeshRef.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    sphereMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [Npoints]);

  useEffect(() => {
    const colorAttr = colorAttrRef.current;
    const colors = colorsRef.current;
    if (!colorAttr || colors.length === 0) return;

    const lowCol = lowSpeedColor;
    const highCol = highSpeedColor;
    const dr = highCol.r - lowCol.r;
    const dg = highCol.g - lowCol.g;
    const db = highCol.b - lowCol.b;
    const speeds = speedsRef.current;
    const { min: rangeMin, max: rangeMax } = getCurrentRange();
    const speedRange = Math.max(1e-6, rangeMax - rangeMin);
    const gamma = computeGamma(speedContrast);

    if (speeds.length * 3 === colors.length) {
      for (let i = 0; i < speeds.length; i++) {
        const tRaw = Math.min(1, Math.max(0, (speeds[i] - rangeMin) / speedRange));
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
  }, [lowSpeedColor, highSpeedColor, renderTrailLength, Npoints, speedContrast, getCurrentRange, colorAttrRef, colorsRef, speedsRef]);

  useFrame(() => {
    if (freeze) return;
    const mesh = sphereMeshRef.current;
    const positionAttr = positionAttrRef.current;
    const colorAttr = colorAttrRef.current;
    const colors = colorsRef.current;
    const trailSpeeds = speedsRef.current;
    const indexAttr = indexAttrRef.current;
    const breakSegments = breakSegmentsRef.current;
    const speedList = speedListRef.current;
    const shouldUpdateRange =
      frameCountRef.current % SPEED_RANGE_UPDATE_INTERVAL === 0;
    frameCountRef.current += 1;
    const sampleStride = shouldUpdateRange
      ? Math.max(1, Math.floor(Npoints / MAX_SPEED_SAMPLES))
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
    let minIndexUpdate = Infinity;
    let maxIndexUpdate = -Infinity;
    speedList.length = 0;

    // Bulk step all particles
    stepAll({
      writeIndex: currentWriteIndex,
      dt,
      substeps,
      equation,
      freeze,
      trailTarget: positionsRef,
      trailLength: renderTrailLength,
    });

    // Update mesh matrices and sample speeds
    for (let i = 0; i < Npoints; i++) {
      const pos = getPosition(i);
      const speed = getSpeed(i);
      speedCacheRef.current[i] = speed;

      if (mesh) {
        tempMatrix.current.setPosition(pos.x, pos.y, pos.z);
        mesh.setMatrixAt(i, tempMatrix.current);
      }

      if (shouldUpdateRange && nextWriteIndex >= 0 && i % sampleStride === 0) {
        speedList.push(speed);
      }
      if (indexAttr && renderTrailLength > 1 && nextWriteIndex >= 0) {
        const nextBreak =
          (nextWriteIndex - 1 + renderTrailLength) % renderTrailLength;
        const prevBreak = breakSegments[i] ?? -1;
        if (prevBreak !== nextBreak) {
          const baseSegmentOffset = i * renderTrailLength * 2;
          const indexArray = indexAttr.array;
          if (prevBreak >= 0) {
            const restoreOffset = baseSegmentOffset + prevBreak * 2;
            indexArray[restoreOffset] = prevBreak * Npoints + i;
            indexArray[restoreOffset + 1] =
              ((prevBreak + 1) % renderTrailLength) * Npoints + i;
            minIndexUpdate = Math.min(minIndexUpdate, restoreOffset);
            maxIndexUpdate = Math.max(maxIndexUpdate, restoreOffset + 1);
          }
          if (nextBreak >= 0) {
            const breakOffset = baseSegmentOffset + nextBreak * 2;
            const v = nextBreak * Npoints + i;
            indexArray[breakOffset] = v;
            indexArray[breakOffset + 1] = v;
            minIndexUpdate = Math.min(minIndexUpdate, breakOffset);
            maxIndexUpdate = Math.max(maxIndexUpdate, breakOffset + 1);
          }
          breakSegments[i] = nextBreak;
        }
      }
    }
    if (nextWriteIndex >= 0) {
      globalWriteIndexRef.current = nextWriteIndex;
    }

    let { min: rangeMin, max: rangeMax } = getCurrentRange();
    if (shouldUpdateRange && speedList.length > 0) {
      const newRange = updateRange(speedList);
      if (newRange) {
        rangeMin = newRange.min;
        rangeMax = newRange.max;
      }
    }
    if (!Number.isFinite(rangeMin) || !Number.isFinite(rangeMax)) {
      rangeMin = 0;
      rangeMax = 1;
      resetSpeedRange();
    }

    const speedRange = Math.max(1e-6, rangeMax - rangeMin);
    const gamma = computeGamma(speedContrast);
    let minColorUpdate = Infinity;
    let maxColorUpdate = -Infinity;
    let minPositionUpdate = Infinity;
    let maxPositionUpdate = -Infinity;

    if (renderTrailLength > 0) {
      const lastIndex =
        nextWriteIndex === 0 ? renderTrailLength - 1 : nextWriteIndex - 1;
      for (let i = 0; i < Npoints; i++) {
        const pointIndex = lastIndex * Npoints + i;
        const offset = pointIndex * 3;
        const speed = speedCacheRef.current[i];
        if (pointIndex < trailSpeeds.length) {
          trailSpeeds[pointIndex] = speed;
        }
        if (colorAttr && colors.length > 0) {
          const tRaw = Math.min(1, Math.max(0, (speed - rangeMin) / speedRange));
          const t = gamma === 1 ? tRaw : Math.pow(tRaw, gamma);
          colors[offset] = lowCol.r + dr * t;
          colors[offset + 1] = lowCol.g + dg * t;
          colors[offset + 2] = lowCol.b + db * t;
          minColorUpdate = Math.min(minColorUpdate, offset);
          maxColorUpdate = Math.max(maxColorUpdate, offset + 2);
        }
        minPositionUpdate = Math.min(minPositionUpdate, offset);
        maxPositionUpdate = Math.max(maxPositionUpdate, offset + 2);
      }
    }

    if (mesh) {
      mesh.instanceMatrix.needsUpdate = true;
    }
    if (positionAttr && isFinite(minPositionUpdate)) {
      if (!positionAttr.updateRange) {
        positionAttr.updateRange = { offset: 0, count: -1 };
      }
      positionAttr.updateRange.offset = minPositionUpdate;
      positionAttr.updateRange.count =
        maxPositionUpdate - minPositionUpdate + 1;
      positionAttr.needsUpdate = true;
    }
    if (indexAttr && isFinite(minIndexUpdate)) {
      if (!indexAttr.updateRange) {
        indexAttr.updateRange = { offset: 0, count: -1 };
      }
      indexAttr.updateRange.offset = minIndexUpdate;
      indexAttr.updateRange.count = maxIndexUpdate - minIndexUpdate + 1;
      indexAttr.needsUpdate = true;
    }
    if (colorAttr && isFinite(minColorUpdate)) {
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
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshBasicMaterial
          color={highSpeedColor}
          transparent={true}
          opacity={1}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
      <lineSegments geometry={geometryRef.current} frustumCulled={false}>
        <lineBasicMaterial vertexColors={true} linewidth={2} />
      </lineSegments>
    </>
  );
};

export default ChaosManager;
