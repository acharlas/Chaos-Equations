import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Effects } from "@react-three/drei";
import AttractorManager from "./AttractorManager";
import { UnrealBloomPass } from "three-stdlib";
import { extend } from "@react-three/fiber";

import LogCameraButton from "./LogCamera";

// We wrap UnrealBloomPass in a wrapper if needed, or use the wrapper approach as shown before.
// For simplicity, here we assume you use the wrapper (or the custom declaration method).
extend({ UnrealBloomPass });

const Scene = () => {
  return (
    <Canvas
      shadows
      gl={{ antialias: false }}
      camera={{
        position: [-141.38865, -143.41807, -163.75726],
        fov: 75,
        near: 0.1,
        far: 1000,
      }}
    >
      <Stars />
      <hemisphereLight intensity={0.8} color="#eaeaea" groundColor="blue" />
      <directionalLight
        castShadow
        intensity={10.8}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
        position={[10, 10, -10]}
      />
      <AttractorManager />
      <Effects disableGamma>
        {/* <unrealBloomPass threshold={1} strength={1.0} radius={0.7} /> */}
      </Effects>

      <OrbitControls />

      <LogCameraButton/>
    </Canvas>
  );
};

export default Scene;
