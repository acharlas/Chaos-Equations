import React from "react";
import { useControls } from "leva";
import HalvorsenAttractor from "./chaos/attractors/HalvorsenAttractor";
import LorenzAttractor from "./chaos/attractors/LorenzAttractor";
import AizawaAttractor from "./chaos/attractors/AizawaAttractor";
import ChenLeeAttractor from "./chaos/attractors/ChenLeeAttractor";
import ThomasAttractor from "./chaos/attractors/ThomasAttractor";

const AttractorManager = ({ sharedParams }) => {
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
      {attractor === "Halvorsen" && (
        <HalvorsenAttractor sharedParams={sharedParams} />
      )}
      {attractor === "Lorenz" && (
        <LorenzAttractor sharedParams={sharedParams} />
      )}
      {attractor === "Aizawa" && (
        <AizawaAttractor sharedParams={sharedParams} />
      )}
      {attractor === "ChenLee" && (
        <ChenLeeAttractor sharedParams={sharedParams} />
      )}
      {attractor === "Thomas" && (
        <ThomasAttractor sharedParams={sharedParams} />
      )}
    </>
  );
};

export default AttractorManager;
