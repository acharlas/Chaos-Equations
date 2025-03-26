import { folder } from "leva";

export const getSceneControls = () => ({
  Npoints: { value: 250, min: 1, max: 1000, step: 1, label: "Npoints" },
  trailLength: {
    value: 150,
    min: 10,
    max: 300,
    step: 10,
    label: "Trail Length",
  },
  lowSpeedHex: { value: "#0000ff" },
  highSpeedHex: { value: "#ff0000" },
  globalScale: { value: 6, min: 1, max: 10, step: 0.1, label: "Scale" },
  dt: { value: 0.005, min: 0.0001, max: 0.01, step: 0.001 },

  // Bloom controls (always displayed):
  bloom: { value: false, label: "Bloom" },
  bloom_options: folder(
    {
      bloom_threshold: {
        value: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Threshold",
      },
      bloom_strength: {
        value: 1.5,
        min: 0,
        max: 5,
        step: 0.01,
        label: "Strength",
      },
      bloom_radius: {
        value: 0.5,
        min: 0,
        max: 1.3,
        step: 0.01,
        label: "Radius",
      },
    },
    { collapsed: true }
  ),
});
