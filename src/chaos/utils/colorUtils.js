export const computeGamma = (speedContrast) =>
  Math.max(
    1e-3,
    Math.pow(2, (Math.min(1, Math.max(0, speedContrast)) - 0.5) * 4)
  );

export const mapSpeedToColor = (speed, rangeMin, rangeMax, lowCol, highCol, gamma) => {
  const speedRange = Math.max(1e-6, rangeMax - rangeMin);
  const tRaw = Math.min(1, Math.max(0, (speed - rangeMin) / speedRange));
  const t = gamma === 1 ? tRaw : Math.pow(tRaw, gamma);
  return {
    r: lowCol.r + (highCol.r - lowCol.r) * t,
    g: lowCol.g + (highCol.g - lowCol.g) * t,
    b: lowCol.b + (highCol.b - lowCol.b) * t,
  };
};

export const writeColorToArray = (colors, offset, { r, g, b }) => {
  colors[offset] = r;
  colors[offset + 1] = g;
  colors[offset + 2] = b;
};

export const fillColorArray = (colors, lowCol) => {
  for (let i = 0; i < colors.length; i += 3) {
    colors[i] = lowCol.r;
    colors[i + 1] = lowCol.g;
    colors[i + 2] = lowCol.b;
  }
};
