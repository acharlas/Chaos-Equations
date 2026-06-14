import { folder, useControls } from "leva";
import { extend } from "@react-three/fiber";
import { Effects } from "@react-three/drei";
import { UnrealBloomPass } from "three-stdlib";

extend({ UnrealBloomPass });

const AdvancedControls = () => {
  const { bloom, bloom_threshold, bloom_strength, bloom_radius } = useControls({
    Performance: folder(
      {
        maxDpr: {
          value: 1.25,
          min: 0.75,
          max: 2,
          step: 0.1,
          label: "Render Resolution",
        },
      },
      { collapsed: true, order: 5 },
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
      { collapsed: true, order: 6 },
    ),
  });

  return (
    <>
      {bloom && (
        <Effects disableGamma>
          <unrealBloomPass
            threshold={bloom_threshold}
            strength={bloom_strength}
            radius={bloom_radius}
          />
        </Effects>
      )}
    </>
  );
};

export default AdvancedControls;
