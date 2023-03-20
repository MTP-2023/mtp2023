import React from "react";
import Board from "./features/board/Board";
import { BoardProvider } from "./features/board/context/BoardContext";

function App() {
  return (
    <div className="App">
      <BoardProvider>
        <Board />
        <Board />
        <Board />
      </BoardProvider>
    </div>
  );
}

export default App;
