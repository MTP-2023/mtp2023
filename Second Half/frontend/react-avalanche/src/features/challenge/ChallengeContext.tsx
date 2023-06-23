import React from "react";
import { fetchChallenge } from "../../api/publicApi";
import { Challenge } from "./domain";

const useChallengeContext = () => {
  const [challenge, setChallenge] = React.useState<Challenge>({
    start: [],
    goal: [],
  });
  const [challengeLoading, setChallengeLoading] =
    React.useState<boolean>(false);
  const [challengeError, setChallengeError] = React.useState<boolean>(false);

  const getChallenge = async () => {
    try {
      setChallengeLoading(true);
      const data = await fetchChallenge();

      for (let i = 0; i < data.start.length; i++) {
        for (let j = 0; j < data.start[i].length; j++) {
          if (data.start[i][j] === 2) {
            data.start[i][j] = 1;
          }
        }
      }
      setChallenge(data);
    } catch (e) {
      setChallengeError(true);
    } finally {
      setChallengeLoading(false);
    }
  };

  React.useEffect(() => {
    getChallenge();
  }, []);

  return {
    challenge,
    challengeLoading,
    challengeError,
  };
};

type ChallengeContextType = ReturnType<typeof useChallengeContext>;

export const ChallengeContext = React.createContext<ChallengeContextType>(
  {} as ChallengeContextType
);

type ChallengeProviderProps = {
  children: React.ReactNode;
};

export const ChallengeProvider: React.FC<ChallengeProviderProps> = ({
  children,
}) => {
  const challengeContext = useChallengeContext();

  return (
    <ChallengeContext.Provider value={challengeContext}>
      {children}
    </ChallengeContext.Provider>
  );
};

type useChallengeType = {
  challenge: Challenge;
  challengeLoading: boolean;
  challengeError: boolean;
};

export const useChallenge = (): useChallengeType => {
  const context = React.useContext(ChallengeContext);

  if (context === undefined) {
    throw new Error("useChallenge must be used within a ChallengeProvider");
  }

  return context;
};
