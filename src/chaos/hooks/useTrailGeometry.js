import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";

const DEFAULT_MAX_TRAIL_POINTS = 300000;

export const useTrailGeometry = (Npoints, trailLength, maxTrailPoints, supportsUint32Indices) => {
  const trailsGeometryRef = useRef(new THREE.BufferGeometry());
  const trailPositionsRef = useRef(new Float32Array(0));
  const trailColorsRef = useRef(new Float32Array(0));
  const trailSpeedsRef = useRef(new Float32Array(0));
  const trailPositionAttrRef = useRef(null);
  const trailColorAttrRef = useRef(null);
  const trailIndexAttrRef = useRef(null);
  const breakSegmentsRef = useRef([]);

  const budgetCap = useMemo(() => {
    const maxByBudget = Math.floor(
      (maxTrailPoints ?? DEFAULT_MAX_TRAIL_POINTS) / Math.max(1, Npoints)
    );
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

  // Setup / resize buffers when Npoints or renderTrailLength changes
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
      const IndexArrayType = totalPoints <= 65535 ? Uint16Array : Uint32Array;
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

  return {
    geometryRef: trailsGeometryRef,
    positionsRef: trailPositionsRef,
    colorsRef: trailColorsRef,
    speedsRef: trailSpeedsRef,
    positionAttrRef: trailPositionAttrRef,
    colorAttrRef: trailColorAttrRef,
    indexAttrRef: trailIndexAttrRef,
    breakSegmentsRef,
    renderTrailLength,
    budgetCap,
    budgetTrailLength,
  };
};
