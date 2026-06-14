export function AizawaEquation(x, y, z, dt, { a, b, c, d, e, f }, out) {
  out[0] = ((z - b) * x - d * y) * dt;
  out[1] = (d * x + (z - b) * y) * dt;
  out[2] =
    (c +
      a * z -
      z ** 3 / 3 -
      (x ** 2 + y ** 2) * (1 + e * z) +
      f * z * x ** 3) *
    dt;
}
