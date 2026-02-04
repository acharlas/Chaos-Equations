export const ChuaEquation = (x, y, z, dt, params) => {
  const { a, b, k, p, q, r } = params;
  const nonlinearity =
    b * x + 0.5 * (a - b) * (Math.abs(x + 1) - Math.abs(x - 1));
  const dx = k * p * (y - x - nonlinearity) * dt;
  const dy = k * (x - y + z) * dt;
  const dz = k * (-q * y - r * z) * dt;
  return [dx, dy, dz];
};
