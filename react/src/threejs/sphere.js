import { Trail } from "@react-three/drei";
import { useControls } from "leva";

function Sphere({ meshRef, startPosition, trailColor }) {
  return (
    <Trail
      width={1} // Width of the line
      color={trailColor} // Color of the line
      length={50} // Length of the line
      attenuation={(t) => t} // A function to define the width in each point along it.
    >
      <mesh ref={meshRef} position={startPosition}>
        <sphereGeometry args={[0]} />
        <meshStandardMaterial />
      </mesh>
    </Trail>
  );
}

export default Sphere;
