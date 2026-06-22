import { folder, useControls } from "leva";
import { useMemo } from "react";
import ChaosManager from "./ChaosManager.jsx";
import { ATTRACTORS } from "./attractorsData.js";

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
    positions.push([
      (col - (cols - 1) / 2) * SPACING,
      0,
      (row - (rows - 1) / 2) * SPACING,
    ]);
  }
  return positions;
};

const AttractorView = ({ record, position, globalScale }) => {
  const params = useControls({
    [record.id]: folder(record.params, { collapsed: true, order: -1 }),
  });
  const s = globalScale * record.scale;
  return (
    <group scale={[s, s, s]} position={position}>
      <ChaosManager equationFn={record.eq} params={params} />
    </group>
  );
};

export const AttractorManager = ({ globalScale }) => {
  const schema = useMemo(() => {
    const out = {};
    for (const group of new Set(ATTRACTORS.map((a) => a.group))) {
      const bucket = {};
      for (const a of ATTRACTORS) {
        if (a.group !== group) continue;
        bucket[a.id] = { value: a.id === "Halvorsen", label: a.label };
      }
      out[group] = folder(bucket, { collapsed: true });
    }
    return out;
  }, []);
  const selections = useControls({
    Attractors: folder(schema, { collapsed: false, order: -10 }),
  });
  const active = ATTRACTORS.filter((a) => selections?.[a.id]);
  const positions = useMemo(
    () => computeGridPositions(active.length),
    [active.length],
  );
  return (
    <>
      {active.map((record, i) => (
        <AttractorView
          key={record.id}
          record={record}
          position={positions[i]}
          globalScale={globalScale}
        />
      ))}
    </>
  );
};
