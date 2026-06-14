export const HalvorsenEquation = (x, y, z, dt, params, out) => {
  const { a } = params;
  out[0] = (-a * x - 4 * y - 4 * z - y * y) * dt;
  out[1] = (-a * y - 4 * x - 4 * z - z * z) * dt;
  out[2] = (-a * z - 4 * x - 4 * y - x * x) * dt;
};
