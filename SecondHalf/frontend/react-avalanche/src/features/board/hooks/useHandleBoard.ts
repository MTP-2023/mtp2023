import React from "react";
import { calculateBoard } from "../../../api/publicApi";

const useHandleBoard = (board: number[][]) => {
  const [boards, setBoards] = React.useState<number[][][]>([]);
  const [currentBoard, setCurrentBoard] = React.useState<number[][]>(board);

  const [marbles, setMarbles] = React.useState<number[][][]>([]);
  const [currentMarbles, setCurrentMarbles] = React.useState<number[][]>([]);

  const [boardIndex, setBoardIndex] = React.useState<number>(0);
  const [loadingDrop, setLoadingDrop] = React.useState<boolean>(false);
  const [errorDrop, setErrorDrop] = React.useState<boolean>(false);

  React.useEffect(() => {
    setCurrentBoard(board);
  }, [board]);

  React.useEffect(() => {
    if (!boards || boards.length === 0 || !marbles || marbles.length === 0)
      return;
    console.log("boardIndex", boardIndex);
    setCurrentBoard(boards[boardIndex]);

    setCurrentMarbles(marbles[boardIndex]);
  }, [boardIndex]);

  const handleMarbleDrop = async (column: number) => {
    if (!currentBoard) return;

    if (loadingDrop) return;

    if (boards.length > 0 && boardIndex != boards.length - 1) return;

    console.log("handleMarbleDrop", currentBoard, column);

    setLoadingDrop(true);
    try {
      const newBoard = await calculateBoard(currentBoard, column);

      console.log("newBoard", newBoard);
      const newBoards = newBoard.boards;
      setBoards(newBoards);
      setCurrentBoard(newBoards[0]);
      const newMarbles = newBoard.marbles;
      newMarbles.push([]);

      setMarbles(newMarbles);
      setCurrentMarbles(newMarbles[0]);

      setBoardIndex(0);
    } catch (e) {
      setErrorDrop(true);
    }
    setLoadingDrop(false);
  };

  React.useEffect(() => {
    console.log("boards2", boards);
    console.log("boardIndex2", boardIndex);
  }, [boards, boardIndex]);

  const handleBoardChange = (action: string) => {
    if (!boards || !marbles) return;

    console.log("handleBoardChange", boards, action);

    if (action == "back" && boardIndex > 0) {
      setBoardIndex((prev) => prev - 1);
    } else if (action == "forward" && boardIndex < boards.length - 1) {
      setBoardIndex((prev) => prev + 1);
    } else if (action == "last") {
      setBoardIndex(boards.length - 1);
    }
  };

  return {
    currentBoard,
    currentMarbles,
    handleMarbleDrop,
    handleBoardChange,
    loadingDrop,
    errorDrop,
  };
};

export default useHandleBoard;
