import EquationManager from "./equationManager";

const StartingPointManager = ({ Npoints, equation }) => {
  const renderArray = [];

  for (let i = 0; i < Npoints; i++) {
    const x = Math.random();
    const y = Math.random();
    const z = Math.random();

    renderArray.push(
      <EquationManager
        equation={equation}
        Sx={x}
        Sy={y}
        Sz={z}
        color={"blue"}
        key={i}
      />
    );
    // console.log([x, y, z]);
    // console.log(renderArray);
  }
  return <>{renderArray}</>;
};

export default StartingPointManager;
