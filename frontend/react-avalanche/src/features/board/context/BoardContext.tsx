import React from "react";
import { fetchBoard } from "../../../api/publicApi";

const useBoardContext = () => {
  const [board, setBoard] = React.useState<[[]]>([[]]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<boolean>(false);

  const getBoard = React.useCallback(async (width: number, height: number) => {
    setLoading(true);
    try {
      const data = await fetchBoard(width, height);
      setBoard(data);
    } catch (e) {
      setError(true);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    getBoard(3, 2);
  }, []);

  return {
    loading,
    error,
    board,
    setBoard,
  };
};

type UseBoardContextType = ReturnType<typeof useBoardContext>;

const initialState: UseBoardContextType = {
  board: [[]],
  setBoard: () => {},
  loading: false,
  error: false,
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
  loading: boolean;
  error: boolean;
  board: [][];
  setBoard: (board: [[]]) => void;
};

export const useBoard = (): useBoardType => {
  const { board, setBoard, loading, error } = React.useContext(BoardContext);
  return { board, setBoard, loading, error };
};
