import React from "react";

const AttractorWrapper = ({ globalScale, children }) => {
  return (
    <group scale={[globalScale, globalScale, globalScale]}>{children}</group>
  );
};

export default AttractorWrapper;
