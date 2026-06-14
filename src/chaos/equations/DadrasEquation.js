export const DadrasEquation = (x, y, z, dt, params, out) => {
  const { a, b, c, d, e } = params;
  out[0] = (y - a * x + b * y * z) * dt;
  out[1] = (c * y - x * z + z) * dt;
  out[2] = (d * x * y - e * z) * dt;
};
