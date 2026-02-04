import { folder } from "leva";

export const getSceneControls = () => ({
  Simulation: folder(
    {
      Npoints: {
        value: 200,
        min: 1,
        max: 600,
        step: 1,
        label: "Particles",
      },
      trailLength: {
        value: 200,
        min: 100,
        max: 500,
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
    { collapsed: false }
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
    { collapsed: false }
  ),

  Performance: folder(
    {
      maxDpr: {
        value: 1.25,
        min: 0.75,
        max: 2,
        step: 0.1,
        label: "Render Resolution",
      },
      maxTrailPoints: {
        value: 300000,
        min: 50000,
        max: 800000,
        step: 10000,
        label: "Trail Budget (particles × trail length)",
      },
    },
    { collapsed: true }
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
        { collapsed: true }
      ),
    },
    { collapsed: true }
  ),

  View: folder(
    {
      showStats: { value: false, label: "Show Stats" },
      showStars: { value: true, label: "Show Stars" },
    },
    { collapsed: true }
  ),
});
