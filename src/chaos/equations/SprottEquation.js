export const SprottEquation = (x, y, z, dt, params, out) => {
  const { a } = params;
  out[0] = y * z * dt;
  out[1] = (x - y) * dt;
  out[2] = (a - x * y) * dt;
};
