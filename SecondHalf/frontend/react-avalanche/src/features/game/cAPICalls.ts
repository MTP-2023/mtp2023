export const fetchChallenge = async (gameMode: string) => {
    const response = await fetch("http://127.0.0.1:8000/challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            modeHandle: gameMode
        }),
      });
    return await response.json();
};

export const getCode = async () => {
  const response = await fetch("http://127.0.0.1:8000/getCode", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  return await response.json();
};