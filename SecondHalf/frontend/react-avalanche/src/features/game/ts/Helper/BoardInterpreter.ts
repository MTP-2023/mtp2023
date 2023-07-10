export function interpretBoard(board: number[][]): number[][] {
    let interpretedBoard: number[][] = [];

    board.forEach((row, idx) => {
        let currentRow = []
        if (idx % 2 == 0) {
            row.shift()
            row.pop()
        }

        for (let i=0; i < row.length; i+=2) {
            if (row[i] > 0) {
                currentRow.push(row[i]);
            } else {
                currentRow.push(-row[i]);
            }
        }
        interpretedBoard.push(currentRow);
    })

    return interpretedBoard;
}