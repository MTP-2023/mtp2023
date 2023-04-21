import React from "react";
import { useChallenge } from "../../ChallengeContext";
import Board from "../../../board/Board";
import useHandleBoard from "../../../board/hooks/useHandleBoard";
import BoardDropper from "../../../board/components/BoardDropper/BoardDropper";
import { Challenge } from "../../domain";

interface ChallengeBoardProps {
  challenge: Challenge;
  currentMarbles: number[][];
  currentBoard: number[][];
}
const ChallengeBoard: React.FC<ChallengeBoardProps> = ({
  challenge,
  currentMarbles,
  currentBoard,
}) => {
  return (
    <div className="challenge">
      <Board
        className="challenge__current"
        currentMarbles={currentMarbles}
        currentBoard={currentBoard}
      />

      <Board
        className="challenge__board--goal"
        currentMarbles={[]}
        currentBoard={challenge.goal}
      />
    </div>
  );
};

export default ChallengeBoard;
