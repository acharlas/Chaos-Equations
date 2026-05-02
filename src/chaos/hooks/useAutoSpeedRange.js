import { useRef, useCallback } from "react";
import { computePercentileRange } from "../utils/mathUtils";

const AUTO_SPEED_SMOOTHING = 0.15;
const SPEED_SMOOTHING_ALPHA = Math.min(1, Math.max(0, AUTO_SPEED_SMOOTHING));

export const useAutoSpeedRange = () => {
  const autoSpeedMinRef = useRef(0);
  const autoSpeedMaxRef = useRef(1);
  const autoRangeInitializedRef = useRef(false);

  const reset = useCallback(() => {
    autoRangeInitializedRef.current = false;
  }, []);

  const updateRange = useCallback((speedList) => {
    if (!speedList || speedList.length === 0) return null;

    const range = computePercentileRange(speedList);
    const frameMin = range?.min;
    const frameMax = range?.max;

    if (frameMin === undefined || frameMax === undefined) {
      return {
        min: autoRangeInitializedRef.current ? autoSpeedMinRef.current : 0,
        max: autoRangeInitializedRef.current ? autoSpeedMaxRef.current : 1,
      };
    }

    if (!autoRangeInitializedRef.current) {
      autoSpeedMinRef.current = frameMin;
      autoSpeedMaxRef.current = frameMax;
      autoRangeInitializedRef.current = true;
    } else {
      autoSpeedMinRef.current +=
        (frameMin - autoSpeedMinRef.current) * SPEED_SMOOTHING_ALPHA;
      autoSpeedMaxRef.current +=
        (frameMax - autoSpeedMaxRef.current) * SPEED_SMOOTHING_ALPHA;
    }

    if (autoSpeedMaxRef.current <= autoSpeedMinRef.current + 1e-6) {
      autoSpeedMaxRef.current = autoSpeedMinRef.current + 1e-6;
    }

    return {
      min: autoSpeedMinRef.current,
      max: autoSpeedMaxRef.current,
    };
  }, []);

  const getCurrentRange = useCallback(() => {
    const min = autoRangeInitializedRef.current
      ? autoSpeedMinRef.current
      : 0;
    const max = autoRangeInitializedRef.current
      ? autoSpeedMaxRef.current
      : 1;
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return { min: 0, max: 1 };
    }
    return { min, max };
  }, []);

  return {
    updateRange,
    reset,
    getCurrentRange,
    initializedRef: autoRangeInitializedRef,
  };
};
