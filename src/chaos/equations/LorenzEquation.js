export const LorenzEquation = (x, y, z, dt, params, out) => {
  const { a, b, c } = params;
  x = x + 5;
  z = z + 25;
  out[0] = a * (y - x) * dt;
  out[1] = (x * (b - z) - y) * dt;
  out[2] = (x * y - c * z) * dt;
};
