export const LorenzEquation = (x, y, z, dt, params) => {
  const { a, b, c } = params;
  const dx = a * (y - x) * dt;
  const dy = (x * (b - z) - y) * dt;
  const dz = (x * y - c * z) * dt;
  return { dx, dy, dz };
};
