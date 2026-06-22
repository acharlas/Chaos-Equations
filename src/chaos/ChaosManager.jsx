import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { folder, useControls } from "leva";

const BASE_DT = 0.003;
const SUBSTEPS = 2;
const SPEED_RANGE_UPDATE_INTERVAL = 10;
const MAX_SPEED_SAMPLES = 2000;
const AUTO_SPEED_SMOOTHING = 0.15;
const SPEED_PCT_LO = 0.1;
const SPEED_PCT_HI = 0.9;

export const SIMULATION_SCHEMA = {
  Simulation: folder(
    {
      Npoints: { value: 500, min: 1, max: 1000, step: 1, label: "Particles" },
      trailLength: {
        value: 400,
        min: 100,
        max: 800,
        step: 10,
        label: "Trail Length",
      },
      globalScale: { value: 5, min: 2, max: 12, step: 0.1, label: "Global Scale" },
      timeScale: { value: 1.0, min: 0.25, max: 4, step: 0.05, label: "Time Scale" },
      freeze: { value: false, label: "Freeze" },
    },
    { collapsed: false, order: -5 },
  ),
  Colors: folder(
    {
      lowSpeedHex: { value: "#0000ff", label: "Low Speed Color" },
      highSpeedHex: { value: "#00ff00", label: "High Speed Color" },
    },
    { collapsed: false, order: -4 },
  ),
};

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
  const trailPositionAttrRef = useRef(null);
  const trailColorAttrRef = useRef(null);
  const trailIndexAttrRef = useRef(null);
  const lastBreakSegmentRef = useRef(-1);
  const globalWriteIndexRef = useRef(0);
  const autoSpeedMinRef = useRef(0);
  const autoSpeedMaxRef = useRef(1);
  const autoRangeInitializedRef = useRef(false);
  const frameCountRef = useRef(0);
  const eqOutRef = useRef(new Float32Array(3));
  const posXRef = useRef(new Float32Array(0));
  const posYRef = useRef(new Float32Array(0));
  const posZRef = useRef(new Float32Array(0));

  useEffect(() => {
    const N = Npoints;
    const posX = new Float32Array(N);
    const posY = new Float32Array(N);
    const posZ = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      posX[i] = Math.random() * 2 - 1;
      posY[i] = Math.random() * 2 - 1;
      posZ[i] = Math.random() * 2 - 1;
    }
    posXRef.current = posX;
    posYRef.current = posY;
    posZRef.current = posZ;
    autoRangeInitializedRef.current = false;
  }, [Npoints, trailLength]);

  useEffect(() => {
    const totalPoints = Npoints * trailLength;
    const positions = new Float32Array(totalPoints * 3);
    const colors = new Float32Array(totalPoints * 3);

    if (trailLength > 0) {
      const px = posXRef.current;
      const py = posYRef.current;
      const pz = posZRef.current;
      for (let p = 0; p < Npoints; p++) {
        const x = px[p];
        const y = py[p];
        const z = pz[p];
        for (let i = 0; i < trailLength; i++) {
          const base = (i * Npoints + p) * 3;
          positions[base] = x;
          positions[base + 1] = y;
          positions[base + 2] = z;
        }
      }
    }

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
  }, [Npoints, trailLength]);

  useFrame(() => {
    if (freeze) return;
    const N = Npoints;
    const posX = posXRef.current;
    const posY = posYRef.current;
    const posZ = posZRef.current;
    const eqOut = eqOutRef.current;
    const mesh = sphereMeshRef.current;
    const positionAttr = trailPositionAttrRef.current;
    const colorAttr = trailColorAttrRef.current;
    const indexAttr = trailIndexAttrRef.current;
    const indexArray = indexAttr ? indexAttr.array : null;
    const dtStep = dt / SUBSTEPS;
    const lowR = lowSpeedColor.r;
    const lowG = lowSpeedColor.g;
    const lowB = lowSpeedColor.b;
    const dr = highSpeedColor.r - lowR;
    const dg = highSpeedColor.g - lowG;
    const db = highSpeedColor.b - lowB;
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
    if (hasIndexBreak && lastBreakSegmentRef.current !== timeWrapSegment) {
      const prev = lastBreakSegmentRef.current;
      if (prev >= 0) {
        for (let p = 0; p < N; p++) {
          const restoreOffset = p * trailLength * 2 + prev * 2;
          indexArray[restoreOffset] = prev * N + p;
          indexArray[restoreOffset + 1] = ((prev + 1) % trailLength) * N + p;
        }
        if (prev * 2 < minIndexUpdate) minIndexUpdate = prev * 2;
        const restoreEnd = (N - 1) * trailLength * 2 + prev * 2 + 2;
        if (restoreEnd > maxIndexUpdate) maxIndexUpdate = restoreEnd;
      }
      for (let p = 0; p < N; p++) {
        const breakOffset = p * trailLength * 2 + timeWrapSegment * 2;
        const v = timeWrapSegment * N + p;
        indexArray[breakOffset] = v;
        indexArray[breakOffset + 1] = v;
      }
      if (timeWrapSegment * 2 < minIndexUpdate) minIndexUpdate = timeWrapSegment * 2;
      const breakEnd = (N - 1) * trailLength * 2 + timeWrapSegment * 2 + 2;
      if (breakEnd > maxIndexUpdate) maxIndexUpdate = breakEnd;
      lastBreakSegmentRef.current = timeWrapSegment;
    }
    for (let i = 0; i < N; i++) {
      let x = posX[i];
      let y = posY[i];
      let z = posZ[i];
      for (let s = 0; s < SUBSTEPS; s++) {
        equationFn(x, y, z, dtStep, params, eqOut);
        x += eqOut[0];
        y += eqOut[1];
        z += eqOut[2];
      }
      posX[i] = x;
      posY[i] = y;
      posZ[i] = z;
      const speed = Math.sqrt(eqOut[0] ** 2 + eqOut[1] ** 2 + eqOut[2] ** 2) / dtStep;
      if (shouldUpdateRange && Number.isFinite(speed) && i % sampleStride === 0) {
        speedList.push(speed);
      }
      if (mesh) {
        tempMatrix.current.setPosition(x, y, z);
        mesh.setMatrixAt(i, tempMatrix.current);
      }
      if (baseTrailHeadOffset >= 0) {
        const headOffset = baseTrailHeadOffset + i * 3;
        positionAttr.array[headOffset] = x;
        positionAttr.array[headOffset + 1] = y;
        positionAttr.array[headOffset + 2] = z;
      }
      if (colorAttr) {
        const colorOffset = baseLastPointOffset + i * 3;
        const range = Math.max(1e-6, autoSpeedMaxRef.current - autoSpeedMinRef.current);
        const t = Math.min(1, Math.max(0, (speed - autoSpeedMinRef.current) / range));
        colorAttr.array[colorOffset] = lowR + dr * t;
        colorAttr.array[colorOffset + 1] = lowG + dg * t;
        colorAttr.array[colorOffset + 2] = lowB + db * t;
      }
    }
    if (mesh) mesh.instanceMatrix.needsUpdate = true;
    if (nextWriteIndex >= 0) globalWriteIndexRef.current = nextWriteIndex;
    if (shouldUpdateRange && speedList.length > 0) {
      const sorted = speedList.slice().sort((a, b) => a - b);
      const last = sorted.length - 1;
      const lo = sorted[Math.floor(last * SPEED_PCT_LO)];
      const hi = sorted[Math.floor(last * SPEED_PCT_HI)];
      if (!autoRangeInitializedRef.current) {
        autoSpeedMinRef.current = lo;
        autoSpeedMaxRef.current = hi;
        autoRangeInitializedRef.current = true;
      } else {
        autoSpeedMinRef.current +=
          (lo - autoSpeedMinRef.current) * AUTO_SPEED_SMOOTHING;
        autoSpeedMaxRef.current +=
          (hi - autoSpeedMaxRef.current) * AUTO_SPEED_SMOOTHING;
      }
      if (autoSpeedMaxRef.current <= autoSpeedMinRef.current + 1e-6) {
        autoSpeedMaxRef.current = autoSpeedMinRef.current + 1e-6;
      }
    } else if (!autoRangeInitializedRef.current) {
      autoSpeedMinRef.current = 0;
      autoSpeedMaxRef.current = 1;
    }
    const updates = [
      positionAttr && baseTrailHeadOffset >= 0 && [positionAttr, baseTrailHeadOffset, N * 3],
      indexAttr && minIndexUpdate !== Infinity && [indexAttr, minIndexUpdate, maxIndexUpdate - minIndexUpdate],
      colorAttr && [colorAttr, baseLastPointOffset, N * 3],
    ];
    for (const u of updates) {
      if (!u) continue;
      const [attr, offset, count] = u;
      attr.clearUpdateRanges();
      attr.addUpdateRange(offset, count);
      attr.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh key={Npoints} ref={sphereMeshRef} args={[null, null, Npoints]}>
        <sphereGeometry args={[0.01, 16, 16]} />
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
    </>
  );
};

export default ChaosManager;
