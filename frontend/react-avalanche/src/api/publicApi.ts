export const fetchBoard = async (
  width: number = 5,
  height: number = 5
): Promise<number[][]> => {
  const response = await fetch(
    `http://127.0.0.1:8000/randomboard?width=${width}&height=${height}`
  );

  return await response.json();
};

export const calculateBoard = async (board: number[][], index: number) => {
  const response = await fetch("http://127.0.0.1:8000/interpret", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      marble_throw: index,
      board: board,
    }),
  });
  return await response.json();
};

export const fetchChallenge = async () => {
  const response = await fetch("http://127.0.0.1:8000/challenge");
  return await response.json();
};
