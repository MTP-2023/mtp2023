import React from "react";
import { useChallenge } from "../../ChallengeContext";
import Board from "../../../board/Board";
import useHandleBoard from "../../../board/hooks/useHandleBoard";
import BoardDropper from "../../../board/components/BoardDropper/BoardDropper";
import { Challenge } from "../../domain";
import { checkSwitchHasMarble } from "../../utils/ChallengeUtils";

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
  const [matchBoard, setMatchBoard] = React.useState<number[][]>(
    challenge.start
  );

  React.useEffect(() => {
    const newMatchBoard = [...challenge.start.map((row) => [...row])];

    for (let row = 0; row < currentBoard?.length; row++) {
      if (row % 2 === 0) {
        for (let col = 1; col < currentBoard[row]?.length - 1; col += 2) {
          if (
            checkSwitchHasMarble(
              challenge.goal[row][col],
              challenge.goal[row][col + 1]
            ) &&
            checkSwitchHasMarble(
              currentBoard[row][col],
              currentBoard[row][col + 1]
            )
          ) {
            newMatchBoard[row][col] = 2;
            newMatchBoard[row][col + 1] = 0;
          }
        }
      } else {
        for (let col = 0; col < currentBoard[row]?.length; col += 2) {
          if (
            checkSwitchHasMarble(
              challenge.goal[row][col],
              challenge.goal[row][col + 1]
            ) &&
            checkSwitchHasMarble(
              currentBoard[row][col],
              currentBoard[row][col + 1]
            )
          ) {
            newMatchBoard[row][col] = 2;
            newMatchBoard[row][col + 1] = 0;
          }
        }
      }
    }
    setMatchBoard(newMatchBoard);
  }, [currentBoard]);

  return (
    <div className="challenge">
      <Board
        className="challenge__current"
        currentMarbles={currentMarbles}
        currentBoard={currentBoard}
      />

      <Board
        className="challenge__board--green"
        currentMarbles={[]}
        currentBoard={matchBoard}
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
