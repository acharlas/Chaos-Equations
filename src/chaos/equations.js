// ODE integrators. Each function writes (dx, dy, dz) = (f, g, h) * dt to out.
// Signatures are kept identical across all attractors so ChaosManager can
// dispatch them uniformly: (x, y, z, dt, params, out) => void.

export const AizawaEquation = (x, y, z, dt, { a, b, c, d, e, f }, out) => {
  out[0] = ((z - b) * x - d * y) * dt;
  out[1] = (d * x + (z - b) * y) * dt;
  out[2] =
    (c +
      a * z -
      z ** 3 / 3 -
      (x ** 2 + y ** 2) * (1 + e * z) +
      f * z * x ** 3) *
    dt;
};

export const ArneodoEquation = (x, y, z, dt, { a, b, c }, out) => {
  out[0] = y * dt;
  out[1] = z * dt;
  out[2] = (-a * x - b * y - c * z + x * x) * dt;
};

export const BoualiEquation = (x, y, z, dt, { a, b, c }, out) => {
  out[0] = (x * (1 - y) + a * z) * dt;
  out[1] = (b * (x * x - 1) * y) * dt;
  out[2] = (x - c * z) * dt;
};

export const BurkeShawEquation = (x, y, z, dt, { a, b }, out) => {
  out[0] = -a * (x + y) * dt;
  out[1] = (-y - a * x * z) * dt;
  out[2] = (a * x * y + b) * dt;
};

export const ChenLeeEquation = (x, y, z, dt, { a, b, c }, out) => {
  out[0] = (a * x - y * z) * dt;
  out[1] = (b * y + x * z) * dt;
  out[2] = (c * z + (x * y) / 3) * dt;
};

export const ChuaEquation = (x, y, z, dt, { a, b, k, p, q, r }, out) => {
  const nonlinearity =
    b * x + 0.5 * (a - b) * (Math.abs(x + 1) - Math.abs(x - 1));
  out[0] = k * p * (y - x - nonlinearity) * dt;
  out[1] = k * (x - y + z) * dt;
  out[2] = k * (-q * y - r * z) * dt;
};

export const DadrasEquation = (x, y, z, dt, { a, b, c, d, e }, out) => {
  out[0] = (y - a * x + b * y * z) * dt;
  out[1] = (c * y - x * z + z) * dt;
  out[2] = (d * x * y - e * z) * dt;
};

export const HalvorsenEquation = (x, y, z, dt, { a }, out) => {
  out[0] = (-a * x - 4 * y - 4 * z - y * y) * dt;
  out[1] = (-a * y - 4 * x - 4 * z - z * z) * dt;
  out[2] = (-a * z - 4 * x - 4 * y - x * x) * dt;
};

// Lorenz applies a hard-coded x += 5; z += 25; offset inside the function
// (intentional centering), so callers' "effective" start is (input + 5, y, 25).
export const LorenzEquation = (x, y, z, dt, { a, b, c }, out) => {
  x = x + 5;
  z = z + 25;
  out[0] = a * (y - x) * dt;
  out[1] = (x * (b - z) - y) * dt;
  out[2] = (x * y - c * z) * dt;
};

export const NewtonLeipnikEquation = (x, y, z, dt, { a, b }, out) => {
  out[0] = (-a * x + y + 10 * y * z) * dt;
  out[1] = (-x - 0.4 * y + 5 * x * z) * dt;
  out[2] = (b * z - 5 * x * y) * dt;
};

export const NoseHooverEquation = (x, y, z, dt, { a }, out) => {
  out[0] = y * dt;
  out[1] = (-x + y * z) * dt;
  out[2] = (a - y * y) * dt;
};

export const RabinovichFabrikantEquation = (x, y, z, dt, { alpha, gamma }, out) => {
  out[0] = (y * (z - 1 + x * x) + gamma * x) * dt;
  out[1] = (x * (3 * z + 1 - x * x) + gamma * y) * dt;
  out[2] = -2 * z * (alpha + x * y) * dt;
};

export const RosslerEquation = (x, y, z, dt, { a, b, c }, out) => {
  out[0] = (-y - z) * dt;
  out[1] = (x + a * y) * dt;
  out[2] = (b + z * (x - c)) * dt;
};

export const SprottEquation = (x, y, z, dt, { a }, out) => {
  out[0] = y * z * dt;
  out[1] = (x - y) * dt;
  out[2] = (a - x * y) * dt;
};

export const ThomasEquation = (x, y, z, dt, { b }, out) => {
  out[0] = (-b * x + Math.sin(y)) * dt;
  out[1] = (-b * y + Math.sin(z)) * dt;
  out[2] = (-b * z + Math.sin(x)) * dt;
};

// ponytail: module-level scratch is safe — ChaosManager's useFrame loop is
// synchronous, so rk4 calls finish before the next eq step (or next attractor).
const _k1 = new Float32Array(3);
const _k2 = new Float32Array(3);
const _k3 = new Float32Array(3);
const _k4 = new Float32Array(3);

export const rk4Integrate = (eq, x, y, z, dt, params, out) => {
  eq(x, y, z, dt, params, _k1);
  eq(x + 0.5 * _k1[0], y + 0.5 * _k1[1], z + 0.5 * _k1[2], dt, params, _k2);
  eq(x + 0.5 * _k2[0], y + 0.5 * _k2[1], z + 0.5 * _k2[2], dt, params, _k3);
  eq(x + _k3[0], y + _k3[1], z + _k3[2], dt, params, _k4);
  out[0] = (_k1[0] + 2 * _k2[0] + 2 * _k3[0] + _k4[0]) / 6;
  out[1] = (_k1[1] + 2 * _k2[1] + 2 * _k3[1] + _k4[1]) / 6;
  out[2] = (_k1[2] + 2 * _k2[2] + 2 * _k3[2] + _k4[2]) / 6;
};
