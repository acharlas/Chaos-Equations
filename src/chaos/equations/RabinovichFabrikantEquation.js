export const RabinovichFabrikantEquation = (x, y, z, dt, params) => {
  const { alpha, gamma } = params;
  const dx = (y * (z - 1 + x * x) + gamma * x) * dt;
  const dy = (x * (3 * z + 1 - x * x) + gamma * y) * dt;
  const dz = (-2 * z * (alpha + x * y)) * dt;
  return [dx, dy, dz];
};
