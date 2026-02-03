import React, { useRef, useState } from "react";
import { Canvas, extend } from "@react-three/fiber";
import { OrbitControls, Stars, Effects, Stats } from "@react-three/drei";
import { UnrealBloomPass } from "three-stdlib";
import { folder, useControls, button } from "leva";
import AttractorManager from "./AttractorManager";
import CameraResetButton from "./CameraResetButton";
import { getSceneControls } from "./controls/SceneControls";

extend({ UnrealBloomPass });

const Scene = () => {
  const Scene = useControls({
    Scene: folder(getSceneControls()),
  });

  const controlsRef = useRef();

  const {
    Npoints,
    trailLength,
    lowSpeedHex,
    highSpeedHex,
    globalScale,
    dt,
    showStats,
    showStars,
    maxDpr,

    bloom,
    bloom_threshold,
    bloom_strength,
    bloom_radius,
  } = Scene;

  const sharedParams = {
    dt,
    Npoints,
    trailLength,
    lowSpeedHex,
    highSpeedHex,
    globalScale,
  };

  return (
    <Canvas
      shadows
      gl={{ antialias: false }}
      dpr={[1, maxDpr]}
      camera={{
        position: [-140, -140, -160],
        fov: 75,
        near: 0.01,
        far: 1000,
      }}
    >
      {showStars && <Stars radius={260} depth={1} />}
      {showStats && <Stats />}
      <AttractorManager sharedParams={sharedParams} />
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
