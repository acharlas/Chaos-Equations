import { folder, useControls } from "leva";
import EquationManager from "./equationManager";

const ChenLee = () => {
  //GUI

  // const { a } = useControls({
  //     ChenLee: folder(
  //         {
  //             a: {
  //                 value: 1.5,
  //                 min: 0,
  //                 max: 10,
  //                 step: 0.1,
  //             },
  //         },
  //         { order: -1, collapsed: false }),
  //   })

  ///
  const ChenLeeEquation = (x, y, z) => {
    const dt = 0.004;
    const a = 5;
    const b = -10;
    const c = -0.38;

    const dx = (a * x - y * z) * dt;
    const dy = (b * y + x * z) * dt;
    const dz = (c * z + (x * y) / 3) * dt;
    return [dx, dy, dz];
  };

  return (
    <>
      <EquationManager
        equation={ChenLeeEquation}
        Sx={1}
        Sy={0}
        Sz={4.5}
        color={"yellow"}
      />
      {/* <EquationManager equation={ChenLeeEquation} Sx={1.5} Sy={0} Sz={0} color={"red"}/> */}
    </>
  );
};

export default ChenLee;
