import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Stats } from "@react-three/drei";
import { folder, useControls } from "leva";
import AttractorManager from "./AttractorManager";
import CameraResetButton from "./CameraResetButton";
import { getSceneControls } from "./controls/SceneControls";
import BenchmarkHarness from "./perf/BenchmarkHarness";
import AdvancedControls from "./chaos/AdvancedControls";

const Scene = () => {
  const Scene = useControls(getSceneControls());
  const { cameraDistance, showAdvanced, showStars, showStats } = useControls({
    View: folder(
      {
        cameraDistance: {
          value: 240,
          min: 80,
          max: 2000,
          step: 20,
          label: "Camera Distance",
        },
        showStars: { value: true, label: "Show Stars" },
        showStats: { value: false, label: "Show Stats" },
        showAdvanced: { value: false, label: "Show advanced" },
      },
      { collapsed: true, order: -6 },
    ),
  });

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
      dpr={[1, 2]}
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
      {showAdvanced && <AdvancedControls />}
      <OrbitControls ref={controlsRef} />
      <CameraResetButton controlsRef={controlsRef} />
    </Canvas>
  );
};

export default Scene;
