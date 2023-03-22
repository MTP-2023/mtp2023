import React from "react";
import "./BoardStyle.css";
import Switcher from "./components/switcher/Switcher";
import MarblePos from "./components/marble_state_row/MarblePos";
import { useBoard } from "./context/BoardContext";
import {
  FaChevronCircleLeft,
  FaChevronCircleRight,
  FaFastForward,
  FaMinus,
  FaPlus,
} from "react-icons/fa";

const Board = () => {
  const {
    currentBoard,
    currentMarbles,
    loadingStart,
    errorStart,
    handleMarbleDrop,
    handleBoardChange,
    increaseHeight,
    decreaseHeight,
    increaseWidth,
    decreaseWidth,
  } = useBoard();

  if (loadingStart) return <div>Loading...</div>;

  if (errorStart) return <div>Error</div>;

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

  //console.log(currentBoard, currentMarbles)

  for (let row = 0; row < currentBoard.length; row++) {
    const marbleRow = [];
    // build marbles html
    for (let col = 0; col < currentBoard[row].length; col += 1) {
      let exists = false;
      if (currentMarbles.length > 0 && currentMarbles[0].length > 0) {
        for (let marble of currentMarbles) {
          //console.log("CHECK", currentMarbles, marble)
          if (marble[0] == row && marble[1] == col) {
            //print("FOUND", marble)
            exists = true;
            break;
          }
        }
      }
      const obj = <MarblePos key={col} state={exists} />;
      // console.log(exists, obj);
      marbleRow.push(obj);
    }
    marbleRows.push(marbleRow);

    const buildedRow = [];
    let key = 0;
    if (row % 2 === 0) {
      for (let col = 1; col < currentBoard[row].length - 1; col += 2) {
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
      for (let col = 0; col < currentBoard[row].length; col += 2) {
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

  const buttons = [];

  for (let i = 1; i < currentBoard[0].length - 1; i++) {
    buttons.push(
      <button onClick={() => handleMarbleDrop(i - 1)} key={i}>
        {i}
      </button>
    );
  }

  //console.log(marbleRows, buildedBoard)

  return (
    <div className="board">
      <div className="board__dimensions">
        <div className="container">
          <button onClick={() => decreaseHeight()}>
            <FaMinus />
          </button>
          <p>Rows: {currentBoard.length}</p>
          <button onClick={() => increaseHeight()}>
            <FaPlus />
          </button>
        </div>

        <div className="container">
          <button onClick={() => decreaseWidth()}>
            <FaMinus />
          </button>
          <p>Columns: {currentBoard[0].length}</p>
          <button onClick={() => increaseWidth()}>
            <FaPlus />
          </button>
        </div>
      </div>

      <div className="navigation">
        <button onClick={() => handleBoardChange("back")}>
          <FaChevronCircleLeft />
        </button>

        <button onClick={() => handleBoardChange("forward")}>
          <FaChevronCircleRight />
        </button>

        <button onClick={() => handleBoardChange("last")}>
          <FaFastForward />
        </button>
      </div>

      <div className="board__switches__row--displace board__buttons">
        {buttons.map((button, index) => (
          <div key={index}>{button}</div>
        ))}
      </div>

      <div className="board__switches">
        {buildedBoard.map((row, index) => (
          <React.Fragment>
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
