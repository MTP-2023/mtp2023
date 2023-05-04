import React from "react";
import Board from "../../../board/Board";
import { BoardProvider, useBoard } from "../../../board/context/BoardContext";
import "./SandboxScreen.css";
import BoardSimulationNavigator from "../../../board/components/BoardSimulationNavigator/BoardSimulationNavigator";
import BoardSizeController from "../../../board/components/BoardSizeController/BoardSizeController";
import BoardDropper from "../../../board/components/BoardDropper/BoardDropper";
import useHandleBoard from "../../../board/hooks/useHandleBoard";

const SandboxScreen = () => {
  const { currentBoard: start, sizeControls } = useBoard();

  const { currentBoard, currentMarbles, handleMarbleDrop, handleBoardChange } =
    useHandleBoard(start);

  if (!start) return null;

  return (
    <div className="center">
      <BoardSizeController
        currentBoard={currentBoard}
        sizeControls={sizeControls}
      />
      <BoardSimulationNavigator handleBoardChange={handleBoardChange} />
      <BoardDropper
        currentBoard={currentBoard}
        handleMarbleDrop={handleMarbleDrop}
      />
      <Board currentMarbles={currentMarbles} currentBoard={currentBoard} />
    </div>
  );
};

export default SandboxScreen;
