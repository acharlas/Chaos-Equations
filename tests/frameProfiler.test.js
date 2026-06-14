import { describe, it, expect, beforeEach } from "vitest";
import { FrameProfiler, formatReport } from "../src/perf/frameProfiler.js";

describe("FrameProfiler", () => {
  let profiler;
  beforeEach(() => {
    profiler = new FrameProfiler(100);
  });

  it("ignores ticks when not active", () => {
    profiler.tick(0);
    expect(profiler.count).toBe(0);
  });

  it("records a delta between consecutive ticks", () => {
    profiler.start();
    profiler.tick(0);
    profiler.tick(16.67);
    profiler.tick(33.33);
    expect(profiler.count).toBe(2);
    expect(profiler.frames[0]).toBeCloseTo(16.67, 5);
    expect(profiler.frames[1]).toBeCloseTo(16.66, 5);
  });

  it("wraps the buffer when capacity is reached", () => {
    const small = new FrameProfiler(4);
    small.start();
    let t = 0;
    for (let i = 0; i < 10; i++) {
      t += 10;
      small.tick(t);
    }
    expect(small.count).toBe(4);
  });

  it("returns null when there are not enough samples past warmup", () => {
    profiler.start();
    for (let i = 0; i < 10; i++) profiler.tick(i * 16);
    expect(profiler.getReport({ warmupFrames: 30 })).toBe(null);
  });

  it("produces a stable report for a synthetic 60fps stream", () => {
    const big = new FrameProfiler(600);
    big.start();
    for (let i = 0; i < 500; i++) big.tick(i * 16.6667);
    const r = big.getReport({ warmupFrames: 30 });
    expect(r).not.toBe(null);
    expect(r.frames).toBe(469);
    expect(r.fps).toBeGreaterThan(59.5);
    expect(r.fps).toBeLessThan(60.5);
    expect(r.avgMs).toBeGreaterThan(16.5);
    expect(r.avgMs).toBeLessThan(16.8);
    expect(r.minMs).toBeGreaterThan(0);
    expect(r.maxMs).toBeGreaterThan(0);
  });

  it("detects a hitch (single 100ms frame) in a 60fps stream", () => {
    const big = new FrameProfiler(400);
    big.start();
    for (let i = 0; i < 60; i++) big.tick(i * 16.6667);
    big.tick(60 * 16.6667 + 100);
    for (let i = 0; i < 60; i++) {
      const t = 60 * 16.6667 + 100 + (i + 1) * 16.6667;
      big.tick(t);
    }
    const r = big.getReport({ warmupFrames: 30 });
    expect(r.maxMs).toBeGreaterThan(99);
  });

  it("stops collecting on stop()", () => {
    profiler.start();
    profiler.tick(0);
    profiler.tick(16);
    profiler.stop();
    const before = profiler.count;
    profiler.tick(32);
    expect(profiler.count).toBe(before);
  });

  it("reset() clears the buffer", () => {
    profiler.start();
    profiler.tick(0);
    profiler.tick(16);
    profiler.reset();
    expect(profiler.count).toBe(0);
    expect(profiler.lastTs).toBe(-1);
  });

  it("formatReport is human-readable", () => {
    const r = {
      frames: 600,
      durationSec: 10.0,
      fps: 60,
      minMs: 16.0,
      maxMs: 17.0,
      avgMs: 16.5,
      p50Ms: 16.5,
      p90Ms: 16.8,
      p95Ms: 16.9,
      p99Ms: 17.0,
    };
    const s = formatReport(r);
    expect(s).toContain("fps avg");
    expect(s).toContain("ms p99");
  });
});
