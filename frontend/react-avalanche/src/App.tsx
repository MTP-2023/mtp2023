import React from "react";
import Board from "./features/board/Board";
import { BoardProvider } from "./features/board/context/BoardContext";
import { Outlet, Route, Routes } from "react-router";
import Navbar from "./features/navigation/Components/Navbar/Navbar";
import SandboxScreen from "./features/sandbox/screens/SandboxScreen/SandboxScreen";
import ChallengeScreen from "./features/challenge/screens/ChallengeScreen/ChallengeScreen";
import { ChallengeProvider } from "./features/challenge/ChallengeContext";

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
          <Route
            index
            element={
              <BoardProvider>
                <SandboxScreen />
              </BoardProvider>
            }
          />
          <Route
            path="sandbox"
            element={
              <BoardProvider>
                <SandboxScreen />
              </BoardProvider>
            }
          />
          <Route
            path="challenge"
            element={
              <ChallengeProvider>
                <ChallengeScreen />
              </ChallengeProvider>
            }
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
