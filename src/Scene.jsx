import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Stats } from "@react-three/drei";
import AttractorManager from "./AttractorManager";

const Scene = () => {
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
      <OrbitControls />
    </Canvas>
  );
};

export default Scene;
