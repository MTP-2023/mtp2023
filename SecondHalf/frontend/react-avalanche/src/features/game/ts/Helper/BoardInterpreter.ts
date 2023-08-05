export function interpretBoard(board: number[][]): number[][] {
    let interpretedBoard: number[][] = [];

    const isStartBoard = (Math.max(...board.flat()) < 2);

    const copy = board.map((row) => [...row]);

    copy.forEach((row, idx) => {
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

    console.log(interpretedBoard)
    return interpretedBoard;
}

export function interpretBoardReverse(switch_orientation: String[][], holds_marble: number[][]): number[][] {
    let current_board: number[][] = [];
    switch_orientation.forEach((row, idx) => {
        let currentRow = [0, 0, 0, 0, 0, 0, 0, 0];
        let offset = 0;
        if(idx%2 == 0){
            offset = 1;
        }
        for(let i = 0; i < row.length; i+=1){
            if(row[i] == "left"){
                if(holds_marble[idx][i] != 0){
                    currentRow[i*2+offset] = holds_marble[idx][i];
                } else {
                    currentRow[i*2+offset] = 1;
                }
            } else if (row[i] == "right") {
                if (holds_marble[idx][i] != 0) {
                    currentRow[i * 2 + offset + 1] = holds_marble[idx][i];
                } else {
                    currentRow[i * 2 + offset + 1] = 1;
                }
            }
        }
        current_board.push(currentRow);
    })
    console.log("REINTERPRETED BOARD")
    console.log(current_board)
    return current_board
}
