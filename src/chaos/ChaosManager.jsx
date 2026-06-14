import React, { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { computePercentileRange } from "./autoSpeedRange.js";

const NUMBER_FORMATTER = new Intl.NumberFormat(undefined);
const AUTO_SPEED_SMOOTHING = 0.15;
const SPEED_RANGE_UPDATE_INTERVAL = 10;
const MAX_SPEED_SAMPLES = 2000;
const DEFAULT_MAX_TRAIL_POINTS = 300000;

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

  const sphereMeshRef = useRef();
  const tempMatrix = useRef(new THREE.Matrix4());
  const trailsGeometryRef = useRef(new THREE.BufferGeometry());
  const trailPositionsRef = useRef(new Float32Array(0));
  const trailColorsRef = useRef(new Float32Array(0));
  const trailSpeedsRef = useRef(new Float32Array(0));
  const trailPositionAttrRef = useRef(null);
  const trailColorAttrRef = useRef(null);
  const trailIndexAttrRef = useRef(null);
  const globalWriteIndexRef = useRef(0);
  const speedListRef = useRef([]);
  const frameCountRef = useRef(0);
  const autoSpeedMinRef = useRef(0);
  const autoSpeedMaxRef = useRef(1);
  const autoRangeInitializedRef = useRef(false);
  const lastClampWarningRef = useRef("");
  const eqOutRef = useRef(new Float32Array(3));
  const gammaRef = useRef(1);
  const drRef = useRef(0);
  const dgRef = useRef(0);
  const dbRef = useRef(0);
  const equationRef = useRef(equation);

  const posXRef = useRef(new Float32Array(0));
  const posYRef = useRef(new Float32Array(0));
  const posZRef = useRef(new Float32Array(0));
  const speedRef = useRef(new Float32Array(0));
  const initPosXRef = useRef(new Float32Array(0));
  const initPosYRef = useRef(new Float32Array(0));
  const initPosZRef = useRef(new Float32Array(0));

  useEffect(() => {
    equationRef.current = equation;
  }, [equation]);

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
    [trailLength, budgetCap],
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
      `Trail length clamped to ${renderTrailLength} (requested ${trailLength}${budgetInfo})${clampReasonText}.`,
    );
  }, [
    budgetCap,
    budgetTrailLength,
    Npoints,
    renderTrailLength,
    supportsUint32Indices,
    trailLength,
  ]);

  useEffect(() => {
    const N = Npoints;
    const posX = new Float32Array(N);
    const posY = new Float32Array(N);
    const posZ = new Float32Array(N);
    const initX = new Float32Array(N);
    const initY = new Float32Array(N);
    const initZ = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;
      const z = Math.random() * 2 - 1;
      posX[i] = x;
      posY[i] = y;
      posZ[i] = z;
      initX[i] = x;
      initY[i] = y;
      initZ[i] = z;
    }
    posXRef.current = posX;
    posYRef.current = posY;
    posZRef.current = posZ;
    initPosXRef.current = initX;
    initPosYRef.current = initY;
    initPosZRef.current = initZ;
    speedRef.current = new Float32Array(N);
    autoRangeInitializedRef.current = false;
  }, [Npoints]);

  useEffect(() => {
    const N = posXRef.current.length;
    if (N === 0) return;
    const ix = initPosXRef.current;
    const iy = initPosYRef.current;
    const iz = initPosZRef.current;
    const cx = posXRef.current;
    const cy = posYRef.current;
    const cz = posZRef.current;
    for (let i = 0; i < N; i++) {
      cx[i] = ix[i];
      cy[i] = iy[i];
      cz[i] = iz[i];
    }
    const speeds = trailSpeedsRef.current;
    if (speeds && speeds.length > 0) speeds.fill(0);
    autoRangeInitializedRef.current = false;
  }, [restartTrigger, renderTrailLength, Npoints]);

  useEffect(() => {
    globalWriteIndexRef.current = renderTrailLength > 1 ? 1 : 0;
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

    const initX = initPosXRef.current;
    const initY = initPosYRef.current;
    const initZ = initPosZRef.current;
    if (initX.length === Npoints && renderTrailLength > 0) {
      for (let p = 0; p < Npoints; p++) {
        const x = initX[p];
        const y = initY[p];
        const z = initZ[p];
        for (let i = 0; i < renderTrailLength; i++) {
          const base = (i * Npoints + p) * 3;
          positions[base] = x;
          positions[base + 1] = y;
          positions[base + 2] = z;
        }
      }
    }

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
      const lastSlot = renderTrailLength - 1;
      for (let p = 0; p < Npoints; p++) {
        for (let i = 0; i < renderTrailLength; i++) {
          const a = i * Npoints + p;
          const b = ((i + 1) % renderTrailLength) * Npoints + p;
          indexArray[index++] = a;
          indexArray[index++] = b;
        }
        const wrapOffset = p * renderTrailLength * 2 + lastSlot * 2;
        const wrapV = lastSlot * Npoints + p;
        indexArray[wrapOffset] = wrapV;
        indexArray[wrapOffset + 1] = wrapV;
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
    gammaRef.current = Math.max(
      1e-3,
      Math.pow(2, (Math.min(1, Math.max(0, speedContrast)) - 0.5) * 4),
    );
  }, [speedContrast]);

  useEffect(() => {
    drRef.current = highSpeedColor.r - lowSpeedColor.r;
    dgRef.current = highSpeedColor.g - lowSpeedColor.g;
    dbRef.current = highSpeedColor.b - lowSpeedColor.b;
  }, [lowSpeedColor, highSpeedColor]);

  useEffect(() => {
    const colorAttr = trailColorAttrRef.current;
    const colors = trailColorsRef.current;
    if (!colorAttr || colors.length === 0) return;

    const lowCol = lowSpeedColor;
    const dr = drRef.current;
    const dg = dgRef.current;
    const db = dbRef.current;
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
      Math.pow(2, (Math.min(1, Math.max(0, speedContrast)) - 0.5) * 4),
    );

    if (speeds.length * 3 === colors.length) {
      for (let i = 0; i < speeds.length; i++) {
        const tRaw = Math.min(
          1,
          Math.max(0, (speeds[i] - rangeMin) / speedRange),
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
    const N = Npoints;
    if (N === 0) return;
    const posX = posXRef.current;
    const posY = posYRef.current;
    const posZ = posZRef.current;
    if (posX.length !== N) return;
    const eqOut = eqOutRef.current;
    const eqFn = equationRef.current;
    const mesh = sphereMeshRef.current;
    const positionAttr = trailPositionAttrRef.current;
    const colorAttr = trailColorAttrRef.current;
    const colors = trailColorsRef.current;
    const trailSpeeds = trailSpeedsRef.current;
    const steps = substeps > 0 ? substeps : 1;
    const dtStep = dt / steps;
    const speedSamples = speedRef.current;
    const speedList = speedListRef.current;
    const speedContrastVal = gammaRef.current;
    const shouldUpdateRange =
      frameCountRef.current % SPEED_RANGE_UPDATE_INTERVAL === 0;
    frameCountRef.current += 1;
    const sampleStride = shouldUpdateRange
      ? Math.max(1, Math.floor(N / MAX_SPEED_SAMPLES))
      : 1;
    const lowCol = lowSpeedColor;
    const dr = drRef.current;
    const dg = dgRef.current;
    const db = dbRef.current;
    const lowColR = lowCol.r;
    const lowColG = lowCol.g;
    const lowColB = lowCol.b;
    const currentWriteIndex =
      renderTrailLength > 0 ? globalWriteIndexRef.current : -1;
    const nextWriteIndex =
      renderTrailLength > 0
        ? (currentWriteIndex + 1) % renderTrailLength
        : -1;
    const lastIndex =
      nextWriteIndex === 0 ? renderTrailLength - 1 : nextWriteIndex - 1;
    const hasColorUpdate = colorAttr !== null && colors.length > 0;
    const baseLastPointIndex = lastIndex * N;
    const baseLastPointOffset = baseLastPointIndex * 3;
    const baseTrailHeadOffset =
      nextWriteIndex >= 0 ? nextWriteIndex * N * 3 : -1;
    speedList.length = 0;
    for (let i = 0; i < N; i++) {
      let x = posX[i];
      let y = posY[i];
      let z = posZ[i];
      for (let s = 0; s < steps; s++) {
        eqFn(x, y, z, dtStep, eqOut);
        const dx = eqOut[0];
        const dy = eqOut[1];
        const dz = eqOut[2];
        x += dx;
        y += dy;
        z += dz;
      }
      posX[i] = x;
      posY[i] = y;
      posZ[i] = z;
      const dx = eqOut[0];
      const dy = eqOut[1];
      const dz = eqOut[2];
      const speedSq = dx * dx + dy * dy + dz * dz;
      const speed = dtStep !== 0 ? Math.sqrt(speedSq) / dtStep : 0;
      speedSamples[i] = speed;
      if (shouldUpdateRange && Number.isFinite(speed) && i % sampleStride === 0) {
        speedList.push(speed);
      }
      if (mesh) {
        tempMatrix.current.identity();
        tempMatrix.current.setPosition(x, y, z);
        mesh.setMatrixAt(i, tempMatrix.current);
      }
      if (baseTrailHeadOffset >= 0) {
        const headOffset = baseTrailHeadOffset + i * 3;
        trailPositionsRef.current[headOffset] = x;
        trailPositionsRef.current[headOffset + 1] = y;
        trailPositionsRef.current[headOffset + 2] = z;
      }
      if (hasColorUpdate) {
        const colorOffset = baseLastPointOffset + i * 3;
        const rawT = (speed - autoSpeedMinRef.current) /
          Math.max(1e-6, autoSpeedMaxRef.current - autoSpeedMinRef.current);
        const tClamp = rawT < 0 ? 0 : rawT > 1 ? 1 : rawT;
        const t = speedContrastVal === 1 ? tClamp : Math.pow(tClamp, speedContrastVal);
        colors[colorOffset] = lowColR + dr * t;
        colors[colorOffset + 1] = lowColG + dg * t;
        colors[colorOffset + 2] = lowColB + db * t;
      }
      const speedPointIndex = baseLastPointIndex + i;
      if (speedPointIndex < trailSpeeds.length) {
        trailSpeeds[speedPointIndex] = speed;
      }
    }
    if (mesh) {
      mesh.instanceMatrix.needsUpdate = true;
    }
    if (nextWriteIndex >= 0) {
      globalWriteIndexRef.current = nextWriteIndex;
    }
    if (shouldUpdateRange && speedList.length > 0) {
      const range = computePercentileRange(speedList);
      if (range) {
        if (!autoRangeInitializedRef.current) {
          autoSpeedMinRef.current = range.min;
          autoSpeedMaxRef.current = range.max;
          autoRangeInitializedRef.current = true;
        } else {
          autoSpeedMinRef.current +=
            (range.min - autoSpeedMinRef.current) * AUTO_SPEED_SMOOTHING;
          autoSpeedMaxRef.current +=
            (range.max - autoSpeedMaxRef.current) * AUTO_SPEED_SMOOTHING;
        }
        if (autoSpeedMaxRef.current <= autoSpeedMinRef.current + 1e-6) {
          autoSpeedMaxRef.current = autoSpeedMinRef.current + 1e-6;
        }
      }
    } else if (!autoRangeInitializedRef.current) {
      autoSpeedMinRef.current = 0;
      autoSpeedMaxRef.current = 1;
    }
    if (positionAttr && baseTrailHeadOffset >= 0) {
      const updateEnd = baseTrailHeadOffset + (N - 1) * 3 + 3;
      if (!positionAttr.updateRange) {
        positionAttr.updateRange = { offset: 0, count: -1 };
      }
      positionAttr.updateRange.offset = baseTrailHeadOffset;
      positionAttr.updateRange.count = updateEnd - baseTrailHeadOffset;
      positionAttr.needsUpdate = true;
    }
    if (colorAttr && hasColorUpdate) {
      const updateEnd = baseLastPointOffset + (N - 1) * 3 + 3;
      if (!colorAttr.updateRange) {
        colorAttr.updateRange = { offset: 0, count: -1 };
      }
      colorAttr.updateRange.offset = baseLastPointOffset;
      colorAttr.updateRange.count = updateEnd - baseLastPointOffset;
      colorAttr.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh
        key={Npoints}
        ref={sphereMeshRef}
        args={[null, null, Npoints]}
        frustumCulled={false}
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
    </>
  );
};

export default ChaosManager;
