import { folder } from "leva";

export const getSceneControls = () => ({
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
  lowSpeedHex: { value: "#0000ff", label: "Low Speed Color" },
  highSpeedHex: { value: "#00ff00", label: "High Speed Color" },
  speedContrast: {
    value: 0.55,
    min: 0,
    max: 1,
    step: 0.01,
    label: "Speed Contrast",
  },
  globalScale: { value: 5, min: 2, max: 12, step: 0.1, label: "Global Scale" },
  Integration: folder(
    {
      dt: { value: 0.003, min: 0.0002, max: 0.01, step: 0.0001, label: "Time Step" },
      substeps: { value: 2, min: 1, max: 6, step: 1, label: "Substeps" },
    },
    { collapsed: true }
  ),

  showStats: { value: false, label: "Show Stats" },
  showStars: { value: true, label: "Show Stars" },
  maxDpr: { value: 1.25, min: 0.75, max: 2, step: 0.1, label: "Max Resolution (DPR)" },

  Performance: folder(
    {
      maxTrailPoints: {
        value: 300000,
        min: 50000,
        max: 800000,
        step: 10000,
        label: "Trail Budget (points)",
        hint: "Total points = particles × trail length",
      },
    },
    { collapsed: true }
  ),

  bloom: { value: false, label: "Bloom Effect" },
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
});
