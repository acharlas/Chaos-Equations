const AUTO_SPEED_LOW_PERCENTILE = 10;
const AUTO_SPEED_HIGH_PERCENTILE = 90;
const AUTO_SPEED_SMOOTHING = 0.15;

export const computePercentileRange = (values) => {
  if (!values || values.length === 0) return null;
  values.sort((a, b) => a - b);
  const clampedLow = Math.min(
    AUTO_SPEED_LOW_PERCENTILE,
    AUTO_SPEED_HIGH_PERCENTILE - 1,
  );
  const clampedHigh = Math.max(
    AUTO_SPEED_HIGH_PERCENTILE,
    AUTO_SPEED_LOW_PERCENTILE + 1,
  );
  const lowPct = Math.max(0, Math.min(100, clampedLow)) / 100;
  const highPct = Math.max(0, Math.min(100, clampedHigh)) / 100;
  const last = values.length - 1;
  const lowIndex = Math.max(0, Math.floor(last * lowPct));
  const highIndex = Math.max(0, Math.floor(last * highPct));
  return { min: values[lowIndex], max: values[highIndex] };
};

export const updateAutoSpeedRange = (speedList, state, smoothing) => {
  if (!speedList || speedList.length === 0) return false;
  const range = computePercentileRange(speedList);
  if (!range) return false;
  const alpha =
    typeof smoothing === "number" ? smoothing : AUTO_SPEED_SMOOTHING;
  if (!state.initialized) {
    state.min = range.min;
    state.max = range.max;
    state.initialized = true;
  } else {
    state.min += (range.min - state.min) * alpha;
    state.max += (range.max - state.max) * alpha;
  }
  if (state.max <= state.min + 1e-6) {
    state.max = state.min + 1e-6;
  }
  return true;
};
