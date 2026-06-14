import { describe, it, expect } from "vitest";
import { updateAutoSpeedRange } from "../src/chaos/autoSpeedRange.js";

describe("updateAutoSpeedRange", () => {
  it("returns false on empty input", () => {
    const state = { min: 0, max: 1, initialized: false };
    expect(updateAutoSpeedRange([], state)).toBe(false);
    expect(updateAutoSpeedRange(null, state)).toBe(false);
    expect(state.initialized).toBe(false);
  });

  it("initializes the range on first sample (no smoothing)", () => {
    const state = { min: 0, max: 1, initialized: false };
    const speeds = [0.1, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5];
    updateAutoSpeedRange(speeds, state);
    expect(state.initialized).toBe(true);
    expect(state.min).toBeGreaterThan(0);
    expect(state.max).toBeGreaterThan(state.min);
  });

  it("smooths toward the new range on subsequent samples", () => {
    const state = { min: 0, max: 1, initialized: true };
    const speeds = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    updateAutoSpeedRange(speeds, state);
    expect(state.min).toBeGreaterThan(0);
    expect(state.max).toBeGreaterThan(1);
    expect(state.max).toBeLessThan(100);
  });

  it("avoids min == max (degenerate range)", () => {
    const state = { min: 5, max: 5, initialized: true };
    const speeds = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
    updateAutoSpeedRange(speeds, state);
    expect(state.max).toBeGreaterThan(state.min);
  });

  it("regression: keeps updating the range across multiple calls", () => {
    const state = { min: 0, max: 1, initialized: false };
    updateAutoSpeedRange([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], state);
    const firstMax = state.max;
    updateAutoSpeedRange([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], state);
    expect(state.max).toBeGreaterThan(firstMax);
  });
});
