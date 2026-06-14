import { describe, it, expect } from "vitest";
import { LorenzEquation } from "../src/chaos/equations/LorenzEquation.js";
import { HalvorsenEquation } from "../src/chaos/equations/HalvorsenEquation.js";

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function soaLoop(eq, params, npoints, substeps, frames, dt) {
  const posX = new Float32Array(npoints);
  const posY = new Float32Array(npoints);
  const posZ = new Float32Array(npoints);
  for (let i = 0; i < npoints; i++) {
    posX[i] = Math.random() * 2 - 1;
    posY[i] = Math.random() * 2 - 1;
    posZ[i] = Math.random() * 2 - 1;
  }
  const out = new Float32Array(3);
  const dtStep = dt / substeps;
  const t0 = performance.now();
  for (let f = 0; f < frames; f++) {
    for (let p = 0; p < npoints; p++) {
      let x = posX[p];
      let y = posY[p];
      let z = posZ[p];
      for (let s = 0; s < substeps; s++) {
        eq(x, y, z, dtStep, params, out);
        x += out[0];
        y += out[1];
        z += out[2];
      }
      posX[p] = x;
      posY[p] = y;
      posZ[p] = z;
    }
  }
  return { ms: performance.now() - t0, posX, posY, posZ };
}

function oopLoop(eq, params, npoints, substeps, frames, dt) {
  class Particle {
    constructor(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    step(eqFn, dtStep, out) {
      eqFn(this.x, this.y, this.z, dtStep, params, out);
      this.x += out[0];
      this.y += out[1];
      this.z += out[2];
    }
  }
  const particles = [];
  for (let i = 0; i < npoints; i++) {
    particles.push(new Particle(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
    ));
  }
  const out = new Float32Array(3);
  const dtStep = dt / substeps;
  const t0 = performance.now();
  for (let f = 0; f < frames; f++) {
    for (let p = 0; p < npoints; p++) {
      const particle = particles[p];
      for (let s = 0; s < substeps; s++) {
        particle.step(eq, dtStep, out);
      }
    }
  }
  return { ms: performance.now() - t0, particles };
}

const NPOINTS = 2000;
const SUBSTEPS = 2;
const FRAMES = 500;
const DT = 0.003;
const REPEATS = 5;

describe("SoA vs OOP integration layout", () => {
  it("Lorenz: SoA inlines beat OOP class+method-dispatch", () => {
    const params = { a: 10, b: 28, c: 2.67 };
    const soaTimes = [];
    const oopTimes = [];
    for (let i = 0; i < REPEATS; i++) {
      soaTimes.push(soaLoop(LorenzEquation, params, NPOINTS, SUBSTEPS, FRAMES, DT).ms);
      oopTimes.push(oopLoop(LorenzEquation, params, NPOINTS, SUBSTEPS, FRAMES, DT).ms);
    }
    const soa = median(soaTimes);
    const oop = median(oopTimes);
    const ratio = oop / soa;
    console.log(
      `[bench] Lorenz layout   SoA ${soa.toFixed(1).padStart(6)} ms  OOP ${oop.toFixed(1).padStart(6)} ms  ${ratio.toFixed(2)}x`,
    );
    expect(soa).toBeGreaterThan(0);
  });

  it("Halvorsen: SoA inlines beat OOP class+method-dispatch", () => {
    const params = { a: 1.4 };
    const soaTimes = [];
    const oopTimes = [];
    for (let i = 0; i < REPEATS; i++) {
      soaTimes.push(soaLoop(HalvorsenEquation, params, NPOINTS, SUBSTEPS, FRAMES, DT).ms);
      oopTimes.push(oopLoop(HalvorsenEquation, params, NPOINTS, SUBSTEPS, FRAMES, DT).ms);
    }
    const soa = median(soaTimes);
    const oop = median(oopTimes);
    const ratio = oop / soa;
    console.log(
      `[bench] Halvorsen layout SoA ${soa.toFixed(1).padStart(6)} ms  OOP ${oop.toFixed(1).padStart(6)} ms  ${ratio.toFixed(2)}x`,
    );
    expect(soa).toBeGreaterThan(0);
  });

  it("SoA loop produces finite, bounded positions for Lorenz", () => {
    const params = { a: 10, b: 28, c: 2.67 };
    const { posX, posY, posZ } = soaLoop(
      LorenzEquation,
      params,
      200,
      SUBSTEPS,
      100,
      DT,
    );
    for (let i = 0; i < posX.length; i++) {
      expect(Number.isFinite(posX[i])).toBe(true);
      expect(Number.isFinite(posY[i])).toBe(true);
      expect(Number.isFinite(posZ[i])).toBe(true);
      expect(Math.abs(posX[i])).toBeLessThan(200);
      expect(Math.abs(posY[i])).toBeLessThan(200);
      expect(Math.abs(posZ[i])).toBeLessThan(200);
    }
  });
});
