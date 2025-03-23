export const commonAttractorControls = {
  dt: { value: 0.005, min: 0.001, max: 0.02, step: 0.001 },
  Npoints: { value: 50, min: 1, max: 100, step: 1 },
  trailLength: { value: 100, min: 10, max: 500, step: 10 },
  lowSpeedHex: { value: "#0000ff" },
  highSpeedHex: { value: "#ff0000" },
  globalScale: { value: 6, min: 1, max: 10, step: 0.1 },
  freeze: { button: () => {} },
  restart: { button: () => {} },
};
