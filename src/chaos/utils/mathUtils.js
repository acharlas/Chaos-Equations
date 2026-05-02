const AUTO_SPEED_LOW_PERCENTILE = 10;
const AUTO_SPEED_HIGH_PERCENTILE = 90;

export const computePercentileRange = (values) => {
  if (!values || values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
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
  const last = sorted.length - 1;
  const lowIndex = Math.max(0, Math.floor(last * lowPct));
  const highIndex = Math.max(0, Math.floor(last * highPct));
  return { min: sorted[lowIndex], max: sorted[highIndex] };
};
