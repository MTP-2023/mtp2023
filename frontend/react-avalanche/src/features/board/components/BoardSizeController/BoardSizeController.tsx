import React from "react";
import { sizeControlsType, useBoard } from "../../context/BoardContext";
import {
  FaChevronCircleLeft,
  FaChevronCircleRight,
  FaFastForward,
  FaMinus,
  FaPlus,
} from "react-icons/fa";

interface BoardSimulationNavigatorProps {
  currentBoard: number[][];
  sizeControls: sizeControlsType;
}

const BoardSizeController: React.FC<BoardSimulationNavigatorProps> = ({
  sizeControls: {
    increaseHeight,
    decreaseHeight,
    increaseWidth,
    decreaseWidth,
  },
  currentBoard,
}) => {
  return (
    <div>
      <div className="board__dimensions">
        <div className="container">
          <button onClick={() => decreaseHeight()}>
            <FaMinus />
          </button>
          <p>Rows: {currentBoard.length}</p>
          <button onClick={() => increaseHeight()}>
            <FaPlus />
          </button>
        </div>

        <div className="container">
          <button onClick={() => decreaseWidth()}>
            <FaMinus />
          </button>
          <p>Columns: {currentBoard[0].length}</p>
          <button onClick={() => increaseWidth()}>
            <FaPlus />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardSizeController;
