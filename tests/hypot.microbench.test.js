import { describe, it, expect } from "vitest";

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function benchHypot(iterations) {
  const t0 = performance.now();
  let acc = 0;
  for (let i = 0; i < iterations; i++) {
    const dx = Math.sin(i) * 10;
    const dy = Math.cos(i) * 10;
    const dz = Math.sin(i * 0.5) * 10;
    acc += Math.hypot(dx, dy, dz);
  }
  return { ms: performance.now() - t0, acc };
}

function benchSqrt(iterations) {
  const t0 = performance.now();
  let acc = 0;
  for (let i = 0; i < iterations; i++) {
    const dx = Math.sin(i) * 10;
    const dy = Math.cos(i) * 10;
    const dz = Math.sin(i * 0.5) * 10;
    const sq = dx * dx + dy * dy + dz * dz;
    acc += Math.sqrt(sq);
  }
  return { ms: performance.now() - t0, acc };
}

const ITERATIONS = 10_000_000;
const REPEATS = 7;

describe("speed calc: hypot vs manual sqrt", () => {
  it(`measure both, ${REPEATS} repeats`, () => {
    const hypotTimes = [];
    const sqrtTimes = [];
    for (let i = 0; i < REPEATS; i++) {
      const h = benchHypot(ITERATIONS);
      hypotTimes.push(h.ms);
      const s = benchSqrt(ITERATIONS);
      sqrtTimes.push(s.ms);
    }
    const hMed = median(hypotTimes);
    const sMed = median(sqrtTimes);
    const ratio = hMed / sMed;
    console.log(
      `[bench] speed   hypot ${hMed.toFixed(1).padStart(6)} ms  sqrt ${sMed.toFixed(1).padStart(6)} ms  ratio ${ratio.toFixed(2)}x  (${ITERATIONS.toLocaleString()} iters)`,
    );
    expect(hMed).toBeGreaterThan(0);
    expect(sMed).toBeGreaterThan(0);
  });
});
