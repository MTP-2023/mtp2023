import React from "react";
import { calculateBoard, fetchBoard } from "../../../api/publicApi";

const useBoardContext = () => {
  const [boards, setBoards] = React.useState<number[][][] | undefined>(
    undefined
  );
  const [currentBoard, setCurrentBoard] = React.useState<
    number[][] | undefined
  >(undefined);
  const [marbles, setMarbles] = React.useState<[][][] | undefined>(undefined);
  const [currentMarbles, setCurrentMarbles] = React.useState<
    number[][] | undefined
  >(undefined);
  const [loadingStart, setLoadingStart] = React.useState<boolean>(false);
  const [errorStart, setError] = React.useState<boolean>(false);
  const [loadingDrop, setLoadingDrop] = React.useState<boolean>(false);
  const [errorDrop, setErrorDrop] = React.useState<boolean>(false);
  const [boardIndex, setBoardIndex] = React.useState<number>(0);
  const [width, setWidth] = React.useState<number>(3);
  const [height, setHeight] = React.useState<number>(2);

  React.useEffect(() => {
    if (!boards || !marbles) return;
    setCurrentBoard(boards[boardIndex]);
    setCurrentMarbles(marbles[boardIndex]);
  }, [boardIndex]);

  React.useEffect(() => {
    getBoard(width, height);
  }, [width, height]);

  const getBoard = React.useCallback(async (width: number, height: number) => {
    setLoadingStart(true);
    try {
      const data = await fetchBoard(width, height);

      setBoards(undefined);
      setMarbles(undefined);

      setCurrentBoard(data);
      setCurrentMarbles([]);

      setBoardIndex(0);
    } catch (e) {
      setError(true);
    }

    setLoadingStart(false);
  }, []);

  const increaseWidth = () => {
    setWidth((prev) => prev + 1);
  };

  const decreaseWidth = () => {
    if (width > 3) setWidth((prev) => prev - 1);
  };

  const increaseHeight = () => {
    setHeight((prev) => prev + 1);
  };

  const decreaseHeight = () => {
    if (height > 2) setHeight((prev) => prev - 1);
  };

  const handleMarbleDrop = async (column: number) => {
    if (!currentBoard) return;

    if (loadingDrop) return;

    if (boards && boardIndex != boards.length - 1) return;

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
    loadingStart,
    errorStart,
    currentBoard,
    setCurrentBoard,
    currentMarbles,
    setCurrentMarbles,
    handleMarbleDrop,
    handleBoardChange,
    increaseWidth,
    decreaseWidth,
    increaseHeight,
    decreaseHeight,
  };
};

type UseBoardContextType = ReturnType<typeof useBoardContext>;

const initialState: UseBoardContextType = {
  currentBoard: [],
  setCurrentBoard: () => {},
  currentMarbles: [],
  setCurrentMarbles: () => {},
  loadingStart: false,
  errorStart: false,
  handleMarbleDrop: (column: number) => Promise.resolve(),
  handleBoardChange: (action: string) => Promise.resolve(),
  increaseHeight: () => {},
  decreaseHeight: () => {},
  increaseWidth: () => {},
  decreaseWidth: () => {},
};

export const BoardContext =
  React.createContext<UseBoardContextType>(initialState);

type BoardProps = {
  children: React.ReactNode;
};

export const BoardProvider: React.FC<BoardProps> = ({ children }) => {
  return (
    <BoardContext.Provider value={useBoardContext()}>
      {children}
    </BoardContext.Provider>
  );
};

type useBoardType = {
  loadingStart: boolean;
  errorStart: boolean;
  currentBoard: number[][] | undefined;
  setCurrentBoard: (board: number[][]) => void;
  currentMarbles: number[][] | undefined;
  setCurrentMarbles: (marbles: [[]]) => void;
  handleMarbleDrop: (column: number) => void;
  handleBoardChange: (action: string) => void;
  increaseHeight: () => void;
  decreaseHeight: () => void;
  increaseWidth: () => void;
  decreaseWidth: () => void;
};

export const useBoard = (): useBoardType => {
  const {
    currentBoard,
    setCurrentBoard,
    currentMarbles,
    setCurrentMarbles,
    loadingStart,
    errorStart,
    handleMarbleDrop,
    handleBoardChange,
    increaseHeight,
    decreaseHeight,
    increaseWidth,
    decreaseWidth,
  } = React.useContext(BoardContext);
  return {
    currentBoard,
    setCurrentBoard,
    currentMarbles,
    setCurrentMarbles,
    loadingStart,
    errorStart,
    handleMarbleDrop,
    handleBoardChange,
    increaseHeight,
    decreaseHeight,
    increaseWidth,
    decreaseWidth,
  };
};
