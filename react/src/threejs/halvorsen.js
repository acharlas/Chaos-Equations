import { folder, useControls } from "leva";
import EquationManager from "./equationManager";
import StartingPointManager from "./startingPointManager";

const Halvorsen = () => {
  //GUI

  const { a } = useControls({
    Halvorsen: folder(
      {
        a: {
          value: 1.5,
          min: 1.4,
          max: 4,
          step: 0.05,
        },
      },
      { order: -1, collapsed: false }
    ),
  });

  ///
  const halvorsenEquation = (x, y, z) => {
    const dt = 0.005;

    const dx = (-a * x - 4 * y - 4 * z - y * y) * dt;
    const dy = (-a * y - 4 * z - 4 * x - z * z) * dt;
    const dz = (-a * z - 4 * x - 4 * y - x * x) * dt;
    return [dx, dy, dz];
  };

  return (
    <>
      <StartingPointManager Npoints={30} equation={halvorsenEquation} />
    </>
  );
};

export default Halvorsen;
