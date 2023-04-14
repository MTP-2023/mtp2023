import React from "react";
import { fetchBoard } from "../../../api/publicApi";

const useBoardContext = () => {
  const [currentBoard, setCurrentBoard] = React.useState<
    number[][] | undefined
  >(undefined);
  const [loadingStart, setLoadingStart] = React.useState<boolean>(false);
  const [errorStart, setError] = React.useState<boolean>(false);
  const [width, setWidth] = React.useState<number>(3);
  const [height, setHeight] = React.useState<number>(2);

  React.useEffect(() => {
    getBoard(width, height);
  }, [width, height]);

  const getBoard = React.useCallback(async (width: number, height: number) => {
    setLoadingStart(true);
    try {
      const data = await fetchBoard(width, height);
      setCurrentBoard(data);
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

  return {
    loadingStart,
    errorStart,
    currentBoard,
    sizeControls: {
      increaseWidth,
      decreaseWidth,
      increaseHeight,
      decreaseHeight,
    },
  };
};

type UseBoardContextType = ReturnType<typeof useBoardContext>;

const initialState: UseBoardContextType = {
  loadingStart: false,
  errorStart: false,
  currentBoard: undefined,
  sizeControls: {
    increaseHeight: () => {},
    decreaseHeight: () => {},
    increaseWidth: () => {},
    decreaseWidth: () => {},
  },
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

export type sizeControlsType = {
  increaseHeight: () => void;
  decreaseHeight: () => void;
  increaseWidth: () => void;
  decreaseWidth: () => void;
};

type useBoardType = {
  loadingStart: boolean;
  errorStart: boolean;
  currentBoard: number[][] | undefined;
  sizeControls: sizeControlsType;
};

export const useBoard = (): useBoardType => {
  const { currentBoard, loadingStart, errorStart, sizeControls } =
    React.useContext(BoardContext);
  return {
    currentBoard,
    loadingStart,
    errorStart,
    sizeControls,
  };
};
