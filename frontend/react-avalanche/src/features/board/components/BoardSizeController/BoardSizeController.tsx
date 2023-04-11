import React from "react";
import { useBoard } from "../../context/BoardContext";
import {
  FaChevronCircleLeft,
  FaChevronCircleRight,
  FaFastForward,
  FaMinus,
  FaPlus,
} from "react-icons/fa";

const BoardSizeController = () => {
  const {
    currentBoard,
    increaseHeight,
    decreaseHeight,
    increaseWidth,
    decreaseWidth,
  } = useBoard();
  if (!currentBoard || currentBoard.length === 0) return <div>Loading...</div>;
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
