export const RabinovichFabrikantEquation = (x, y, z, dt, params, out) => {
  const { alpha, gamma } = params;
  out[0] = (y * (z - 1 + x * x) + gamma * x) * dt;
  out[1] = (x * (3 * z + 1 - x * x) + gamma * y) * dt;
  out[2] = -2 * z * (alpha + x * y) * dt;
};
