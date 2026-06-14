export const BoualiEquation = (x, y, z, dt, params, out) => {
  const { a, b, c } = params;
  out[0] = (x * (1 - y) + a * z) * dt;
  out[1] = (b * (x * x - 1) * y) * dt;
  out[2] = (x - c * z) * dt;
};
