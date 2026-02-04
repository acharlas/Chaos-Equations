import React from "react";
import { getLocalScale } from "./attractorScales";

// globalScale: user-controlled overall scale
// localScale: per-attractor baseline to normalize sizes
const AttractorWrapper = ({ globalScale, attractorId, localScale, children }) => {
  const resolvedLocalScale = localScale ?? getLocalScale(attractorId);
  const scale = globalScale * resolvedLocalScale;
  return (
    <group scale={[scale, scale, scale]}>{children}</group>
  );
};

export default AttractorWrapper;
