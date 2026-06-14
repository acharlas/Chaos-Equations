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
    },
    { collapsed: false, order: -4 },
  ),

  Effects: folder(
    {
      bloom: { value: false, label: "Bloom" },
      "Bloom Settings": folder(
        {
          bloom_threshold: {
            value: 0.35,
            min: 0,
            max: 1,
            step: 0.01,
            label: "Threshold",
          },
          bloom_strength: {
            value: 0.9,
            min: 0,
            max: 3,
            step: 0.01,
            label: "Strength",
          },
          bloom_radius: {
            value: 0.6,
            min: 0,
            max: 1.2,
            step: 0.01,
            label: "Radius",
          },
        },
        { collapsed: true },
      ),
    },
    { collapsed: true, order: -3 },
  ),
});
