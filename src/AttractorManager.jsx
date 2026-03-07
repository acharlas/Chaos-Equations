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
import BoualiAttractor from "./chaos/attractors/BoualiAttractor";
import BurkeShawAttractor from "./chaos/attractors/BurkeShawAttractor";
import NewtonLeipnikAttractor from "./chaos/attractors/NewtonLeipnikAttractor";
import NoseHooverAttractor from "./chaos/attractors/NoseHooverAttractor";
import ArneodoAttractor from "./chaos/attractors/ArneodoAttractor";

const ATTRACTOR_COMPONENTS = {
  Halvorsen: HalvorsenAttractor,
  Lorenz: LorenzAttractor,
  Aizawa: AizawaAttractor,
  ChenLee: ChenLeeAttractor,
  Thomas: ThomasAttractor,
  Rossler: RosslerAttractor,
  Chua: ChuaAttractor,
  Dadras: DadrasAttractor,
  Sprott: SprottAttractor,
  Bouali: BoualiAttractor,
  BurkeShaw: BurkeShawAttractor,
  NewtonLeipnik: NewtonLeipnikAttractor,
  NoseHoover: NoseHooverAttractor,
  Arneodo: ArneodoAttractor,
};

const AttractorManager = ({ sharedParams }) => {
  const { attractor } = useControls({
    attractor: {
      value: "Halvorsen",
      label: "Attractor",
      options: {
        Halvorsen: "Halvorsen",
        Lorenz: "Lorenz",
        Aizawa: "Aizawa",
        "Chen-Lee": "ChenLee",
        Thomas: "Thomas",
        Rossler: "Rossler",
        Chua: "Chua",
        Dadras: "Dadras",
        Sprott: "Sprott",
        Bouali: "Bouali",
        "Burke-Shaw": "BurkeShaw",
        "Newton-Leipnik": "NewtonLeipnik",
        "Nose-Hoover": "NoseHoover",
        Arneodo: "Arneodo",
      },
      order: -2,
    },
  });

  const Component = ATTRACTOR_COMPONENTS[attractor];
  return Component ? <Component sharedParams={sharedParams} /> : null;
};

export default AttractorManager;
