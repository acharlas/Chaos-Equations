export const NewtonLeipnikEquation = (x, y, z, dt, params, out) => {
  const { a, b } = params;
  out[0] = (-a * x + y + 10 * y * z) * dt;
  out[1] = (-x - 0.4 * y + 5 * x * z) * dt;
  out[2] = (b * z - 5 * x * y) * dt;
};
