import React from "react";
import { useChallenge } from "../challenge/ChallengeContext";
import ChallengeBoard from "../challenge/components/ChallengeBoard/ChallengeBoard";
import useHandleBoard from "../board/hooks/useHandleBoard";
import { calculateBoard, getAgents, solveChallenge } from "../../api/publicApi";
import BoardSimulationNavigator from "../board/components/BoardSimulationNavigator/BoardSimulationNavigator";
import SelectComponent from "./components/SelectComponent";

const aiShowcaseScreen = () => {
  const { challenge, challengeLoading, challengeError } = useChallenge();

  if (challengeLoading) return <div>Loading...</div>;

  const { start } = challenge;

  const [solution, setSolution] = React.useState<any>({
    action_sequence: undefined,
    actions_required: undefined,
    solved: undefined,
  });

  const [boards, setBoards] = React.useState<number[][][]>([]);
  const [currentBoard, setCurrentBoard] = React.useState<number[][]>(start);
  const [currentAgents, setCurrentAgents] = React.useState<
    { value: string; label: string }[] | undefined
  >(undefined);
  const [selectedAgent, setSelectedAgent] = React.useState<string | undefined>(
    undefined
  );

  const [marbles, setMarbles] = React.useState<number[][][]>([]);
  const [currentMarbles, setCurrentMarbles] = React.useState<number[][]>([]);

  const [boardIndex, setBoardIndex] = React.useState<number>(0);
  const [loadingDrop, setLoadingDrop] = React.useState<boolean>(false);
  const [errorDrop, setErrorDrop] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!boards || boards.length === 0 || !marbles || marbles.length === 0)
      return;
    setCurrentBoard(boards[boardIndex]);

    setCurrentMarbles(marbles[boardIndex]);
  }, [boardIndex]);

  React.useEffect(() => {
    const fetchAgents = async () => {
      const { agents } = await getAgents();
      const agentsFormatted = agents.map((agent: string) => ({
        value: agent,
        label: agent,
      }));
      setCurrentAgents(agentsFormatted);
      setSelectedAgent(agentsFormatted[0].value);
    };
    fetchAgents();
  }, []);

  React.useEffect(() => {
    const getSolution = async () => {
      if (
        challenge.goal[0] === undefined ||
        challenge.start[0] === undefined ||
        selectedAgent === undefined
      )
        return;

      const steps = await solveChallenge(challenge, selectedAgent);

      setSolution(steps);
    };
    getSolution();
  }, [selectedAgent]);

  React.useEffect(() => {
    if (solution.action_sequence === undefined) return;

    const simulateAllThrows = async () => {
      if (!currentBoard) return;

      if (loadingDrop) return;

      if (boards.length > 0 && boardIndex != boards.length - 1) return;

      setLoadingDrop(true);
      const accBoards = [start];
      const accMarbles = [[]];
      try {
        for (let i = 0; i < solution.action_sequence.length; i++) {
          console.log("current", currentBoard);
          const column = solution.action_sequence[i];
          const result = await calculateBoard(
            accBoards[accBoards.length - 1],
            column
          );

          const newBoards = result.boards;
          accBoards.push(...newBoards);

          const marbles = result.marbles;
          marbles.push([]);
          accMarbles.push(...marbles);
        }
        setBoards(accBoards);
        setMarbles(accMarbles);
        setCurrentBoard(accBoards[accBoards.length - 1]);
      } catch (e) {
        setErrorDrop(true);
      }
      setLoadingDrop(false);
    };

    simulateAllThrows();
  }, [solution]);

  React.useEffect(() => {
    setBoardIndex(boards.length - 1);
    console.log("boards", boards);
  }, [boards]);

  const handleBoardChange = (action: string) => {
    if (!boards || !marbles) return;

    if (action == "back" && boardIndex > 0) {
      setBoardIndex((prev) => prev - 1);
    } else if (action == "forward" && boardIndex < boards.length - 1) {
      setBoardIndex((prev) => prev + 1);
    } else if (action == "last") {
      setBoardIndex(boards.length - 1);
    } else if (action == "first") {
      setBoardIndex(0);
    }
  };

  const handleSelectChange = (e: any) => {
    setSelectedAgent(e.target.value);
  };

  if (!currentAgents || !solution) return <div>Loading...</div>;

  return (
    <div className="flex">
      <div className="center">
        <BoardSimulationNavigator handleBoardChange={handleBoardChange} />
        <ChallengeBoard
          challenge={challenge}
          currentBoard={currentBoard}
          currentMarbles={currentMarbles}
        />
      </div>
      <div>
        <h1>AI Showcase</h1>
        <h2>Agent</h2>
        <SelectComponent
          options={currentAgents}
          selectedOption={selectedAgent}
          onChange={handleSelectChange}
        />
        {solution.solved ? (
          <p>{`This challenge was solved in ${solution.actions_required} moves`}</p>
        ) : (
          <p>{`This challenge was not solved in ${solution.actions_required} moves`}</p>
        )}
        <p>{"Actions taken: " + solution.action_sequence}</p>
      </div>
    </div>
  );
};

export default aiShowcaseScreen;
