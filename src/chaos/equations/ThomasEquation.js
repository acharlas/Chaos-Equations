export function ThomasEquation(x, y, z, dt, { b }) {
  const dx = (-b * x + Math.sin(y)) * dt;
  const dy = (-b * y + Math.sin(z)) * dt;
  const dz = (-b * z + Math.sin(x)) * dt;

  return [dx, dy, dz];
}
