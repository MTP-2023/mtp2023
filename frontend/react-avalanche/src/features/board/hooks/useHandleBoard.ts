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
    setCurrentBoard(boards[boardIndex]);

    setCurrentMarbles(marbles[boardIndex]);
  }, [boardIndex]);

  const handleMarbleDrop = async (column: number) => {
    if (!currentBoard) return;

    if (loadingDrop) return;

    if (boards.length > 0 && boardIndex != boards.length - 1) return;

    setLoadingDrop(true);
    try {
      const newBoard = await calculateBoard(currentBoard, column);

      const boards = newBoard.boards;
      setBoards(boards);
      setCurrentBoard(boards[0]);
      const marbles = newBoard.marbles;
      marbles.push([]);

      setMarbles(marbles);
      setCurrentMarbles(marbles[0]);

      setBoardIndex(0);
    } catch (e) {
      setErrorDrop(true);
    }
    setLoadingDrop(false);
  };

  const handleBoardChange = async (action: string) => {
    if (!boards || !marbles) return;

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
