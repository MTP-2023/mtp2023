import React from "react";
import leftImg from "../../assets/left.gif";
import "./BoardStyle.css";
import { useBoard } from "./context/BoardContext";

const Board = () => {
  const { board } = useBoard();
  return (
    <div className="switch">
      <img src={leftImg} alt="left" />
    </div>
  );
};

export default Board;
