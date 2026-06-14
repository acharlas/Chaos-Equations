import React from "react";
import { getLocalScale } from "./attractorScales";

const AttractorWrapper = ({
  globalScale,
  attractorId,
  localScale,
  position,
  children,
}) => {
  const resolvedLocalScale = localScale ?? getLocalScale(attractorId);
  const scale = globalScale * resolvedLocalScale;
  return (
    <group scale={[scale, scale, scale]} position={position}>
      {children}
    </group>
  );
};

export default AttractorWrapper;
