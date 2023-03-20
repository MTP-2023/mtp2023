import React from "react";
import leftImg from "../../assets/left.gif";
import "./BoardStyle.css";
import Switcher from "./components/switcher/Switcher";
import { useBoard } from "./context/BoardContext";

const Board = () => {
  const { board, loading, error } = useBoard();

  if (loading) return <div>Loading...</div>;

  if (error) return <div>Error</div>;

  const buildedBoard = [];

  for (let row = 0; row < board.length; row++) {
    const buildedRow = [];
    if (row % 2 === 0) {
      for (let col = 1; col < board[row].length - 1; col += 2) {
        buildedRow.push(
          <Switcher left={board[row][col]} right={board[row][col + 1]} />
        );
      }
    } else {
      for (let col = 0; col < board[row].length; col += 2) {
        buildedRow.push(
          <Switcher left={board[row][col]} right={board[row][col + 1]} />
        );
      }
    }
    buildedBoard.push(buildedRow);
  }

  return (
    <div className="board">
      {buildedBoard.map((row, index) => (
        <div
          key={index}
          className={`row ${index % 2 === 0 && "row--displace"}`}
        >
          {row}
        </div>
      ))}
    </div>
  );
};

export default Board;
