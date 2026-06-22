import { useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { button, useControls } from "leva";

const useCameraReset = (camera, controlsRef) => {
  useControls({
    resetCamera: button(() => {
      camera.position.set(-140, -140, -160);
      if (camera.isOrthographicCamera) {
        camera.zoom = 1;
        camera.updateProjectionMatrix();
      }
      camera.lookAt(0, 0, 0);
      if (controlsRef?.current?.reset) {
        controlsRef.current.reset();
      }
    }, { label: "Reset Camera" }),
  });
};

const CameraAndControls = () => {
  const { camera } = useThree();
  const controlsRef = useRef();
  useCameraReset(camera, controlsRef);
  return <OrbitControls ref={controlsRef} />;
};

export default CameraAndControls;
