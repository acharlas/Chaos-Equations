import React from "react";

const AttractorWrapper = ({ globalScale, localScale = 1, children }) => {
  const scale = globalScale * localScale;
  return (
    <group scale={[scale, scale, scale]}>{children}</group>
  );
};

export default AttractorWrapper;
