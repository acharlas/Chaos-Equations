import { Canvas, extend } from "@react-three/fiber";
import { Stars, Effects } from "@react-three/drei";
import { UnrealBloomPass } from "three-stdlib";
import { folder, useControls } from "leva";
import { AttractorManager } from "./chaos/attractors.jsx";
import CameraAndControls from "./CameraResetButton.jsx";
import { SIMULATION_SCHEMA } from "./chaos/simulationSchema.js";

extend({ UnrealBloomPass });

const VIEW_SCHEMA = {
  View: folder(
    {
      showStars: { value: true, label: "Show Stars" },
    },
    { collapsed: true, order: -6 },
  ),
  Effects: folder(
    {
      bloom: { value: false, label: "Bloom" },
      "Bloom Settings": folder(
        {
          bloom_threshold: { value: 0.35, min: 0, max: 1, step: 0.01, label: "Threshold" },
          bloom_strength: { value: 0.9, min: 0, max: 3, step: 0.01, label: "Strength" },
          bloom_radius: { value: 0.6, min: 0, max: 1.2, step: 0.01, label: "Radius" },
        },
        { collapsed: true },
      ),
    },
    { collapsed: true, order: -3 },
  ),
};

const Scene = () => {
  const {
    showStars,
    bloom,
    bloom_threshold,
    bloom_strength,
    bloom_radius,
  } = useControls(VIEW_SCHEMA);
  const { globalScale } = useControls(SIMULATION_SCHEMA);
  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      dpr={[1, 2]}
      camera={{
        position: [-168, -168, -192],
        fov: 75,
        near: 0.01,
        far: 5000,
      }}
    >
      {showStars && <Stars radius={1200} depth={1} />}
      <AttractorManager globalScale={globalScale} />
      {bloom && (
        <Effects disableGamma>
          <unrealBloomPass
            threshold={bloom_threshold}
            strength={bloom_strength}
            radius={bloom_radius}
          />
        </Effects>
      )}
      <CameraAndControls />
    </Canvas>
  );
};

export default Scene;
