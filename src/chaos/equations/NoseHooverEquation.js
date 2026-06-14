export const NoseHooverEquation = (x, y, z, dt, params, out) => {
  const { a } = params;
  out[0] = y * dt;
  out[1] = (-x + y * z) * dt;
  out[2] = (a - y * y) * dt;
};
