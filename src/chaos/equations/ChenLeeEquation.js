export function ChenLeeEquation(x, y, z, dt, { a, b, c }) {
  const dx = (a * x - y * z) * dt;
  const dy = (b * y + x * z) * dt;
  const dz = (c * z + (x * y) / 3) * dt;
  return [dx, dy, dz];
}
