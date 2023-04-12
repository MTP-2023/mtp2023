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

    console.log("before za frop", boards, boardIndex);
    if (boards.length > 0 && boardIndex != boards.length - 1) return;
    console.log("handleMarbleDrop");

    setLoadingDrop(true);
    try {
      const newBoard = await calculateBoard(currentBoard, column);
      console.log(newBoard);
      const boards = newBoard.boards;
      setBoards(boards);
      setCurrentBoard(boards[0]);
      const marbles = newBoard.marbles;
      marbles.push([]);
      console.log(marbles);
      setMarbles(marbles);
      setCurrentMarbles(marbles[0]);

      setBoardIndex(0);
    } catch (e) {
      setErrorDrop(true);
    }
    setLoadingDrop(false);
  };

  const handleBoardChange = async (action: string) => {
    console.log("handleBoardChange");
    console.log(boards);
    if (!boards || !marbles) return;
    console.log("handleBoardChange2");
    if (action == "back" && boardIndex > 0) {
      console.log("prev");
      console.log(boardIndex);
      console.log(boards);
      setBoardIndex((prev) => prev - 1);
    } else if (action == "forward" && boardIndex < boards.length - 1) {
      console.log("next");
      console.log(boardIndex);
      console.log(boards);
      setBoardIndex((prev) => prev + 1);
    } else if (action == "last") {
      console.log("last");
      console.log(boardIndex);
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
