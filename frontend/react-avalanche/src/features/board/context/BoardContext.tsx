import React from "react";
import { calculateBoard, fetchBoard } from "../../../api/publicApi";

const useBoardContext = () => {
  const [boards, setBoards] = React.useState<[[[]]]>([[[]]]);
  const [currentBoard, setCurrentBoard] = React.useState<[[]]>([[]]);
  const [marbles, setMarbles] = React.useState<[[[]]]>([[[]]]);
  const [currentMarbles, setCurrentMarbles] = React.useState<[[]]>([[]]);
  const [loadingStart, setLoadingStart] = React.useState<boolean>(false);
  const [errorStart, setError] = React.useState<boolean>(false);
  const [loadingDrop, setLoadingDrop] = React.useState<boolean>(false);
  const [errorDrop, setErrorDrop] = React.useState<boolean>(false);
  const [boardIndex, setBoardIndex] = React.useState<number>(0);

  const getBoard = React.useCallback(async (width: number, height: number) => {
    setLoadingStart(true);
    try {
      const data = await fetchBoard(width, height);
      //console.log(data)
      setCurrentBoard(data);
      setCurrentMarbles([[]]);
      setBoardIndex(0);
    } catch (e) {
      setError(true);
    }
    setLoadingStart(false);
  }, []);

  React.useEffect(() => {
    getBoard(3, 2);
  }, []);

  const handleMarbleDrop = async (column: number) => {
    setLoadingDrop(true);
    try {
      const newBoard = await calculateBoard(currentBoard, column);
      console.log(newBoard);
      const boards = newBoard.boards;
      setBoards(boards);
      setCurrentBoard(boards[0]);
      const marbles = newBoard.marbles;
      marbles.push([]);
      console.log(marbles)
      setMarbles(marbles);
      setCurrentMarbles(marbles[0]);
      const boardIndex = 0;
      setBoardIndex(boardIndex);
    } catch (e) {
      setErrorDrop(true);
    }
    setLoadingDrop(false);
  };

  const handleBoardChange = async (action: string) => {
    setLoadingDrop(true);
    try {
      if (action == "back" && boardIndex > 0) {
        console.log("prev")
        setBoardIndex(boardIndex-1);
        
      } else if (action == "forward" && boardIndex < boards.length-1) {
        console.log("next")
        setBoardIndex(boardIndex+1);
      } else if (action == "last") {
        console.log("last")
        setBoardIndex(boards.length-1);
      }
      setCurrentBoard(boards[boardIndex]);
      setCurrentMarbles(marbles[boardIndex]);
    } catch (e) {
      console.log("Board change failed")
    }
    setLoadingDrop(false);
  };

  return {
    loadingStart,
    errorStart,
    currentBoard,
    setCurrentBoard,
    currentMarbles,
    setCurrentMarbles,
    handleMarbleDrop,
    handleBoardChange
  };
};

type UseBoardContextType = ReturnType<typeof useBoardContext>;

const initialState: UseBoardContextType = {
  currentBoard: [[]],
  setCurrentBoard: () => {},
  currentMarbles: [[]],
  setCurrentMarbles: () => {},
  loadingStart: false,
  errorStart: false,
  handleMarbleDrop: (column: number) => Promise.resolve(),
  handleBoardChange: (action: string) => Promise.resolve()
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
  currentBoard: [[]];
  setCurrentBoard: (board: [[]]) => void;
  currentMarbles : [[]];
  setCurrentMarbles: (marbles: [[]]) => void;
  handleMarbleDrop: (column: number) => void;
  handleBoardChange: (action: string) => void;
};

export const useBoard = (): useBoardType => {
  const { currentBoard, setCurrentBoard, currentMarbles, setCurrentMarbles, loadingStart, errorStart, handleMarbleDrop, handleBoardChange } =
    React.useContext(BoardContext);
  return { currentBoard, setCurrentBoard, currentMarbles, setCurrentMarbles, loadingStart, errorStart, handleMarbleDrop, handleBoardChange };
};
