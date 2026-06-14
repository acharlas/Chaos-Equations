export function ChenLeeEquation(x, y, z, dt, { a, b, c }, out) {
  out[0] = (a * x - y * z) * dt;
  out[1] = (b * y + x * z) * dt;
  out[2] = (c * z + (x * y) / 3) * dt;
}
