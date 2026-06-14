export const RosslerEquation = (x, y, z, dt, params, out) => {
  const { a, b, c } = params;
  out[0] = (-y - z) * dt;
  out[1] = (x + a * y) * dt;
  out[2] = (b + z * (x - c)) * dt;
};
