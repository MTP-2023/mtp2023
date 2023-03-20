import React from "react";

const useBoardContext = () => {
  const [board, setBoard] = React.useState<[[]]>([[]]);

  return {
    board,
    setBoard,
  };
};

type UseBoardContextType = ReturnType<typeof useBoardContext>;

const initialState: UseBoardContextType = {
  board: [[]],
  setBoard: () => {},
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
  board: [][];
  setBoard: (board: [[]]) => void;
};

export const useBoard = (): useBoardType => {
  const { board, setBoard } = React.useContext(BoardContext);
  return { board, setBoard };
};
