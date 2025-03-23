export const HalvorsenEquation = (x, y, z, dt, params) => {
  const { a } = params;
  const dx = (-a * x - 4 * y - 4 * z - y * y) * dt;
  const dy = (-a * y - 4 * x - 4 * z - z * z) * dt;
  const dz = (-a * z - 4 * x - 4 * y - x * x) * dt;
  return [dx, dy, dz];
};
