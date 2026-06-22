import { useSyncExternalStore } from "react";

let _v = false;
const subs = new Set();

export const freezeStore = {
  subscribe(cb) {
    subs.add(cb);
    return () => subs.delete(cb);
  },
  get() {
    return _v;
  },
  set(v) {
    if (v === _v) return;
    _v = v;
    subs.forEach((cb) => cb());
  },
};

export const useFreeze = () =>
  useSyncExternalStore(freezeStore.subscribe, freezeStore.get, freezeStore.get);
