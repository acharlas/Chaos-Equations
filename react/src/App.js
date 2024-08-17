import { Canvas } from "@react-three/fiber";
import "./App.css";
import { OrbitControls, Sphere, Stars, Stats } from "@react-three/drei";
import Halvorsen from "./threejs/halvorsen";
import { button, useControls } from "leva";
import { MeshStandardMaterial } from "three";
import Shader from "./threejs/shaders/blob/blobShader";
import ChenLee from "./threejs/Chen-Lee";
import NoiseHolesShader from "./threejs/shaders/noiseHoles/noiseHolesShader";
import BlobShader from "./threejs/shaders/blob/blobShader";
import { useEffect, useState } from "react";

function App() {
  const [rerender, Setrender] = useState(true);
  const { render } = useControls({
    render: button(() => {
      Setrender((current) => !current);
    }),
  });
  useEffect(() => {
    console.log(rerender);
  }, [rerender]);

  return (
    <Canvas>
      <OrbitControls />
      <Stats />
      <axesHelper />

      <Stars />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />

      {rerender && <Halvorsen />}
    </Canvas>
  );
}

export default App;
