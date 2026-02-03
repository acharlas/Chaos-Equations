export const NoseHooverEquation = (x, y, z, dt, params) => {
  const { a } = params;
  const dx = y * dt;
  const dy = (-x + y * z) * dt;
  const dz = (a - y * y) * dt;
  return [dx, dy, dz];
};
