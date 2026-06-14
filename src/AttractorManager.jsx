import React, { useMemo } from "react";
import { folder, useControls } from "leva";
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
import RabinovichFabrikantAttractor from "./chaos/attractors/RabinovichFabrikantAttractor";

const ATTRACTORS = [
  { id: "Lorenz", label: "Lorenz", component: LorenzAttractor },
  { id: "Halvorsen", label: "Halvorsen", component: HalvorsenAttractor },
  { id: "Aizawa", label: "Aizawa", component: AizawaAttractor },
  { id: "ChenLee", label: "Chen-Lee", component: ChenLeeAttractor },
  { id: "Thomas", label: "Thomas", component: ThomasAttractor },
  { id: "Rossler", label: "Rossler", component: RosslerAttractor },
  { id: "Chua", label: "Chua", component: ChuaAttractor },
  { id: "Dadras", label: "Dadras", component: DadrasAttractor },
  { id: "Sprott", label: "Sprott", component: SprottAttractor },
  { id: "Bouali", label: "Bouali", component: BoualiAttractor },
  { id: "BurkeShaw", label: "Burke-Shaw", component: BurkeShawAttractor },
  {
    id: "NewtonLeipnik",
    label: "Newton-Leipnik",
    component: NewtonLeipnikAttractor,
  },
  { id: "NoseHoover", label: "Nose-Hoover", component: NoseHooverAttractor },
  { id: "Arneodo", label: "Arneodo", component: ArneodoAttractor },
  {
    id: "RabinovichFabrikant",
    label: "Rabinovich-Fabrikant",
    component: RabinovichFabrikantAttractor,
  },
];

const ATTRACTOR_BY_ID = Object.fromEntries(ATTRACTORS.map((a) => [a.id, a]));

const ATTRACTOR_GROUPS = [
  {
    label: "Classic",
    ids: ["Lorenz", "Halvorsen", "Rossler", "Thomas", "Sprott"],
  },
  {
    label: "Polynomial",
    ids: [
      "Aizawa",
      "Bouali",
      "ChenLee",
      "BurkeShaw",
      "Dadras",
      "RabinovichFabrikant",
    ],
  },
  {
    label: "Other",
    ids: ["Chua", "NewtonLeipnik", "NoseHoover", "Arneodo"],
  },
];

const SPACING = 200;

const computeGridPositions = (count) => {
  if (count === 0) return [];
  if (count === 1) return [[0, 0, 0]];
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const positions = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = (col - (cols - 1) / 2) * SPACING;
    const z = (row - (rows - 1) / 2) * SPACING;
    positions.push([x, 0, z]);
  }
  return positions;
};

const buildAttractorsSchema = () => {
  const schema = {};
  ATTRACTOR_GROUPS.forEach((group) => {
    const groupObj = {};
    group.ids.forEach((id) => {
      const meta = ATTRACTOR_BY_ID[id];
      groupObj[id] = { value: id === "Halvorsen", label: meta.label };
    });
    schema[group.label] = folder(groupObj, { collapsed: true });
  });
  return schema;
};

const AttractorManager = ({ sharedParams }) => {
  const selections = useControls({
    Attractors: folder(buildAttractorsSchema(), {
      collapsed: false,
      order: -10,
    }),
  });

  const selected = useMemo(() => {
    const out = [];
    ATTRACTOR_GROUPS.forEach((group) => {
      const groupVals = selections?.[group.label] ?? {};
      group.ids.forEach((id) => {
        if (groupVals[id]) out.push(id);
      });
    });
    return out;
  }, [selections]);

  const positions = useMemo(
    () => computeGridPositions(selected.length),
    [selected.length],
  );

  return (
    <>
      {selected.map((id, idx) => {
        const Component = ATTRACTOR_BY_ID[id]?.component;
        if (!Component) return null;
        return (
          <Component
            key={id}
            sharedParams={sharedParams}
            position={positions[idx]}
          />
        );
      })}
    </>
  );
};

export default AttractorManager;
