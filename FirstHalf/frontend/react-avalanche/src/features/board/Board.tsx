import React from "react";
import "./BoardStyle.css";
import Switcher from "./components/switcher/Switcher";
import MarblePos from "./components/marble_state_row/MarblePos";
import { useBoard } from "./context/BoardContext";
import {
  FaChevronCircleLeft,
  FaChevronCircleRight,
  FaFastForward,
} from "react-icons/fa";

type BoardProps = {
  className?: string;
  currentBoard: number[][];
  currentMarbles: number[][];
};

const Board: React.FC<BoardProps> = ({
  className,
  currentBoard,
  currentMarbles,
}) => {
  const marbleRows: (
    | string
    | number
    | boolean
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | React.ReactFragment
    | React.ReactPortal
    | null
    | undefined
  )[] = [];

  const buildedBoard = [];

  for (let row = 0; row < currentBoard?.length; row++) {
    const marbleRow = [];
    // build marbles html
    for (let col = 0; col < currentBoard[row]?.length; col += 1) {
      let exists = false;
      if (
        currentMarbles &&
        currentMarbles?.length > 0 &&
        currentMarbles[0]?.length > 0
      ) {
        for (let marble of currentMarbles) {
          if (marble[0] == row && marble[1] == col) {
            //print("FOUND", marble)
            exists = true;
            break;
          }
        }
      }
      const obj = <MarblePos key={col} state={exists} />;

      marbleRow.push(obj);
    }
    marbleRows.push(marbleRow);

    const buildedRow = [];
    let key = 0;
    if (row % 2 === 0) {
      for (let col = 1; col < currentBoard[row]?.length - 1; col += 2) {
        key++;
        buildedRow.push(
          <Switcher
            key={key}
            left={currentBoard[row][col]}
            right={currentBoard[row][col + 1]}
          />
        );
      }
    } else {
      for (let col = 0; col < currentBoard[row]?.length; col += 2) {
        key++;
        buildedRow.push(
          <Switcher
            key={key}
            left={currentBoard[row][col]}
            right={currentBoard[row][col + 1]}
          />
        );
      }
    }
    buildedBoard.push(buildedRow);
  }

  return (
    <div className={`board ${className}`}>
      <div className="board__switches">
        {buildedBoard.map((row, index) => (
          <React.Fragment key={index}>
            <div className="marble_row" key={"marble" + index}>
              {marbleRows[index]}
            </div>
            <div
              key={index}
              className={`board__switches__row ${
                index % 2 === 0 && "board__switches__row--displace"
              }`}
            >
              {row}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Board;
