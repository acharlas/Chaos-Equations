export const BurkeShawEquation = (x, y, z, dt, params, out) => {
  const { a, b } = params;
  out[0] = -a * (x + y) * dt;
  out[1] = (-y - a * x * z) * dt;
  out[2] = (a * x * y + b) * dt;
};
