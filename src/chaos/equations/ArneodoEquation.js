export const ArneodoEquation = (x, y, z, dt, params, out) => {
  const { a, b, c } = params;
  out[0] = y * dt;
  out[1] = z * dt;
  out[2] = (-a * x - b * y - c * z + x * x) * dt;
};
