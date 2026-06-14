import { describe, it } from "vitest";
import { LorenzEquation } from "../src/chaos/equations/LorenzEquation.js";
import { HalvorsenEquation } from "../src/chaos/equations/HalvorsenEquation.js";
import { AizawaEquation } from "../src/chaos/equations/AizawaEquation.js";
import { ChuaEquation } from "../src/chaos/equations/ChuaEquation.js";
import { RabinovichFabrikantEquation } from "../src/chaos/equations/RabinovichFabrikantEquation.js";

const DEFAULTS = {
  Lorenz: { a: 10, b: 28, c: 2.67 },
  Halvorsen: { a: 1.4 },
  Aizawa: { a: 0.95, b: 0.7, c: 0.6, d: 3.5, e: 0.25, f: 0.1 },
  Chua: { a: 0.1, b: -0.48, k: 1, p: -1.3, q: -0.0136, r: -0.0297 },
  RabinovichFabrikant: { alpha: 0.14, gamma: 0.1 },
};

const EQUATIONS = {
  Lorenz: LorenzEquation,
  Halvorsen: HalvorsenEquation,
  Aizawa: AizawaEquation,
  Chua: ChuaEquation,
  RabinovichFabrikant: RabinovichFabrikantEquation,
};

function timeLoop(label, fn, iterations) {
  const t0 = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn(i);
  }
  return performance.now() - t0;
}

describe("integration throughput (CPU proxy)", () => {
  const NPOINTS = 200;
  const SUBSTEPS = 2;
  const FRAMES = 1000;
  const DT = 0.003;

  for (const [name, eq] of Object.entries(EQUATIONS)) {
    it(`${name}: ${NPOINTS} particles x ${SUBSTEPS} substeps x ${FRAMES} frames`, () => {
      const params = DEFAULTS[name];
      const pos = new Float32Array(NPOINTS * 3);
      for (let i = 0; i < NPOINTS; i++) {
        pos[i * 3] = Math.random() * 2 - 1;
        pos[i * 3 + 1] = Math.random() * 2 - 1;
        pos[i * 3 + 2] = Math.random() * 2 - 1;
      }
      const ms = timeLoop(
        name,
        () => {
          for (let p = 0; p < NPOINTS; p++) {
            const x = pos[p * 3];
            const y = pos[p * 3 + 1];
            const z = pos[p * 3 + 2];
            for (let s = 0; s < SUBSTEPS; s++) {
              const out = eq(x, y, z, DT / SUBSTEPS, params);
              pos[p * 3] = x + out[0];
              pos[p * 3 + 1] = y + out[1];
              pos[p * 3 + 2] = z + out[2];
            }
          }
        },
        FRAMES,
      );
      const totalSteps = NPOINTS * SUBSTEPS * FRAMES;
      const nsPerStep = (ms * 1e6) / totalSteps;
      const fps = (1000 * FRAMES) / ms;
      console.log(
        `[bench] ${name.padEnd(20)} ${ms.toFixed(1).padStart(7)} ms (${fps.toFixed(0).padStart(4)} fps equiv, ${nsPerStep.toFixed(0).padStart(4)} ns/step)`,
      );
    });
  }
});
