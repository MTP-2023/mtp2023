export const fetchBoard = async (width: number = 5, height: number = 5) => {
  const response = await fetch(
    `http://127.0.0.1:8000/randomboard?width=${width}&height=${height}`
  );
  const data = await response.json();
  return data;
};

export const calculateBoard = async (board: [[]], index: number) => {
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
