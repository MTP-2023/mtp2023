import React from "react";
import leftImg from "../../../../assets/left.gif";
import rightImg from "../../../../assets/right.gif";

export type switcher = {
  left: 0 | 1 | 2;
  right: 0 | 1 | 2;
};

const Switcher: React.FC<switcher> = ({ left, right }) => {
  if (left === 1) {
    return (
      <div className="switch">
        <img src={leftImg} />;
      </div>
    );
  }

  if (right === 1) {
    return (
      <div className="switch">
        <img src={rightImg} />
      </div>
    );
  }

  return null;
};

export default Switcher;
