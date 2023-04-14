import React from "react";
import ChallengeBoard from "../../components/ChallengeBoard/ChallengeBoard";
import { useChallenge } from "../../ChallengeContext";
import BoardDropper from "../../../board/components/BoardDropper/BoardDropper";
import useHandleBoard from "../../../board/hooks/useHandleBoard";
import BoardSimulationNavigator from "../../../board/components/BoardSimulationNavigator/BoardSimulationNavigator";
import { checkWon } from "../../utils/ChallengeUtils";
import "./ChallengeScreenStyle.css";

const ChallengeScreen = () => {
  const { challenge } = useChallenge();

  if (!challenge) return null;

  const { start } = challenge;

  const { currentBoard, currentMarbles, handleMarbleDrop, handleBoardChange } =
    useHandleBoard(start);

  const [won, setWon] = React.useState(false);

  React.useEffect(() => {
    if (checkWon(currentBoard, challenge.goal)) {
      setWon(true);
    } else {
      setWon(false);
    }
  }, [currentBoard]);

  return (
    <div className="center">
      <BoardSimulationNavigator handleBoardChange={handleBoardChange} />

      <BoardDropper
        currentBoard={currentBoard}
        handleMarbleDrop={handleMarbleDrop}
      />

      <ChallengeBoard
        challenge={challenge}
        currentBoard={currentBoard}
        currentMarbles={currentMarbles}
      />
      {won && <div className="won">You won!</div>}
    </div>
  );
};

export default ChallengeScreen;
