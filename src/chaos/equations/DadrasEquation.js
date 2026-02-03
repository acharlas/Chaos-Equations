export const DadrasEquation = (x, y, z, dt, params) => {
  const { a, b, c, d, e } = params;
  const dx = (y - a * x + b * y * z) * dt;
  const dy = (c * y - x * z + z) * dt;
  const dz = (d * x * y - e * z) * dt;
  return [dx, dy, dz];
};
