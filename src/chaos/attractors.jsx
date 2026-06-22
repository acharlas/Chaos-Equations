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
  return Array.from({ length: count }, (_, i) => [
    ((i % cols) - (cols - 1) / 2) * SPACING,
    0,
    (Math.floor(i / cols) - (rows - 1) / 2) * SPACING,
  ]);
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
  const groups = [...new Set(ATTRACTORS.map((a) => a.group))];
  const schema = Object.fromEntries(
    groups.map((g) => [
      g,
      folder(
        Object.fromEntries(
          ATTRACTORS.filter((a) => a.group === g).map((a) => [
            a.id,
            { value: a.id === "Halvorsen", label: a.label },
          ]),
        ),
        { collapsed: true },
      ),
    ]),
  );
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
