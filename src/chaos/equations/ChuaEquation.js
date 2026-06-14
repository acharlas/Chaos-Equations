export const ChuaEquation = (x, y, z, dt, params, out) => {
  const { a, b, k, p, q, r } = params;
  const nonlinearity =
    b * x + 0.5 * (a - b) * (Math.abs(x + 1) - Math.abs(x - 1));
  out[0] = k * p * (y - x - nonlinearity) * dt;
  out[1] = k * (x - y + z) * dt;
  out[2] = k * (-q * y - r * z) * dt;
};
