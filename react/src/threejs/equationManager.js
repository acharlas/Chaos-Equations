import { useRef } from "react";
import Sphere from "./sphere";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

const EquationManager = ({ equation, Sx, Sy, Sz, color }) => {
  // const {colorA, colorB} = useControls({
  //     colorA: '#ffff00',
  //     colorB: '#00ffff'
  // })
  const colorA = new THREE.Color("orange");
  const colorB = new THREE.Color("hotpink");

  const sphereMesh = useRef();
  const elapsedRef = useRef(0);

  useFrame((state, delta) => {
    elapsedRef.current += delta;
    if (elapsedRef.current >= 1 / 60) {
      const [x, y, z] = sphereMesh.current.position;
      let [dx, dy, dz] = equation(x, y, z);

      dx += x;
      dy += y;
      dz += z;
      sphereMesh.current.position.set(dx, dy, dz);

      elapsedRef.current = 0;
    }
  });

  return (
    <>
      <Sphere
        meshRef={sphereMesh}
        startPosition={[Sx, Sy, Sz]}
        trailColor={colorB}
      />
    </>
  );
};

export default EquationManager;
