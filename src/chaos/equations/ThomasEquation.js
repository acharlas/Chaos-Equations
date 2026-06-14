export function ThomasEquation(x, y, z, dt, { b }, out) {
  out[0] = (-b * x + Math.sin(y)) * dt;
  out[1] = (-b * y + Math.sin(z)) * dt;
  out[2] = (-b * z + Math.sin(x)) * dt;
}
