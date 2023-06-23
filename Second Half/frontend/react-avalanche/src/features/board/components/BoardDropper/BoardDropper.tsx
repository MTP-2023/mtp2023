import React from "react";

type BoardDropperProps = {
  handleMarbleDrop: (column: number) => void;
  currentBoard: number[][] | undefined;
};

const BoardDropper: React.FC<BoardDropperProps> = ({
  currentBoard,
  handleMarbleDrop,
}) => {
  if (!currentBoard) {
    return <div>loading...</div>;
  }

  const buttons = [];
  for (let i = 1; i < currentBoard[0]?.length - 1; i++) {
    buttons.push(
      <button onClick={() => handleMarbleDrop(i - 1)} key={i}>
        {i}
      </button>
    );
  }

  return (
    <div className="board__buttons">
      {buttons.map((button, index) => (
        <div key={index}>{button}</div>
      ))}
    </div>
  );
};

export default BoardDropper;
