import React from "react";
import { useControls } from "leva";
import HalvorsenAttractor from "./chaos/attractors/HalvorsenAttractor";
import LorenzAttractor from "./chaos/attractors/LorenzAttractor";

const AttractorManager = () => {
  const { attractor } = useControls({
    attractor: {
      value: "Halvorsen",
      options: { Halvorsen: "Halvorsen", Lorenz: "Lorenz" },
    },
  });

  return (
    <>
      {attractor === "Halvorsen" && <HalvorsenAttractor />}
      {attractor === "Lorenz" && <LorenzAttractor />}
    </>
  );
};

export default AttractorManager;
