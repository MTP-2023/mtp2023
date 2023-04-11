import React from "react";
import {
  FaChevronCircleLeft,
  FaChevronCircleRight,
  FaFastForward,
} from "react-icons/fa";
import { useBoard } from "../../context/BoardContext";

const BoardSimulationNavigator = () => {
  const { handleBoardChange } = useBoard();
  return (
    <div className="navigation">
      <button onClick={() => handleBoardChange("back")}>
        <FaChevronCircleLeft />
      </button>

      <button onClick={() => handleBoardChange("forward")}>
        <FaChevronCircleRight />
      </button>

      <button onClick={() => handleBoardChange("last")}>
        <FaFastForward />
      </button>
    </div>
  );
};

export default BoardSimulationNavigator;
