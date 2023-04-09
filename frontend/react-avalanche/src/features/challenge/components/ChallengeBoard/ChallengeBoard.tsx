import React from "react";
import { useChallenge } from "../../ChallengeContext";
import Board from "../../../board/Board";

const ChallengeBoard = () => {
  const challengeState = useChallenge();
  return (
    <div>
      {challengeState.challenge && (
        <>
          <Board
            currentMarbles={[]}
            currentBoard={challengeState.challenge.start}
          />
          <Board
            className="challenge__board--goal"
            currentMarbles={[]}
            currentBoard={challengeState.challenge.goal}
          />
        </>
      )}
    </div>
  );
};

export default ChallengeBoard;
