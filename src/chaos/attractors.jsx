import { folder, useControls } from "leva";
import { useMemo } from "react";
import ChaosManager from "./ChaosManager.jsx";
import {
  AizawaEquation,
  ArneodoEquation,
  BoualiEquation,
  BurkeShawEquation,
  ChenLeeEquation,
  ChuaEquation,
  DadrasEquation,
  HalvorsenEquation,
  LorenzEquation,
  NewtonLeipnikEquation,
  NoseHooverEquation,
  RabinovichFabrikantEquation,
  RosslerEquation,
  SprottEquation,
  ThomasEquation,
} from "./equations.js";

const _k1 = new Float32Array(3);
const _k2 = new Float32Array(3);
const _k3 = new Float32Array(3);
const _k4 = new Float32Array(3);
const rk4RabinovichFabrikant = (x, y, z, dt, p, out) => {
  RabinovichFabrikantEquation(x, y, z, dt, p, _k1);
  RabinovichFabrikantEquation(x + 0.5 * _k1[0], y + 0.5 * _k1[1], z + 0.5 * _k1[2], dt, p, _k2);
  RabinovichFabrikantEquation(x + 0.5 * _k2[0], y + 0.5 * _k2[1], z + 0.5 * _k2[2], dt, p, _k3);
  RabinovichFabrikantEquation(x + _k3[0], y + _k3[1], z + _k3[2], dt, p, _k4);
  out[0] = (_k1[0] + 2 * _k2[0] + 2 * _k3[0] + _k4[0]) / 6;
  out[1] = (_k1[1] + 2 * _k2[1] + 2 * _k3[1] + _k4[1]) / 6;
  out[2] = (_k1[2] + 2 * _k2[2] + 2 * _k3[2] + _k4[2]) / 6;
};

export const ATTRACTORS = [
  { id: "Lorenz", group: "Classic", scale: 1, eq: LorenzEquation, params: {
    a: { value: 10, min: 5, max: 20, step: 0.5 },
    b: { value: 28, min: 15, max: 45, step: 1 },
    c: { value: 2.67, min: 1, max: 5, step: 0.01 },
  } },
  { id: "Halvorsen", group: "Classic", scale: 1, eq: HalvorsenEquation, params: {
    a: { value: 1.4, min: 1.0, max: 2.5, step: 0.05 },
  } },
  { id: "Rossler", group: "Classic", scale: 2, eq: RosslerEquation, params: {
    a: { value: 0.2, min: 0, max: 0.4, step: 0.01 },
    b: { value: 0.2, min: 0, max: 0.4, step: 0.01 },
    c: { value: 5.7, min: 2, max: 10, step: 0.1 },
  } },
  { id: "Thomas", group: "Classic", scale: 5, eq: ThomasEquation, params: {
    b: { value: 0.19, min: 0.12, max: 0.3, step: 0.01 },
  } },
  { id: "Sprott", group: "Classic", scale: 4, eq: SprottEquation, params: {
    a: { value: 1, min: -1.5, max: 1.5, step: 0.01 },
  } },
  { id: "Aizawa", group: "Polynomial", scale: 10, eq: AizawaEquation, params: {
    a: { value: 0.95, min: 0, max: 1.5, step: 0.01 },
    b: { value: 0.7, min: 0, max: 1.5, step: 0.01 },
    c: { value: 0.6, min: 0, max: 1.5, step: 0.01 },
    d: { value: 3.5, min: 0, max: 6, step: 0.1 },
    e: { value: 0.25, min: 0, max: 0.8, step: 0.01 },
    f: { value: 0.1, min: 0, max: 0.8, step: 0.01 },
  } },
  { id: "Bouali", group: "Polynomial", scale: 10, eq: BoualiEquation, params: {
    a: { value: 0.3, min: 0, max: 0.8, step: 0.01 },
    b: { value: 1, min: 0, max: 2, step: 0.01 },
    c: { value: 1, min: 0, max: 2, step: 0.01 },
  } },
  { id: "ChenLee", group: "Polynomial", scale: 3, eq: ChenLeeEquation, params: {
    a: { value: 0.9, min: 0, max: 5, step: 0.1 },
    b: { value: -3, min: -10, max: 0, step: 0.1 },
    c: { value: -0.38, min: -1, max: 1, step: 0.01 },
  } },
  { id: "BurkeShaw", group: "Polynomial", scale: 2, eq: BurkeShawEquation, params: {
    a: { value: 10, min: 5, max: 18, step: 0.1 },
    b: { value: 13, min: 5, max: 18, step: 0.1 },
  } },
  { id: "Dadras", group: "Polynomial", scale: 2, eq: DadrasEquation, params: {
    a: { value: 3, min: 1, max: 5, step: 0.1 },
    b: { value: 2.7, min: 1, max: 4, step: 0.1 },
    c: { value: 1.7, min: 1, max: 3, step: 0.1 },
    d: { value: 2, min: 1, max: 3, step: 0.1 },
    e: { value: 9, min: 5, max: 12, step: 0.1 },
  } },
  { id: "RabinovichFabrikant", group: "Polynomial", scale: 1, eq: rk4RabinovichFabrikant, params: {
    alpha: { value: 0.14, min: 0.05, max: 0.4, step: 0.01 },
    gamma: { value: 0.1, min: 0, max: 0.2, step: 0.01 },
  } },
  { id: "Chua", group: "Other", scale: 7, eq: ChuaEquation, params: {
    a: { value: 0.1, min: 0, max: 1, step: 0.01 },
    b: { value: -0.48, min: -2, max: 0, step: 0.01 },
    k: { value: 1, min: 0, max: 2, step: 0.01 },
    p: { value: -1.3, min: -3, max: 0, step: 0.01 },
    q: { value: -0.0136, min: -0.1, max: 0, step: 0.0001 },
    r: { value: -0.0297, min: -0.1, max: 0, step: 0.0001 },
  } },
  { id: "NewtonLeipnik", group: "Other", scale: 10, eq: NewtonLeipnikEquation, params: {
    a: { value: 0.4, min: 0, max: 1, step: 0.01 },
    b: { value: 0.175, min: 0, max: 0.5, step: 0.001 },
  } },
  { id: "NoseHoover", group: "Other", scale: 5, eq: NoseHooverEquation, params: {
    a: { value: 1.5, min: 0.5, max: 3, step: 0.01 },
  } },
  { id: "Arneodo", group: "Other", scale: 3, eq: ArneodoEquation, params: {
    a: { value: 5.5, min: 0, max: 7, step: 0.1 },
    b: { value: 3.5, min: 0, max: 7, step: 0.1 },
    c: { value: 1, min: 0, max: 3, step: 0.1 },
  } },
];

const schema = Object.fromEntries(
  [...new Set(ATTRACTORS.map((a) => a.group))].map((g) => [
    g,
    folder(
      Object.fromEntries(
        ATTRACTORS.filter((a) => a.group === g).map((a) => [
          a.id,
          { value: a.id === "Halvorsen", label: a.id.replace(/([a-z])([A-Z])/g, "$1-$2") },
        ]),
      ),
      { collapsed: true },
    ),
  ]),
);

export const AttractorManager = ({ globalScale }) => {
  const selections = useControls({
    Attractors: folder(schema, { collapsed: false, order: -10 }),
  });
  const active = ATTRACTORS.filter((a) => selections?.[a.id]);
  const positions = useMemo(() => {
    const n = active.length;
    if (n === 0) return [];
    if (n === 1) return [[0, 0, 0]];
    const SPACING = 200;
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    return Array.from({ length: n }, (_, i) => [
      ((i % cols) - (cols - 1) / 2) * SPACING,
      0,
      (Math.floor(i / cols) - (rows - 1) / 2) * SPACING,
    ]);
  }, [active.length]);
  return (
    <>
      {active.map((record, i) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const params = useControls({
          [record.id]: folder(record.params, { collapsed: true, order: -1 }),
        });
        const s = globalScale * record.scale;
        return (
          <group key={record.id} scale={[s, s, s]} position={positions[i]}>
            <ChaosManager equationFn={record.eq} params={params} />
          </group>
        );
      })}
    </>
  );
};
