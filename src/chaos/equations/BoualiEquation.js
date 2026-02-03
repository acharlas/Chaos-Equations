export const BoualiEquation = (x, y, z, dt, params) => {
  const { a, b, c } = params;
  const dx = (x * (1 - y) + a * z) * dt;
  const dy = (b * (x * x - 1) * y) * dt;
  const dz = (x - c * z) * dt;
  return [dx, dy, dz];
};
