export const ChuaEquation = (x, y, z, dt, params) => {
  const { a, b, m0, m1 } = params;
  const h =
    m1 * x + 0.5 * (m0 - m1) * (Math.abs(x + 1) - Math.abs(x - 1));
  const dx = a * (y - x - h) * dt;
  const dy = (x - y + z) * dt;
  const dz = (-b * y) * dt;
  return [dx, dy, dz];
};
