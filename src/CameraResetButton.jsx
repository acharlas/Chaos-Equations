import { useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { button, useControls } from "leva";

const CameraAndControls = () => {
  const { camera } = useThree();
  const controlsRef = useRef();
  useControls({
    resetCamera: button(() => {
      camera.position.set(-140, -140, -160);
      camera.lookAt(0, 0, 0);
      controlsRef.current?.reset?.();
    }, { label: "Reset Camera" }),
  });
  return <OrbitControls ref={controlsRef} />;
};

export default CameraAndControls;
