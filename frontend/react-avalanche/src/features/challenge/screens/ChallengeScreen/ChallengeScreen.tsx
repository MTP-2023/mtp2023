import React from "react";
import Board from "../../../board/Board";
import { BoardProvider } from "../../../board/context/BoardContext";
import BoardSizeController from "../../../board/components/BoardEditor/BoardEditor";
import "./ChallengeScreenStyle.css";
import ChallengeBoard from "../../components/ChallengeBoard/ChallengeBoard";
import { ChallengeProvider } from "../../ChallengeContext";

const ChallengeScreen = () => {
  return (
    <div className="sandbox">
      <ChallengeProvider>
        <BoardProvider>
          <ChallengeBoard />
        </BoardProvider>
      </ChallengeProvider>
    </div>
  );
};

export default ChallengeScreen;
