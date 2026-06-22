// Smoke tests for the pure ODE equations. These are the integration kernels
// that ChaosManager relies on. We assert:
//   1. Each equation returns the documented shape (3 finite numbers).
//   2. The default parameterization keeps the attractor bounded — the
//      particles do not blow up to Infinity or collapse to NaN after a few
//      thousand steps.
//   3. Determinism: given the same inputs, equations return the same outputs.

import { describe, it, expect } from "vitest";

import {
  AizawaEquation,
  ArneodoEquation,
  BoualiEquation,
  BurkeShawEquation,
  ChenLeeEquation,
  ChuaEquation,
  DadrasEquation,
  HalvorsenEquation,
  LorenzEquation,
  NewtonLeipnikEquation,
  NoseHooverEquation,
  RabinovichFabrikantEquation,
  RosslerEquation,
  SprottEquation,
  ThomasEquation,
} from "../src/chaos/equations.js";

const STEPS = 5000;
const DT = 0.001;

const ATTRACTOR_DEFAULTS = {
  Aizawa: { eq: AizawaEquation, params: { a: 0.95, b: 0.7, c: 0.6, d: 3.5, e: 0.25, f: 0.1 }, bound: 5 },
  Arneodo: { eq: ArneodoEquation, params: { a: 5.5, b: 3.5, c: 1 }, bound: 30 },
  Bouali: { eq: BoualiEquation, params: { a: 0.3, b: 1, c: 1 }, bound: 30 },
  "Burke-Shaw": { eq: BurkeShawEquation, params: { a: 10, b: 13 }, bound: 5 },
  "Chen-Lee": { eq: ChenLeeEquation, params: { a: 0.9, b: -3, c: -0.38 }, bound: 30 },
  Chua: { eq: ChuaEquation, params: { a: 0.1, b: -0.48, k: 1, p: -1.3, q: -0.0136, r: -0.0297 }, bound: 5 },
  Dadras: { eq: DadrasEquation, params: { a: 3, b: 2.7, c: 1.7, d: 2, e: 9 }, bound: 30 },
  Halvorsen: { eq: HalvorsenEquation, params: { a: 1.4 }, bound: 20 },
  Lorenz: { eq: LorenzEquation, params: { a: 10, b: 28, c: 2.67 }, bound: 60 },
  "Newton-Leipnik": { eq: NewtonLeipnikEquation, params: { a: 0.4, b: 0.175 }, bound: 5 },
  "Nose-Hoover": { eq: NoseHooverEquation, params: { a: 1.5 }, bound: 10 },
  "Rabinovich-Fabrikant": { eq: RabinovichFabrikantEquation, params: { alpha: 0.14, gamma: 0.1 }, bound: 30 },
  Rossler: { eq: RosslerEquation, params: { a: 0.2, b: 0.2, c: 5.7 }, bound: 30 },
  Sprott: { eq: SprottEquation, params: { a: 1 }, bound: 5 },
  Thomas: { eq: ThomasEquation, params: { b: 0.19 }, bound: 5 },
};

const start = [0.1, 0.0, 0.0];

function runAttractor(eq, params, steps, dt) {
  let [x, y, z] = start;
  const out = new Float32Array(3);
  for (let i = 0; i < steps; i++) {
    eq(x, y, z, dt, params, out);
    if (!Number.isFinite(out[0]) || !Number.isFinite(out[1]) || !Number.isFinite(out[2])) {
      throw new Error(`Non-finite delta at step ${i}: ${[out[0], out[1], out[2]]}`);
    }
    x += out[0];
    y += out[1];
    z += out[2];
  }
  return [x, y, z];
}

describe("chaos equations", () => {
  for (const [name, { eq, params, bound }] of Object.entries(ATTRACTOR_DEFAULTS)) {
    it(`${name}: shape, bounded, deterministic`, () => {
      const out = new Float32Array(3);
      eq(0.1, 0, 0, DT, params, out);
      for (const v of out) {
        expect(Number.isFinite(v)).toBe(true);
      }
      const [x, y, z] = runAttractor(eq, params, STEPS, DT);
      expect(Math.abs(x)).toBeLessThan(bound);
      expect(Math.abs(y)).toBeLessThan(bound);
      expect(Math.abs(z)).toBeLessThan(bound);
      const a = runAttractor(eq, params, 100, DT);
      const b = runAttractor(eq, params, 100, DT);
      expect(a).toEqual(b);
    });
  }
});

describe("Lorenz regression — known trajectory", () => {
  it("matches the pinned trajectory", () => {
    let [x, y, z] = [0.1, 0, 0];
    const out = new Float32Array(3);
    for (let i = 0; i < 50; i++) {
      LorenzEquation(x, y, z, DT, { a: 10, b: 28, c: 2.67 }, out);
      x += out[0];
      y += out[1];
      z += out[2];
    }
    expect(x).toBeCloseTo(-1.7343800604343413, 8);
    expect(y).toBeCloseTo(0.883889801800251, 8);
    expect(z).toBeCloseTo(-3.0528380908071995, 8);
  });
});
