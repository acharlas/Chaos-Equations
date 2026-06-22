import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { button, useControls } from "leva";
import { freezeStore } from "./chaos/freezeState";

const CameraAndControls = () => {
  const { camera } = useThree();
  const controlsRef = useRef();
  const { freeze } = useControls({
    freeze: { value: false, label: "Freeze" },
    resetCamera: button(() => {
      camera.position.set(-140, -140, -160);
      camera.lookAt(0, 0, 0);
      controlsRef.current?.reset?.();
    }, { label: "Reset Camera" }),
  });
  useEffect(() => freezeStore.set(freeze), [freeze]);
  return <OrbitControls ref={controlsRef} />;
};

export default CameraAndControls;
