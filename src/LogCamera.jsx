import { useControls, button } from "leva";
import { useThree } from "@react-three/fiber";

const LogCameraButton = () => {
  const { camera } = useThree();

  useControls({
    logCamera: button(() => {
      console.log("Camera parameters:", camera);
      console.log("Position:", camera.position);
      console.log("Fov:", camera.fov);
      console.log("Aspect:", camera.aspect);
      console.log("Near:", camera.near);
      console.log("Far:", camera.far);
    }),
  });

  return null;
};

export default LogCameraButton;
