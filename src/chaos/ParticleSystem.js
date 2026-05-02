export class ParticleSystem {
  constructor(Npoints) {
    this.Npoints = Npoints;
    this.positions = new Float32Array(Npoints * 3);
    this.speeds = new Float32Array(Npoints);
  }

  restart(initialPositions) {
    const { Npoints, positions, speeds } = this;
    for (let i = 0; i < Npoints; i++) {
      const base = i * 3;
      const pos = initialPositions[i];
      positions[base] = pos[0];
      positions[base + 1] = pos[1];
      positions[base + 2] = pos[2];
      speeds[i] = 0;
    }
  }

  stepAll({ writeIndex, dt, substeps, equation, freeze, trailTarget, trailLength }) {
    const { Npoints, positions, speeds } = this;
    if (freeze) return;

    const steps = Math.max(1, substeps);
    const dtStep = dt / steps;

    for (let p = 0; p < Npoints; p++) {
      const base = p * 3;
      let x = positions[base];
      let y = positions[base + 1];
      let z = positions[base + 2];

      for (let s = 0; s < steps; s++) {
        const [dx, dy, dz] = equation(x, y, z, dtStep);

        if (s === steps - 1) {
          speeds[p] = dtStep !== 0 ? Math.hypot(dx, dy, dz) / dtStep : 0;
        }

        x += dx;
        y += dy;
        z += dz;
      }

      positions[base] = x;
      positions[base + 1] = y;
      positions[base + 2] = z;

      if (trailTarget && trailLength > 0 && typeof writeIndex === "number") {
        const target = trailTarget.current ?? trailTarget;
        const offset = (writeIndex * Npoints + p) * 3;
        target[offset] = x;
        target[offset + 1] = y;
        target[offset + 2] = z;
      }
    }
  }

  getPosition(p) {
    const base = p * 3;
    return {
      x: this.positions[base],
      y: this.positions[base + 1],
      z: this.positions[base + 2],
    };
  }

  getSpeed(p) {
    return this.speeds[p];
  }
}
