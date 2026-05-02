const AUTO_SPEED_LOW_PERCENTILE = 10;
const AUTO_SPEED_HIGH_PERCENTILE = 90;

export const computePercentileRange = (values, sortedBuffer) => {
  if (!values || values.length === 0) return null;

  const len = values.length;
  if (sortedBuffer.length < len) {
    sortedBuffer = new Float32Array(len);
  }
  sortedBuffer.set(values.subarray ? values.subarray(0, len) : values.slice(0, len));
  sortedBuffer.sort();

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
  const last = len - 1;
  const lowIndex = Math.max(0, Math.floor(last * lowPct));
  const highIndex = Math.max(0, Math.floor(last * highPct));
  return { min: sortedBuffer[lowIndex], max: sortedBuffer[highIndex] };
};
