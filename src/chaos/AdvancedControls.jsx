import { folder, useControls } from "leva";

const AdvancedControls = () => {
  useControls({
    Performance: folder(
      {
        maxDpr: {
          value: 1.25,
          min: 0.75,
          max: 2,
          step: 0.1,
          label: "Render Resolution",
        },
      },
      { collapsed: true, order: 5 },
    ),
  });
  return null;
};

export default AdvancedControls;
