import { AizawaEquation } from "../equations/AizawaEquation";
import { ArneodoEquation } from "../equations/ArneodoEquation";
import { BoualiEquation } from "../equations/BoualiEquation";
import { BurkeShawEquation } from "../equations/BurkeShawEquation";
import { ChenLeeEquation } from "../equations/ChenLeeEquation";
import { ChuaEquation } from "../equations/ChuaEquation";
import { DadrasEquation } from "../equations/DadrasEquation";
import { HalvorsenEquation } from "../equations/HalvorsenEquation";
import { LorenzEquation } from "../equations/LorenzEquation";
import { NewtonLeipnikEquation } from "../equations/NewtonLeipnikEquation";
import { NoseHooverEquation } from "../equations/NoseHooverEquation";
import { RabinovichFabrikantEquation } from "../equations/RabinovichFabrikantEquation";
import { RosslerEquation } from "../equations/RosslerEquation";
import { SprottEquation } from "../equations/SprottEquation";
import { ThomasEquation } from "../equations/ThomasEquation";

const rk4Integrator = (equationFn) => (x, y, z, dt) => {
  const k1 = equationFn(x, y, z, dt);
  const k2 = equationFn(x + k1[0] * 0.5, y + k1[1] * 0.5, z + k1[2] * 0.5, dt);
  const k3 = equationFn(x + k2[0] * 0.5, y + k2[1] * 0.5, z + k2[2] * 0.5, dt);
  const k4 = equationFn(x + k3[0], y + k3[1], z + k3[2], dt);
  return [
    (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) / 6,
    (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) / 6,
    (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]) / 6,
  ];
};

export const ATTRACTOR_CONFIGS = {
  Aizawa: {
    label: "Aizawa",
    params: {
      a: { value: 0.95, min: 0, max: 1.5, step: 0.01 },
      b: { value: 0.7, min: 0, max: 1.5, step: 0.01 },
      c: { value: 0.6, min: 0, max: 1.5, step: 0.01 },
      d: { value: 3.5, min: 0, max: 6, step: 0.1 },
      e: { value: 0.25, min: 0, max: 0.8, step: 0.01 },
      f: { value: 0.1, min: 0, max: 0.8, step: 0.01 },
    },
    createEquation: (p) => (x, y, z, dt) => AizawaEquation(x, y, z, dt, p),
  },
  Arneodo: {
    label: "Arneodo",
    params: {
      a: { value: 5.5, min: 0, max: 7, step: 0.1 },
      b: { value: 3.5, min: 0, max: 7, step: 0.1 },
      c: { value: 1, min: 0, max: 3, step: 0.1 },
    },
    createEquation: (p) => (x, y, z, dt) => ArneodoEquation(x, y, z, dt, p),
  },
  Bouali: {
    label: "Bouali",
    params: {
      a: { value: 0.3, min: 0, max: 0.8, step: 0.01 },
      b: { value: 1, min: 0, max: 2, step: 0.01 },
      c: { value: 1, min: 0, max: 2, step: 0.01 },
    },
    createEquation: (p) => (x, y, z, dt) => BoualiEquation(x, y, z, dt, p),
  },
  BurkeShaw: {
    label: "Burke-Shaw",
    params: {
      a: { value: 10, min: 5, max: 18, step: 0.1 },
      b: { value: 13, min: 5, max: 18, step: 0.1 },
    },
    createEquation: (p) => (x, y, z, dt) => BurkeShawEquation(x, y, z, dt, p),
  },
  ChenLee: {
    label: "Chen-Lee",
    params: {
      a: { value: 0.9, min: 0, max: 5, step: 0.1 },
      b: { value: -3, min: -10, max: 0, step: 0.1 },
      c: { value: -0.38, min: -1, max: 1, step: 0.01 },
    },
    createEquation: (p) => (x, y, z, dt) => ChenLeeEquation(x, y, z, dt, p),
  },
  Chua: {
    label: "Chua",
    params: {
      aParam: { value: 0.1, min: 0, max: 1, step: 0.01, label: "a" },
      bParam: { value: -0.48, min: -2, max: 0, step: 0.01, label: "b" },
      kParam: { value: 1, min: 0, max: 2, step: 0.01, label: "k" },
      pParam: { value: -1.3, min: -3, max: 0, step: 0.01, label: "p" },
      qParam: { value: -0.0136, min: -0.1, max: 0, step: 0.0001, label: "q" },
      rParam: { value: -0.0297, min: -0.1, max: 0, step: 0.0001, label: "r" },
    },
    createEquation: (p) => (x, y, z, dt) =>
      ChuaEquation(x, y, z, dt, {
        a: p.aParam,
        b: p.bParam,
        k: p.kParam,
        p: p.pParam,
        q: p.qParam,
        r: p.rParam,
      }),
  },
  Dadras: {
    label: "Dadras",
    params: {
      a: { value: 3, min: 1, max: 5, step: 0.1 },
      b: { value: 2.7, min: 1, max: 4, step: 0.1 },
      c: { value: 1.7, min: 1, max: 3, step: 0.1 },
      d: { value: 2, min: 1, max: 3, step: 0.1 },
      e: { value: 9, min: 5, max: 12, step: 0.1 },
    },
    createEquation: (p) => (x, y, z, dt) => DadrasEquation(x, y, z, dt, p),
  },
  Halvorsen: {
    label: "Halvorsen",
    params: {
      a: { value: 1.4, min: 1.0, max: 2.5, step: 0.05 },
    },
    createEquation: (p) => (x, y, z, dt) => HalvorsenEquation(x, y, z, dt, p),
  },
  Lorenz: {
    label: "Lorenz",
    params: {
      a: { value: 10, min: 5, max: 20, step: 0.5 },
      b: { value: 28, min: 15, max: 45, step: 1 },
      c: { value: 2.67, min: 1, max: 5, step: 0.01 },
    },
    createEquation: (p) => (x, y, z, dt) => LorenzEquation(x, y, z, dt, p),
    groupPosition: (p) => [0, 0, -(p.b - 1)],
  },
  NewtonLeipnik: {
    label: "Newton-Leipnik",
    params: {
      a: { value: 0.4, min: 0, max: 1, step: 0.01 },
      b: { value: 0.175, min: 0, max: 0.5, step: 0.001 },
    },
    createEquation: (p) => (x, y, z, dt) => NewtonLeipnikEquation(x, y, z, dt, p),
  },
  NoseHoover: {
    label: "Nose-Hoover",
    params: {
      a: { value: 1.5, min: 0.5, max: 3, step: 0.01 },
    },
    createEquation: (p) => (x, y, z, dt) => NoseHooverEquation(x, y, z, dt, p),
  },
  RabinovichFabrikant: {
    label: "Rabinovich-Fabrikant",
    params: {
      alpha: { value: 0.14, min: 0.05, max: 0.4, step: 0.01 },
      gamma: { value: 0.10, min: 0, max: 0.2, step: 0.01 },
    },
    createEquation: (p) =>
      rk4Integrator((x, y, z, dt) =>
        RabinovichFabrikantEquation(x, y, z, dt, p)
      ),
  },
  Rossler: {
    label: "Rossler",
    params: {
      a: { value: 0.2, min: 0, max: 0.4, step: 0.01 },
      b: { value: 0.2, min: 0, max: 0.4, step: 0.01 },
      c: { value: 5.7, min: 2, max: 10, step: 0.1 },
    },
    createEquation: (p) => (x, y, z, dt) => RosslerEquation(x, y, z, dt, p),
  },
  Sprott: {
    label: "Sprott",
    params: {
      a: { value: 1, min: -1.5, max: 1.5, step: 0.01 },
    },
    createEquation: (p) => (x, y, z, dt) => SprottEquation(x, y, z, dt, p),
  },
  Thomas: {
    label: "Thomas",
    params: {
      b: { value: 0.19, min: 0.12, max: 0.3, step: 0.01 },
    },
    createEquation: (p) => (x, y, z, dt) => ThomasEquation(x, y, z, dt, p),
  },
};
