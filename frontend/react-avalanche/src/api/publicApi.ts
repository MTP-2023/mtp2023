export const fetchBoard = async (width: number = 5, height: number = 5) => {
  const response = await fetch(
    `http://127.0.0.1:8000/randomboard?width=${width}&height=${height}`
  );
  const data = await response.json();
  return data;
};
