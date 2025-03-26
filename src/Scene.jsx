import React, { useRef } from "react";
import { Canvas, extend } from "@react-three/fiber";
import { OrbitControls, Stars, Effects, Stats } from "@react-three/drei";
import { UnrealBloomPass } from "three-stdlib";
import { folder, useControls } from "leva";
import AttractorManager from "./AttractorManager";
import CameraResetButton from "./CameraResetButton";

extend({ UnrealBloomPass });

const Scene = () => {
  const { bloom, bloom_threshold, bloom_strength, bloom_radius } = useControls({
    Bloom: folder(
      {
        bloom: { value: false, label: "On" },
        bloom_threshold: {
          value: 0.5,
          min: 0,
          max: 1,
          step: 0.01,
          label: "threshold",
        },
        bloom_strength: {
          value: 1.5,
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
      { order: 1, collapsed: true }
    ),
  });

  const controlsRef = useRef();

  return (
    <Canvas
      shadows
      gl={{ antialias: false }}
      camera={{
        position: [-140, -140, -160],
        fov: 75,
        near: 0.01,
        far: 1000,
      }}
    >
      <Stars radius={260} depth={1} />
      <Stats />
      <AttractorManager />

      {bloom && (
        <Effects disableGamma>
          <unrealBloomPass
            threshold={bloom_threshold}
            strength={bloom_strength}
            radius={bloom_radius}
          />
        </Effects>
      )}
      <OrbitControls ref={controlsRef} />
      <CameraResetButton controlsRef={controlsRef} />
    </Canvas>
  );
};

export default Scene;
