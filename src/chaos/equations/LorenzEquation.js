export const LorenzEquation = (x, y, z, dt, params) => {
  const { a, b, c } = params;
  //Magic number to shift all the graph to the center
  x = x + 5;
  z = z + 25;

  const dx = a * (y - x) * dt;
  const dy = (x * (b - z) - y) * dt;
  const dz = (x * y - c * z) * dt;
  return [dx, dy, dz];
};
