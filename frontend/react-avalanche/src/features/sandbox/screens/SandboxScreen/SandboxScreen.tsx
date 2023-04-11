import React from "react";
import Board from "../../../board/Board";
import { BoardProvider, useBoard } from "../../../board/context/BoardContext";
import "./SandboxScreen.css";
import BoardSimulationNavigator from "../../../board/components/BoardSimulationNavigator/BoardSimulationNavigator";
import BoardSizeController from "../../../board/components/BoardSizeController/BoardSizeController";
import BoardDropper from "../../../board/components/BoardDropper/BoardDropper";

const SandboxScreen = () => {
  const { currentBoard, currentMarbles, handleMarbleDrop } = useBoard();

  return (
    <div className="sandbox">
      <BoardSizeController />
      <BoardSimulationNavigator />
      <BoardDropper
        currentBoard={currentBoard}
        handleMarbleDrop={handleMarbleDrop}
      />
      <Board currentMarbles={currentMarbles} currentBoard={currentBoard} />
    </div>
  );
};

export default SandboxScreen;
