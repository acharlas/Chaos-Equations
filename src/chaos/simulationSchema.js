import { folder } from "leva";

export const SIMULATION_SCHEMA = {
  Simulation: folder(
    {
      Npoints: { value: 500, min: 1, max: 1000, step: 1, label: "Particles" },
      trailLength: {
        value: 400,
        min: 100,
        max: 800,
        step: 10,
        label: "Trail Length",
      },
      globalScale: { value: 5, min: 2, max: 12, step: 0.1, label: "Global Scale" },
      timeScale: { value: 1.0, min: 0.25, max: 4, step: 0.05, label: "Time Scale" },
      freeze: { value: false, label: "Freeze" },
    },
    { collapsed: false, order: -5 },
  ),
  Colors: folder(
    {
      lowSpeedHex: { value: "#0000ff", label: "Low Speed Color" },
      highSpeedHex: { value: "#00ff00", label: "High Speed Color" },
    },
    { collapsed: false, order: -4 },
  ),
};
