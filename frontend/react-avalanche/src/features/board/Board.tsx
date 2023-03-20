import React from "react";
import leftImg from "../../assets/left.gif";
import "./BoardStyle.css";
import Switcher from "./components/switcher/Switcher";
import { useBoard } from "./context/BoardContext";

const Board = () => {
  const { board, loadingStart, errorStart, handleMarbleDrop } = useBoard();

  if (loadingStart) return <div>Loading...</div>;

  if (errorStart) return <div>Error</div>;

  const buildedBoard = [];

  for (let row = 0; row < board.length; row++) {
    const buildedRow = [];
    let key = 0;
    if (row % 2 === 0) {
      for (let col = 1; col < board[row].length - 1; col += 2) {
        key++;
        buildedRow.push(
          <Switcher
            key={key}
            left={board[row][col]}
            right={board[row][col + 1]}
          />
        );
      }
    } else {
      for (let col = 0; col < board[row].length; col += 2) {
        key++;
        buildedRow.push(
          <Switcher
            key={key}
            left={board[row][col]}
            right={board[row][col + 1]}
          />
        );
      }
    }
    buildedBoard.push(buildedRow);
  }

  const buttons = [];

  for (let i = 1; i < board[0].length - 1; i++) {
    buttons.push(
      <button onClick={() => handleMarbleDrop(i - 1)} key={i}>
        {i}
      </button>
    );
  }

  return (
    <div className="board">
      <div className="board__switches__row--displace board__buttons">
        {buttons.map((button, index) => (
          <div key={index}>{button}</div>
        ))}
      </div>

      <div className="board__switches">
        {buildedBoard.map((row, index) => (
          <div
            key={index}
            className={`board__switches__row ${
              index % 2 === 0 && "board__switches__row--displace"
            }`}
          >
            {row}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;
