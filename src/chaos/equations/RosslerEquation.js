export const RosslerEquation = (x, y, z, dt, params) => {
  const { a, b, c } = params;
  const dx = (-y - z) * dt;
  const dy = (x + a * y) * dt;
  const dz = (b + z * (x - c)) * dt;
  return [dx, dy, dz];
};
