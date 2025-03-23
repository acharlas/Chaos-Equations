import React from "react";
import { useControls } from "leva";
import HalvorsenAttractor from "./chaos/attractors/HalvorsenAttractor";
import LorenzAttractor from "./chaos/attractors/LorenzAttractor";
import AizawaAttractor from "./chaos/attractors/AizawaAttractor";
import ChenLeeAttractor from "./chaos/attractors/ChenLeeAttractor";

const AttractorManager = () => {
  const { attractor } = useControls({
    attractor: {
      value: "Halvorsen",
      options: {
        Halvorsen: "Halvorsen",
        Lorenz: "Lorenz",
        Aizawa: "Aizawa",
        Chen_Lee: "Chen-Lee",
      },
    },
  });

  return (
    <>
      {attractor === "Halvorsen" && <HalvorsenAttractor />}
      {attractor === "Lorenz" && <LorenzAttractor />}
      {attractor === "Aizawa" && <AizawaAttractor />}
      {attractor === "Chen-Lee" && <ChenLeeAttractor />}
    </>
  );
};

export default AttractorManager;
