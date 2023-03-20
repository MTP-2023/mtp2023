import React from "react";
import { calculateBoard, fetchBoard } from "../../../api/publicApi";

const useBoardContext = () => {
  const [board, setBoard] = React.useState<[[]]>([[]]);
  const [loadingStart, setLoadingStart] = React.useState<boolean>(false);
  const [errorStart, setError] = React.useState<boolean>(false);
  const [loadingDrop, setLoadingDrop] = React.useState<boolean>(false);
  const [errorDrop, setErrorDrop] = React.useState<boolean>(false);

  const getBoard = React.useCallback(async (width: number, height: number) => {
    setLoadingStart(true);
    try {
      const data = await fetchBoard(width, height);
      setBoard(data);
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
      const newBoard = await calculateBoard(board, column);
      console.log(newBoard);
      const boards = newBoard.boards;
      setBoard(boards[boards.length - 1]);
    } catch (e) {
      setErrorDrop(true);
    }
    setLoadingDrop(false);
  };

  return {
    loadingStart,
    errorStart,
    board,
    setBoard,
    handleMarbleDrop,
  };
};

type UseBoardContextType = ReturnType<typeof useBoardContext>;

const initialState: UseBoardContextType = {
  board: [[]],
  setBoard: () => {},
  loadingStart: false,
  errorStart: false,
  handleMarbleDrop: (column: number) => Promise.resolve(),
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
  board: [[]];
  setBoard: (board: [[]]) => void;
  handleMarbleDrop: (column: number) => void;
};

export const useBoard = (): useBoardType => {
  const { board, setBoard, loadingStart, errorStart, handleMarbleDrop } =
    React.useContext(BoardContext);
  return { board, setBoard, loadingStart, errorStart, handleMarbleDrop };
};
