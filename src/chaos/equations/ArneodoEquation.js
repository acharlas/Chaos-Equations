export const ArneodoEquation = (x, y, z, dt, params) => {
  const { a, b, c } = params;
  const dx = y * dt;
  const dy = z * dt;
  const dz = (-a * x - b * y - c * z + x * x) * dt;
  return [dx, dy, dz];
};
