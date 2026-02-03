export const NewtonLeipnikEquation = (x, y, z, dt, params) => {
  const { a, b } = params;
  const dx = (-a * x + y + 10 * y * z) * dt;
  const dy = (-x - 0.4 * y + 5 * x * z) * dt;
  const dz = (b * z - 5 * x * y) * dt;
  return [dx, dy, dz];
};
