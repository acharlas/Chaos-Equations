import React, { useRef } from "react";
import { Canvas, extend } from "@react-three/fiber";
import { OrbitControls, Stars, Effects, Stats } from "@react-three/drei";
import { UnrealBloomPass } from "three-stdlib";
import { useControls } from "leva";
import AttractorManager from "./AttractorManager";
import CameraResetButton from "./CameraResetButton";
import { getSceneControls } from "./controls/SceneControls";

extend({ UnrealBloomPass });

const Scene = () => {
  const Scene = useControls(getSceneControls());

  const controlsRef = useRef();

  const {
    Npoints,
    trailLength,
    lowSpeedHex,
    highSpeedHex,
    speedContrast,
    globalScale,
    dt,
    substeps,
    showStats,
    showStars,
    maxDpr,
    maxTrailPoints,

    bloom,
    bloom_threshold,
    bloom_strength,
    bloom_radius,
  } = Scene;

  const sharedParams = {
    dt,
    substeps,
    Npoints,
    trailLength,
    lowSpeedHex,
    highSpeedHex,
    speedContrast,
    globalScale,
    maxTrailPoints,
  };

  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      dpr={[1, maxDpr]}
      camera={{
        position: [-140, -140, -160],
        fov: 75,
        near: 0.01,
        far: 3000,
      }}
    >
      {showStars && <Stars radius={1200} depth={1} />}
      {showStats && <Stats className="stats-panel" />}
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
