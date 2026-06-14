import { describe, it, expect } from "vitest";
import { LorenzEquation } from "../src/chaos/equations/LorenzEquation.js";
import { HalvorsenEquation } from "../src/chaos/equations/HalvorsenEquation.js";
import { AizawaEquation } from "../src/chaos/equations/AizawaEquation.js";
import { ChuaEquation } from "../src/chaos/equations/ChuaEquation.js";
import { RabinovichFabrikantEquation } from "../src/chaos/equations/RabinovichFabrikantEquation.js";
import { SprottEquation } from "../src/chaos/equations/SprottEquation.js";
import { ThomasEquation } from "../src/chaos/equations/ThomasEquation.js";
import { RosslerEquation } from "../src/chaos/equations/RosslerEquation.js";

const DEFAULTS = {
  Lorenz: { a: 10, b: 28, c: 2.67 },
  Halvorsen: { a: 1.4 },
  Aizawa: { a: 0.95, b: 0.7, c: 0.6, d: 3.5, e: 0.25, f: 0.1 },
  Chua: { a: 0.1, b: -0.48, k: 1, p: -1.3, q: -0.0136, r: -0.0297 },
  RabinovichFabrikant: { alpha: 0.14, gamma: 0.1 },
  Sprott: { a: 1 },
  Thomas: { b: 0.19 },
  Rossler: { a: 0.2, b: 0.2, c: 5.7 },
};

const EQUATIONS = {
  Lorenz: LorenzEquation,
  Halvorsen: HalvorsenEquation,
  Aizawa: AizawaEquation,
  Chua: ChuaEquation,
  RabinovichFabrikant: RabinovichFabrikantEquation,
  Sprott: SprottEquation,
  Thomas: ThomasEquation,
  Rossler: RosslerEquation,
};

function timeLoop(eq, params, npoints, substeps, frames, dt, withSpeed) {
  const pos = new Float32Array(npoints * 3);
  for (let i = 0; i < npoints; i++) {
    pos[i * 3] = Math.random() * 2 - 1;
    pos[i * 3 + 1] = Math.random() * 2 - 1;
    pos[i * 3 + 2] = Math.random() * 2 - 1;
  }
  const dtStep = dt / substeps;
  const out = new Float32Array(3);
  let speedSink = 0;
  const t0 = performance.now();
  for (let f = 0; f < frames; f++) {
    for (let p = 0; p < npoints; p++) {
      const x = pos[p * 3];
      const y = pos[p * 3 + 1];
      const z = pos[p * 3 + 2];
      for (let s = 0; s < substeps; s++) {
        eq(x, y, z, dtStep, params, out);
        const dx = out[0];
        const dy = out[1];
        const dz = out[2];
        pos[p * 3] = x + dx;
        pos[p * 3 + 1] = y + dy;
        pos[p * 3 + 2] = z + dz;
        if (withSpeed) {
          const speedSq = dx * dx + dy * dy + dz * dz;
          speedSink += Math.sqrt(speedSq);
        }
      }
    }
  }
  void speedSink;
  return performance.now() - t0;
}

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

const NPOINTS = 200;
const SUBSTEPS = 2;
const FRAMES = 1000;
const DT = 0.003;
const REPEATS = 5;

describe("integration throughput (CPU proxy)", () => {
  for (const [name, eq] of Object.entries(EQUATIONS)) {
    it(`${name}: eq-only ${NPOINTS} x ${SUBSTEPS} x ${FRAMES} (median of ${REPEATS})`, () => {
      const params = DEFAULTS[name];
      const times = [];
      for (let i = 0; i < REPEATS; i++) {
        times.push(timeLoop(eq, params, NPOINTS, SUBSTEPS, FRAMES, DT, false));
      }
      const med = median(times);
      const min = Math.min(...times);
      const max = Math.max(...times);
      const nsPerStep = (med * 1e6) / (NPOINTS * SUBSTEPS * FRAMES);
      const fps = (1000 * FRAMES) / med;
      console.log(
        `[bench] ${name.padEnd(22)} eq-only   median ${med.toFixed(1).padStart(6)} ms (min ${min.toFixed(1)} max ${max.toFixed(1)})  ${fps.toFixed(0).padStart(5)} fps equiv  ${nsPerStep.toFixed(0).padStart(4)} ns/step`,
      );
      expect(med).toBeGreaterThan(0);
    });

    it(`${name}: eq+speed ${NPOINTS} x ${SUBSTEPS} x ${FRAMES} (median of ${REPEATS})`, () => {
      const params = DEFAULTS[name];
      const times = [];
      for (let i = 0; i < REPEATS; i++) {
        times.push(timeLoop(eq, params, NPOINTS, SUBSTEPS, FRAMES, DT, true));
      }
      const med = median(times);
      const min = Math.min(...times);
      const max = Math.max(...times);
      const nsPerStep = (med * 1e6) / (NPOINTS * SUBSTEPS * FRAMES);
      const fps = (1000 * FRAMES) / med;
      console.log(
        `[bench] ${name.padEnd(22)} +speed    median ${med.toFixed(1).padStart(6)} ms (min ${min.toFixed(1)} max ${max.toFixed(1)})  ${fps.toFixed(0).padStart(5)} fps equiv  ${nsPerStep.toFixed(0).padStart(4)} ns/step`,
      );
      expect(med).toBeGreaterThan(0);
    });
  }
});
