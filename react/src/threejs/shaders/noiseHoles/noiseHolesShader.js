import { useMemo, useRef } from "react";
import vertexShader from "./vertexShader";
import fragmentShader from "./fragmentShader";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, Mesh, PlaneGeometry, RawShaderMaterial } from "three";
import { shaderMaterial } from "@react-three/drei";

const meshLayersTest = ({ layers, uniforms }) => {
  let meshes = [];
  for (let i = 0; i < layers; i++) {
    const material = new RawShaderMaterial({
      uniforms: { ...uniforms, seed: { value: 1 } },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: DoubleSide,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new Mesh(new PlaneGeometry(1, 1, 32, 32), material);
    mesh.position.z = layers / 40 - i / (2 * layers);
    meshes.push(<li key={i}> {mesh}</li>);
  }
  return meshes;
};

const NoiseHolesShader = () => {
  const mesh = useRef();
  const layers = 10;

  const uniforms = useMemo(
    () => ({
      u_time: {
        value: 0.0,
      },
    }),
    []
  );

  useFrame(({ clock }) => {
    // mesh.current.material.uniforms.u_time.value = clock.getElapsedTime();
  });

  return (
    // <mesh
    //   ref={mesh}
    //   position={[0, 0, 0]}
    //   rotation={[-Math.PI / 2, 0, 0]} // for plane geometry
    //   scale={1.5}
    // >
    //   <planeGeometry args={[1, 1, 32, 32]} />
    //   {/* <icosahedronGeometry args={[1, 20]} /> */}
    //   <shaderMaterial
    //     fragmentShader={fragmentShader}
    //     vertexShader={vertexShader}
    //     uniforms={{ ...uniforms, seed: { value: 1 } }}
    //     side={DoubleSide}
    //   />
    // </mesh>
    <>
      <ul> {meshLayersTest(layers, uniforms)}</ul>
    </>
  );
};

export default NoiseHolesShader;
