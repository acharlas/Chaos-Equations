import { folder } from "leva";

export const getSceneControls = () => ({
  Simulation: folder(
    {
      Npoints: {
        value: 500,
        min: 1,
        max: 1000,
        step: 1,
        label: "Particles",
      },
      trailLength: {
        value: 400,
        min: 100,
        max: 800,
        step: 10,
        label: "Trail Length",
      },
      globalScale: {
        value: 5,
        min: 2,
        max: 12,
        step: 0.1,
        label: "Global Scale",
      },
      dt: {
        value: 0.003,
        min: 0.0002,
        max: 0.01,
        step: 0.0001,
        label: "Time Step",
      },
      substeps: {
        value: 2,
        min: 1,
        max: 6,
        step: 1,
        label: "Substeps",
      },
    },
    { collapsed: false, order: -5 },
  ),

  Colors: folder(
    {
      lowSpeedHex: { value: "#0000ff", label: "Low Speed Color" },
      highSpeedHex: { value: "#00ff00", label: "High Speed Color" },
      speedContrast: {
        value: 0.55,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Speed Color Boost",
      },
    },
    { collapsed: false, order: -4 },
  ),
});
