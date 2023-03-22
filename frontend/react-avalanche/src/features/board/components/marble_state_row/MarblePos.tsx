import React from "react";
import marble from "../../../../assets/marble.gif";

export type marblePos = {
  state: boolean;
};

const MarblePos: React.FC<marblePos> = ({ state }) => {
  if (state === true) {
    return (
      <div className="marbleRowElement">
        <div className="ball"></div>
      </div>
    );
  }

  if (state == false) {
    return <div className="marbleRowElement invisible"> /</div>;
  }

  return null;
};

export default MarblePos;
