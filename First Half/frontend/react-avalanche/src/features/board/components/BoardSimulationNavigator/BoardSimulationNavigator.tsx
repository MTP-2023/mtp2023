import React from "react";
import {
  FaChevronCircleLeft,
  FaChevronCircleRight,
  FaFastBackward,
  FaFastForward,
} from "react-icons/fa";
import { useBoard } from "../../context/BoardContext";

interface BoardSimulationNavigatorProps {
  handleBoardChange: (action: string) => void;
}

const BoardSimulationNavigator: React.FC<BoardSimulationNavigatorProps> = ({
  handleBoardChange,
}) => {
  return (
    <div className="navigation">
      <button onClick={() => handleBoardChange("first")}>
        <FaFastBackward />
      </button>

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
