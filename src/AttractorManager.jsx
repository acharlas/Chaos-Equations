import React from "react";
import { useControls } from "leva";
import GenericAttractor from "./chaos/attractors/GenericAttractor";
import { ATTRACTOR_CONFIGS } from "./chaos/attractors/attractorConfigs";

const ATTRACTOR_OPTIONS = Object.fromEntries(
  Object.entries(ATTRACTOR_CONFIGS).map(([key, config]) => [config.label, key])
);

const DEFAULT_ATTRACTOR = "Halvorsen";

const AttractorManager = ({ sharedParams }) => {
  const { attractor } = useControls({
    attractor: {
      value: DEFAULT_ATTRACTOR,
      label: "Attractor",
      options: ATTRACTOR_OPTIONS,
      order: -2,
    },
  });

  const config = ATTRACTOR_CONFIGS[attractor];
  if (!config) return null;

  return <GenericAttractor key={attractor} config={{ ...config, id: attractor }} sharedParams={sharedParams} />;
};

export default AttractorManager;
