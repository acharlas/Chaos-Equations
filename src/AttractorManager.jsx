import React from "react";
import { useControls } from "leva";
import HalvorsenAttractor from "./chaos/attractors/HalvorsenAttractor";
import LorenzAttractor from "./chaos/attractors/LorenzAttractor";
import AizawaAttractor from "./chaos/attractors/AizawaAttractor";
import ChenLeeAttractor from "./chaos/attractors/ChenLeeAttractor";
import ThomasAttractor from "./chaos/attractors/ThomasAttractor";
import RosslerAttractor from "./chaos/attractors/RosslerAttractor";
import ChuaAttractor from "./chaos/attractors/ChuaAttractor";
import DadrasAttractor from "./chaos/attractors/DadrasAttractor";
import SprottAttractor from "./chaos/attractors/SprottAttractor";

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
        Rossler: "Rossler",
        Chua: "Chua",
        Dadras: "Dadras",
        Sprott: "Sprott",
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
      {attractor === "Rossler" && (
        <RosslerAttractor sharedParams={sharedParams} />
      )}
      {attractor === "Chua" && (
        <ChuaAttractor sharedParams={sharedParams} />
      )}
      {attractor === "Dadras" && (
        <DadrasAttractor sharedParams={sharedParams} />
      )}
      {attractor === "Sprott" && (
        <SprottAttractor sharedParams={sharedParams} />
      )}
    </>
  );
};

export default AttractorManager;
