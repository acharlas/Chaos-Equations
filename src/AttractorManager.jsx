import React from "react";
import { useControls } from "leva";
import HalvorsenAttractor from "./chaos/attractors/HalvorsenAttractor";
import LorenzAttractor from "./chaos/attractors/LorenzAttractor";
import AizawaAttractor from "./chaos/attractors/AizawaAttractor";
import ChenLeeAttractor from "./chaos/attractors/ChenLeeAttractor";
import ThomasAttractor from "./chaos/attractors/ThomasAttractor";

const AttractorManager = () => {
  const { attractor } = useControls({
    attractor: {
      value: "Halvorsen",
      options: {
        Halvorsen: "Halvorsen",
        Lorenz: "Lorenz",
        Aizawa: "Aizawa",
        ChenLee: "ChenLee",
        Thomas: "Thomas",
      },
      order: -2,
    },
  });

  return (
    <>
      {attractor === "Halvorsen" && <HalvorsenAttractor />}
      {attractor === "Lorenz" && <LorenzAttractor />}
      {attractor === "Aizawa" && <AizawaAttractor />}
      {attractor === "ChenLee" && <ChenLeeAttractor />}
      {attractor === "Thomas" && <ThomasAttractor />} {/* Render Thomas */}
    </>
  );
};

export default AttractorManager;
