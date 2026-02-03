export const SprottEquation = (x, y, z, dt, params) => {
  const { a } = params;
  const dx = (y * z) * dt;
  const dy = (x - y) * dt;
  const dz = (a - x * y) * dt;
  return [dx, dy, dz];
};
