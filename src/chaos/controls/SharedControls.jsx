export const commonAttractorControls = {
  Npoints: { value: 150, min: 1, max: 1000, step: 1 },
  trailLength: { value: 150, min: 10, max: 300, step: 10 },
  lowSpeedHex: { value: "#0000ff" },
  highSpeedHex: { value: "#ff0000" },
  globalScale: { value: 6, min: 1, max: 10, step: 0.1 },
  dt: { value: 0.005, min: 0.0001, max: 0.01, step: 0.001 },
  freeze: { button: () => {} },
  restart: { button: () => {} },
};
