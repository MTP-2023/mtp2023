import React from "react";
import Board from "./features/board/Board";
import { BoardProvider } from "./features/board/context/BoardContext";
import { Outlet, Route, Routes } from "react-router";
import Navbar from "./features/navigation/Components/Navbar/Navbar";
import SandboxScreen from "./features/sandbox/screens/SandboxScreen/SandboxScreen";
import ChallengeScreen from "./features/challenge/screens/ChallengeScreen/ChallengeScreen";

function Layout() {
  return (
    <>
      <Navbar />

      <Outlet />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<SandboxScreen />} />
          <Route
            path="sandbox"
            element={
              <BoardProvider>
                <SandboxScreen />
              </BoardProvider>
            }
          />
          <Route path="challenge" element={<ChallengeScreen />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
