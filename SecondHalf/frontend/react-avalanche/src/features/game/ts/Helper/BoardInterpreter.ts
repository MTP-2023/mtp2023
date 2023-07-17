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
                    currentRow.push(1);
                } else {
                    currentRow.push(-1);
                }
            }
        } 
        // for goal board interpretation, only focusing on relevant switches
        else {
            for (let i=0; i < row.length; i+=2) {
                //const switchVal = Math.max(...[row[i], row[i+1]]);
                const switchVal = row[i] != 0 ? row[i] : row[i+1];
                if (![0, 1].includes(switchVal)) {
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