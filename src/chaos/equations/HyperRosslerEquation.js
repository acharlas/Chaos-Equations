export const HyperRosslerEquation = (x, y, z, w, dt, params) => {
  const { a, b, c, d, e } = params;
  const dx = (-y - z) * dt;
  const dy = (x + a * y + w) * dt;
  const dz = (b + z * (x - c)) * dt;
  const dw = (d * w + e * z) * dt;
  return [dx, dy, dz, dw];
};
