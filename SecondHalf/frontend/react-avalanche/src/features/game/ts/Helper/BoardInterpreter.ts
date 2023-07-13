export function interpretBoard(board: number[][]): number[][] {
    let interpretedBoard: number[][] = [];

    const isStartBoard = (Math.max(...board.flat()) < 2);

    board.forEach((row, idx) => {
        let currentRow = []
        if (idx % 2 == 0) {
            row.shift()
            row.pop()
        }

        // for board interpretation without marbles
        if (isStartBoard) {
            for (let i=0; i < row.length; i+=2) {
                if (row[i] > 0) {
                    currentRow.push(row[i]);
                } else {
                    currentRow.push(-row[i]);
                }
            }
        } 
        // for goal board interpretation, only focusing on relevant switches
        else {
            for (let i=0; i < row.length; i+=2) {
                const switchVal = Math.max(...[row[i], row[i+1]]);
                if (switchVal > 1) {
                    currentRow.push(switchVal);
                } else {
                    currentRow.push(0);
                }
            } 
        }
        
        interpretedBoard.push(currentRow);
    })

    return interpretedBoard;
}