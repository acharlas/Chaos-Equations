import React from "react";
import { Canvas, extend } from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
  Effects,
  Stats,
  BakeShadows,
} from "@react-three/drei";
import { UnrealBloomPass } from "three-stdlib";
import { folder, useControls } from "leva";
import AttractorManager from "./AttractorManager";

extend({ UnrealBloomPass });

const Scene = () => {
  // Leva control: a checkbox to enable/disable bloom.
  const { bloom, bloom_threshold, bloom_strength, bloom_radius } = useControls({
    Bloom: folder(
      {
        bloom: { value: false, label: "Bloom On" },
        bloom_threshold: { value: 0.5, min: 0, max: 1, step: 0.01 },
        bloom_strength: { value: 1.5, min: 0, max: 5, step: 0.01 },
        bloom_radius: { value: 0.5, min: 0, max: 5, step: 0.01 },
      },
      { order: 3 }
    ),
  });

  return (
    <Canvas
      shadows
      gl={{ antialias: false }}
      camera={{
        position: [-141.38865, -143.41807, -163.75726],
        fov: 75,
        near: 0.01,
        far: 1000,
      }}
    >
      <Stars />
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
      <BakeShadows />
      <OrbitControls />
    </Canvas>
  );
};

export default Scene;
