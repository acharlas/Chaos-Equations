import { folder } from "leva";

export const getSceneControls = () => ({
  Npoints: {
    value: 175,
    min: 1,
    max: 500,
    step: 1,
  },
  trailLength: {
    value: 150,
    min: 10,
    max: 500,
    step: 10,
    label: "Trail Length",
  },
  lowSpeedHex: { value: "#0000ff" },
  highSpeedHex: { value: "#00ff00" },
  globalScale: { value: 6, min: 1, max: 15, step: 0.1, label: "Scale" },
  dt: { value: 0.005, min: 0.0001, max: 0.01, step: 0.001 },

  bloom: { value: false, label: "Bloom" },
  bloom_options: folder(
    {
      bloom_threshold: {
        value: 0.4,
        min: 0,
        max: 1,
        step: 0.01,
        label: "threshold",
      },
      bloom_strength: {
        value: 1,
        min: 0,
        max: 5,
        step: 0.01,
        label: "strength",
      },
      bloom_radius: {
        value: 0.5,
        min: 0,
        max: 1.3,
        step: 0.01,
        label: "radius",
      },
    },
    { collapsed: true }
  ),
});
