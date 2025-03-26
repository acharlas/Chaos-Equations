import React from "react";
import { useControls, button } from "leva";
import { useThree } from "@react-three/fiber";

const CameraResetButton = ({ controlsRef }) => {
  const { camera } = useThree();

  useControls({
    resetCamera: button(
      () => {
        camera.position.set(-140, -140, -160);
        if (camera.isOrthographicCamera) {
          camera.zoom = 1;
          camera.updateProjectionMatrix();
        }
        camera.lookAt(0, 0, 0);
        console.log("Camera reset to:", camera.position);
        if (controlsRef && controlsRef.current && controlsRef.current.reset) {
          controlsRef.current.reset();
        }
      },
      { label: "Reset camera" }
    ),
  });

  return null;
};

export default CameraResetButton;
