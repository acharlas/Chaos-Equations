import React, { useRef } from "react";
import { Canvas, extend } from "@react-three/fiber";
import { OrbitControls, Stars, Effects, Stats } from "@react-three/drei";
import { UnrealBloomPass } from "three-stdlib";
import { useControls } from "leva";
import AttractorManager from "./AttractorManager";
import CameraResetButton from "./CameraResetButton";
import { getSceneControls } from "./controls/SceneControls";
import BenchmarkHarness from "./perf/BenchmarkHarness";

extend({ UnrealBloomPass });

const Scene = () => {
  const Scene = useControls(getSceneControls());
  const { cameraDistance } = useControls(
    "View",
    {
      cameraDistance: {
        value: 240,
        min: 80,
        max: 2000,
        step: 20,
        label: "Camera Distance",
      },
    },
    { collapsed: true },
  );

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
  };

  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      dpr={[1, maxDpr]}
      camera={{
        position: [
          -cameraDistance * 0.7,
          -cameraDistance * 0.7,
          -cameraDistance * 0.8,
        ],
        fov: 75,
        near: 0.01,
        far: 5000,
      }}
    >
      {showStars && <Stars radius={1200} depth={1} />}
      {showStats && <Stats className="stats-panel" />}
      <BenchmarkHarness />
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
