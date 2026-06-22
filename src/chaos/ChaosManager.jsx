import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useControls } from "leva";
import { percentileRange } from "./equations.js";
import { SIMULATION_SCHEMA } from "./simulationSchema.js";

const BASE_DT = 0.003;
const SUBSTEPS = 2;
const SPEED_RANGE_UPDATE_INTERVAL = 10;
const MAX_SPEED_SAMPLES = 2000;
const AUTO_SPEED_SMOOTHING = 0.15;

const ChaosManager = ({ equationFn, params }) => {
  const sim = useControls(SIMULATION_SCHEMA);
  const { Npoints, trailLength, timeScale, lowSpeedHex, highSpeedHex, freeze } =
    sim;
  const dt = BASE_DT * timeScale;

  const lowSpeedColor = useMemo(() => new THREE.Color(lowSpeedHex), [lowSpeedHex]);
  const highSpeedColor = useMemo(() => new THREE.Color(highSpeedHex), [highSpeedHex]);

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
  const autoSpeedMinRef = useRef(0);
  const autoSpeedMaxRef = useRef(1);
  const autoRangeInitializedRef = useRef(false);
  const frameCountRef = useRef(0);
  const drRef = useRef(0);
  const dgRef = useRef(0);
  const dbRef = useRef(0);
  const equationRef = useRef(equationFn);
  const eqOutRef = useRef(new Float32Array(3));
  const posXRef = useRef(new Float32Array(0));
  const posYRef = useRef(new Float32Array(0));
  const posZRef = useRef(new Float32Array(0));
  const initPosXRef = useRef(new Float32Array(0));
  const initPosYRef = useRef(new Float32Array(0));
  const initPosZRef = useRef(new Float32Array(0));
  const speedRef = useRef(new Float32Array(0));

  useEffect(() => {
    equationRef.current = equationFn;
  }, [equationFn]);

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
    globalWriteIndexRef.current = trailLength > 1 ? 1 : 0;
  }, [Npoints, trailLength]);

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
    const speeds = new Float32Array(totalPoints);

    const initX = initPosXRef.current;
    const initY = initPosYRef.current;
    const initZ = initPosZRef.current;
    if (initX.length === Npoints && trailLength > 0) {
      for (let p = 0; p < Npoints; p++) {
        const x = initX[p];
        const y = initY[p];
        const z = initZ[p];
        for (let i = 0; i < trailLength; i++) {
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

    const segmentCount = trailLength > 1 ? trailLength * Npoints : 0;
    if (segmentCount > 0) {
      const indexArray = new Uint32Array(segmentCount * 2);
      let idx = 0;
      for (let p = 0; p < Npoints; p++) {
        for (let i = 0; i < trailLength; i++) {
          const a = i * Npoints + p;
          const b = ((i + 1) % trailLength) * Npoints + p;
          indexArray[idx++] = a;
          indexArray[idx++] = b;
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
  }, [Npoints, trailLength]);

  useEffect(() => {
    drRef.current = highSpeedColor.r - lowSpeedColor.r;
    dgRef.current = highSpeedColor.g - lowSpeedColor.g;
    dbRef.current = highSpeedColor.b - lowSpeedColor.b;
  }, [lowSpeedColor, highSpeedColor]);

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
    const indexAttr = trailIndexAttrRef.current;
    const indexArray = indexAttr ? indexAttr.array : null;
    const dtStep = dt / SUBSTEPS;
    const breakSegments = breakSegmentsRef.current;
    const speedSamples = speedRef.current;
    const dr = drRef.current;
    const dg = dgRef.current;
    const db = dbRef.current;
    const lowColR = lowSpeedColor.r;
    const lowColG = lowSpeedColor.g;
    const lowColB = lowSpeedColor.b;
    const shouldUpdateRange =
      frameCountRef.current % SPEED_RANGE_UPDATE_INTERVAL === 0;
    frameCountRef.current += 1;
    const sampleStride = shouldUpdateRange
      ? Math.max(1, Math.floor(N / MAX_SPEED_SAMPLES))
      : 1;
    const currentWriteIndex = trailLength > 0 ? globalWriteIndexRef.current : -1;
    const nextWriteIndex =
      trailLength > 0 ? (currentWriteIndex + 1) % trailLength : -1;
    const lastIndex = nextWriteIndex === 0 ? trailLength - 1 : nextWriteIndex - 1;
    const hasIndexBreak = indexAttr !== null && trailLength > 1;
    const baseLastPointIndex = lastIndex * N;
    const baseLastPointOffset = baseLastPointIndex * 3;
    const baseTrailHeadOffset = nextWriteIndex >= 0 ? nextWriteIndex * N * 3 : -1;
    const timeWrapSegment = nextWriteIndex;
    const speedList = [];
    let minIndexUpdate = Infinity;
    let maxIndexUpdate = -Infinity;
    for (let i = 0; i < N; i++) {
      let x = posX[i];
      let y = posY[i];
      let z = posZ[i];
      for (let s = 0; s < SUBSTEPS; s++) {
        eqFn(x, y, z, dtStep, params, eqOut);
        x += eqOut[0];
        y += eqOut[1];
        z += eqOut[2];
      }
      posX[i] = x;
      posY[i] = y;
      posZ[i] = z;
      const speed = Math.sqrt(eqOut[0] ** 2 + eqOut[1] ** 2 + eqOut[2] ** 2) / dtStep;
      speedSamples[i] = speed;
      if (shouldUpdateRange && Number.isFinite(speed) && i % sampleStride === 0) {
        speedList.push(speed);
      }
      if (mesh) {
        tempMatrix.current.setPosition(x, y, z);
        mesh.setMatrixAt(i, tempMatrix.current);
      }
      if (baseTrailHeadOffset >= 0) {
        const headOffset = baseTrailHeadOffset + i * 3;
        trailPositionsRef.current[headOffset] = x;
        trailPositionsRef.current[headOffset + 1] = y;
        trailPositionsRef.current[headOffset + 2] = z;
      }
      if (colorAttr) {
        const colorOffset = baseLastPointOffset + i * 3;
        const range = Math.max(1e-6, autoSpeedMaxRef.current - autoSpeedMinRef.current);
        const t = Math.min(1, Math.max(0, (speed - autoSpeedMinRef.current) / range));
        colors[colorOffset] = lowColR + dr * t;
        colors[colorOffset + 1] = lowColG + dg * t;
        colors[colorOffset + 2] = lowColB + db * t;
      }
      const speedPointIndex = baseLastPointIndex + i;
      if (speedPointIndex < trailSpeeds.length) {
        trailSpeeds[speedPointIndex] = speed;
      }
      if (hasIndexBreak && indexArray) {
        const prevBreak = breakSegments[i] ?? -1;
        if (prevBreak !== timeWrapSegment) {
          const baseSegmentOffset = i * trailLength * 2;
          if (prevBreak >= 0) {
            const restoreOffset = baseSegmentOffset + prevBreak * 2;
            indexArray[restoreOffset] = prevBreak * N + i;
            indexArray[restoreOffset + 1] =
              ((prevBreak + 1) % trailLength) * N + i;
            if (restoreOffset < minIndexUpdate) minIndexUpdate = restoreOffset;
            const restoreEnd = restoreOffset + 1;
            if (restoreEnd > maxIndexUpdate) maxIndexUpdate = restoreEnd;
          }
          const breakOffset = baseSegmentOffset + timeWrapSegment * 2;
          const v = timeWrapSegment * N + i;
          indexArray[breakOffset] = v;
          indexArray[breakOffset + 1] = v;
          if (breakOffset < minIndexUpdate) minIndexUpdate = breakOffset;
          const breakEnd = breakOffset + 1;
          if (breakEnd > maxIndexUpdate) maxIndexUpdate = breakEnd;
          breakSegments[i] = timeWrapSegment;
        }
      }
    }
    if (mesh) mesh.instanceMatrix.needsUpdate = true;
    if (nextWriteIndex >= 0) globalWriteIndexRef.current = nextWriteIndex;
    if (shouldUpdateRange && speedList.length > 0) {
      const range = percentileRange(speedList);
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
      positionAttr.clearUpdateRanges();
      positionAttr.addUpdateRange(baseTrailHeadOffset, updateEnd - baseTrailHeadOffset);
      positionAttr.needsUpdate = true;
    }
    if (indexAttr && minIndexUpdate !== Infinity) {
      indexAttr.clearUpdateRanges();
      indexAttr.addUpdateRange(minIndexUpdate, maxIndexUpdate - minIndexUpdate);
      indexAttr.needsUpdate = true;
    }
    if (colorAttr) {
      const updateEnd = baseLastPointOffset + (N - 1) * 3 + 3;
      colorAttr.clearUpdateRanges();
      colorAttr.addUpdateRange(baseLastPointOffset, updateEnd - baseLastPointOffset);
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
