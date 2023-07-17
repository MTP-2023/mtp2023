import React from "react";
import Board from "./features/board/Board";
import { BoardProvider } from "./features/board/context/BoardContext";
import { Outlet, Route, Routes } from "react-router";
import Navbar from "./features/navigation/Components/Navbar/Navbar";
import SandboxScreen from "./features/sandbox/screens/SandboxScreen/SandboxScreen";
import ChallengeScreen from "./features/challenge/screens/ChallengeScreen/ChallengeScreen";
import { ChallengeProvider } from "./features/challenge/ChallengeContext";
import AiShowcaseScreen from "./features/aiShowcase/aiShowcaseScreen";
import PresentionScreen from "./features/presentation/PresentionScreen";
import GameComponent from "./features/game/GameComponent";
import TestComponent from "./features/test/TimePage";

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
          <Route index element={<PresentionScreen />} />
          <Route path="game" element={<GameComponent />} />
          <Route path="test" element={<TestComponent />} />
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
          <Route
            path="ai"
            element={
              <ChallengeProvider>
                <AiShowcaseScreen />
              </ChallengeProvider>
            }
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
