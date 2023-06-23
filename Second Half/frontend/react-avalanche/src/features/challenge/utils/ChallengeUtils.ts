export const checkSwitchHasMarble = (left: number, right: number) => {
  return right === 2 || left === 2;
};

export const checkWon = (
  currentBoard: number[][],
  challengeBoard: number[][]
) => {
  let won = true;
  for (let row = 0; row < currentBoard.length; row++) {
    if (row % 2 === 0) {
      for (let col = 1; col < currentBoard[row].length - 1; col += 2) {
        if (
          checkSwitchHasMarble(
            challengeBoard[row][col],
            challengeBoard[row][col + 1]
          ) &&
          !checkSwitchHasMarble(
            currentBoard[row][col],
            currentBoard[row][col + 1]
          )
        ) {
          won = false;
        }
      }
    } else {
      for (let col = 0; col < currentBoard[row].length; col += 2) {
        if (
          checkSwitchHasMarble(
            challengeBoard[row][col],
            challengeBoard[row][col + 1]
          ) &&
          !checkSwitchHasMarble(
            currentBoard[row][col],
            currentBoard[row][col + 1]
          )
        ) {
          won = false;
        }
      }
    }
  }
  return won;
};
