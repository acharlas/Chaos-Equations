export const BurkeShawEquation = (x, y, z, dt, params) => {
  const { a, b } = params;
  const dx = (-a * (x + y)) * dt;
  const dy = (-y - a * x * z) * dt;
  const dz = (a * x * y + b) * dt;
  return [dx, dy, dz];
};
