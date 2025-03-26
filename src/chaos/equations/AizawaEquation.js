export function AizawaEquation(x, y, z, dt, { a, b, c, d, e, f }) {
  const dx = ((z - b) * x - d * y) * dt;
  const dy = (d * x + (z - b) * y) * dt;
  const dz =
    (c +
      a * z -
      z ** 3 / 3 -
      (x ** 2 + y ** 2) * (1 + e * z) +
      f * z * x ** 3) *
    dt;

  return [dx, dy, dz];
}
