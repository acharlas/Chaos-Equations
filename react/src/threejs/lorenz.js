import EquationManager from "./equationManager";

const Lorenz = () => {
  const lorenzEquation = (x, y, z) => {
    const a = 10;
    const b = 28;
    const c = 8.0 / 3.0;
    const dt = 0.005;

    const dx = a * (y - x) * dt;
    const dy = (x * (b - z) - y) * dt;
    const dz = (x * y - c * z) * dt;
    return { dx, dy, dz };
  };

  return (
    <>
      <EquationManager equation={lorenzEquation} />
    </>
  );
};

export default Lorenz;
