export const BurkeShawEquation = (x, y, z, dt, params) => {
  const { a, b, c } = params;
  const dx = (-a * x - y * z) * dt;
  const dy = (-x + b * y + x * z) * dt;
  const dz = (c * z + x * y - x * x) * dt;
  return [dx, dy, dz];
};
