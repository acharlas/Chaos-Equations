export class FrameProfiler {
  constructor(capacity = 1800) {
    this.capacity = capacity;
    this.frames = new Float32Array(capacity);
    this.timestamps = new Float32Array(capacity);
    this.count = 0;
    this.lastTs = -1;
    this.startTs = -1;
    this.active = false;
  }

  tick(now) {
    if (!this.active) return;
    if (this.lastTs < 0) {
      this.lastTs = now;
      this.startTs = now;
      return;
    }
    const dt = now - this.lastTs;
    this.lastTs = now;
    if (this.count < this.capacity) {
      this.frames[this.count] = dt;
      this.timestamps[this.count] = now;
      this.count += 1;
    }
  }

  recordDelta(deltaMs) {
    if (!this.active) return;
    if (this.lastTs < 0) {
      this.lastTs = 0;
      this.startTs = 0;
    }
    if (this.count < this.capacity) {
      this.frames[this.count] = deltaMs;
      this.timestamps[this.count] =
        typeof performance !== "undefined" ? performance.now() : 0;
      this.count += 1;
    }
  }

  start() {
    this.count = 0;
    this.lastTs = -1;
    this.startTs = -1;
    this.active = true;
  }

  stop() {
    this.active = false;
  }

  reset() {
    this.count = 0;
    this.lastTs = -1;
    this.startTs = -1;
  }

  isActive() {
    return this.active;
  }

  getReport({ warmupFrames = 30 } = {}) {
    if (this.count <= warmupFrames) return null;
    const end = this.count;
    const start = warmupFrames;
    const n = end - start;
    const samples = Array.from(this.frames.subarray(start, end)).sort(
      (a, b) => a - b,
    );
    let sum = 0;
    for (let i = 0; i < n; i++) sum += samples[i];
    const durationSec =
      (this.timestamps[this.count - 1] - this.timestamps[warmupFrames]) / 1000;
    return {
      frames: n,
      durationSec,
      fps: 1000 / (sum / n),
      minMs: samples[0],
      maxMs: samples[n - 1],
      avgMs: sum / n,
      p50Ms: samples[Math.floor(n * 0.5)],
      p90Ms: samples[Math.floor(n * 0.9)],
      p95Ms: samples[Math.floor(n * 0.95)],
      p99Ms: samples[Math.floor(n * 0.99)],
    };
  }
}

export const formatReport = (report) => {
  if (!report) return "no samples";
  const fmt = (v) => v.toFixed(2).padStart(7);
  return [
    `frames:    ${report.frames}`,
    `duration:  ${report.durationSec.toFixed(2)}s`,
    `fps avg:   ${report.fps.toFixed(1)}`,
    `ms avg:    ${fmt(report.avgMs)}`,
    `ms p50:    ${fmt(report.p50Ms)}`,
    `ms p90:    ${fmt(report.p90Ms)}`,
    `ms p95:    ${fmt(report.p95Ms)}`,
    `ms p99:    ${fmt(report.p99Ms)}`,
    `ms min:    ${fmt(report.minMs)}`,
    `ms max:    ${fmt(report.maxMs)}`,
  ].join("\n");
};
