export const ATTRACTOR_SCALES = {
  Aizawa: 10,
  Arneodo: 3,
  Bouali: 10,
  BurkeShaw: 2,
  ChenLee: 3,
  Chua: 7,
  Dadras: 2,
  Halvorsen: 1,
  Lorenz: 1,
  NewtonLeipnik: 10,
  NoseHoover: 5,
  Rossler: 2,
  Sprott: 4,
  Thomas: 5,
};

export const getLocalScale = (attractorId) =>
  ATTRACTOR_SCALES[attractorId] ?? 1;
