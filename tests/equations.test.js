// Smoke tests for the pure ODE equations. These are the integration kernels
// that ChaosManager relies on. We assert:
//   1. Each equation returns the documented shape (3 floats).
//   2. The default Leva parameterization keeps the attractor bounded — the
//      particles do not blow up to Infinity or collapse to NaN after a few
//      thousand steps. This is the contract the simulation depends on for
//      stable rendering.
//   3. Determinism: given the same inputs, equations return the same outputs
//      (so the upcoming SoA refactor can rely on reproducibility).

import { describe, it, expect } from "vitest";

import { AizawaEquation } from "../src/chaos/equations/AizawaEquation.js";
import { ArneodoEquation } from "../src/chaos/equations/ArneodoEquation.js";
import { BoualiEquation } from "../src/chaos/equations/BoualiEquation.js";
import { BurkeShawEquation } from "../src/chaos/equations/BurkeShawEquation.js";
import { ChenLeeEquation } from "../src/chaos/equations/ChenLeeEquation.js";
import { ChuaEquation } from "../src/chaos/equations/ChuaEquation.js";
import { DadrasEquation } from "../src/chaos/equations/DadrasEquation.js";
import { HalvorsenEquation } from "../src/chaos/equations/HalvorsenEquation.js";
import { LorenzEquation } from "../src/chaos/equations/LorenzEquation.js";
import { NewtonLeipnikEquation } from "../src/chaos/equations/NewtonLeipnikEquation.js";
import { NoseHooverEquation } from "../src/chaos/equations/NoseHooverEquation.js";
import { RabinovichFabrikantEquation } from "../src/chaos/equations/RabinovichFabrikantEquation.js";
import { RosslerEquation } from "../src/chaos/equations/RosslerEquation.js";
import { SprottEquation } from "../src/chaos/equations/SprottEquation.js";
import { ThomasEquation } from "../src/chaos/equations/ThomasEquation.js";

const STEPS = 5000;
const DT = 0.001;

const ATTRACTOR_DEFAULTS = {
  Aizawa: {
    eq: AizawaEquation,
    params: { a: 0.95, b: 0.7, c: 0.6, d: 3.5, e: 0.25, f: 0.1 },
    start: [0.1, 0.0, 0.0],
    bound: 5,
  },
  Arneodo: {
    eq: ArneodoEquation,
    params: { a: 5.5, b: 3.5, c: 1 },
    start: [0.1, 0.0, 0.0],
    bound: 30,
  },
  Bouali: {
    eq: BoualiEquation,
    params: { a: 0.3, b: 1, c: 1 },
    start: [0.1, 0.0, 0.0],
    bound: 30,
  },
  "Burke-Shaw": {
    eq: BurkeShawEquation,
    params: { a: 10, b: 13 },
    start: [0.1, 0.0, 0.0],
    bound: 5,
  },
  "Chen-Lee": {
    eq: ChenLeeEquation,
    params: { a: 0.9, b: -3, c: -0.38 },
    start: [0.1, 0.0, 0.0],
    bound: 30,
  },
  Chua: {
    eq: ChuaEquation,
    params: { a: 0.1, b: -0.48, k: 1, p: -1.3, q: -0.0136, r: -0.0297 },
    start: [0.1, 0.0, 0.0],
    bound: 5,
  },
  Dadras: {
    eq: DadrasEquation,
    params: { a: 3, b: 2.7, c: 1.7, d: 2, e: 9 },
    start: [0.1, 0.0, 0.0],
    bound: 30,
  },
  Halvorsen: {
    eq: HalvorsenEquation,
    params: { a: 1.4 },
    start: [0.1, 0.0, 0.0],
    bound: 20,
  },
  Lorenz: {
    eq: LorenzEquation,
    // Note: LorenzEquation applies a hard-coded x += 5; z += 25; offset
    // inside the function (intentional centering), so the "effective" start
    // is (5.1, 0, 25).
    params: { a: 10, b: 28, c: 2.67 },
    start: [0.1, 0.0, 0.0],
    bound: 60,
  },
  "Newton-Leipnik": {
    eq: NewtonLeipnikEquation,
    params: { a: 0.4, b: 0.175 },
    start: [0.1, 0.0, 0.0],
    bound: 5,
  },
  "Nose-Hoover": {
    eq: NoseHooverEquation,
    params: { a: 1.5 },
    start: [0.1, 0.0, 0.0],
    bound: 10,
  },
  "Rabinovich-Fabrikant": {
    eq: RabinovichFabrikantEquation,
    params: { alpha: 0.14, gamma: 0.1 },
    start: [0.1, 0.0, 0.0],
    bound: 30,
  },
  Rossler: {
    eq: RosslerEquation,
    params: { a: 0.2, b: 0.2, c: 5.7 },
    start: [0.1, 0.0, 0.0],
    bound: 30,
  },
  Sprott: {
    eq: SprottEquation,
    params: { a: 1 },
    start: [0.1, 0.0, 0.0],
    bound: 5,
  },
  Thomas: {
    eq: ThomasEquation,
    params: { b: 0.19 },
    start: [0.1, 0.0, 0.0],
    bound: 5,
  },
};

function runAttractor(eq, params, start, steps, dt) {
  let [x, y, z] = start;
  for (let i = 0; i < steps; i++) {
    const out = eq(x, y, z, dt, params);
    if (out.length !== 3) {
      throw new Error(`Equation returned ${out.length} components, expected 3`);
    }
    const [dx, dy, dz] = out;
    if (!Number.isFinite(dx) || !Number.isFinite(dy) || !Number.isFinite(dz)) {
      throw new Error(`Non-finite delta at step ${i}: ${[dx, dy, dz]}`);
    }
    x += dx;
    y += dy;
    z += dz;
  }
  return [x, y, z];
}

describe("chaos equations", () => {
  for (const [name, { eq, params, start, bound }] of Object.entries(
    ATTRACTOR_DEFAULTS,
  )) {
    it(`${name} returns 3 finite components at default parameters`, () => {
      const out = eq(0.1, 0, 0, DT, params);
      expect(out).toHaveLength(3);
      for (const v of out) expect(Number.isFinite(v)).toBe(true);
    });

    it(`${name} stays bounded after ${STEPS} steps at default parameters`, () => {
      const [x, y, z] = runAttractor(eq, params, start, STEPS, DT);
      expect(Number.isFinite(x)).toBe(true);
      expect(Number.isFinite(y)).toBe(true);
      expect(Number.isFinite(z)).toBe(true);
      expect(Math.abs(x)).toBeLessThan(bound);
      expect(Math.abs(y)).toBeLessThan(bound);
      expect(Math.abs(z)).toBeLessThan(bound);
    });

    it(`${name} is deterministic`, () => {
      const a = runAttractor(eq, params, start, 100, DT);
      const b = runAttractor(eq, params, start, 100, DT);
      expect(a).toEqual(b);
    });
  }
});

describe("Lorenz regression — known trajectory", () => {
  // Pin down the first 50 steps of Lorenz from the default start with the
  // default parameters and a small dt. If a refactor of the integration loop
  // changes anything (different substep ordering, different equation signature,
  // different dt application), this test will fail. Updates only on purpose.
  it("matches the pinned trajectory", () => {
    let [x, y, z] = [0.1, 0, 0];
    const pinned = [];
    for (let i = 0; i < 50; i++) {
      const [dx, dy, dz] = LorenzEquation(x, y, z, DT, {
        a: 10,
        b: 28,
        c: 2.67,
      });
      x += dx;
      y += dy;
      z += dz;
      pinned.push([x, y, z]);
    }
    // Hash the final step tightly so any small divergence trips the test.
    const final = pinned[pinned.length - 1];
    expect(final[0]).toBeCloseTo(-1.7343800535092093, 8);
    expect(final[1]).toBeCloseTo(0.8838898032359346, 8);
    expect(final[2]).toBeCloseTo(-3.0528380994475044, 8);
  });
});
