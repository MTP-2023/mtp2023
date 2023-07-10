// class for object that must be returned by interpretGameState
export class GameEvaluation {
    isMultiplayer: boolean;
    hasWinner: boolean;
    winner: number;

    constructor(multi: boolean, finished: boolean, playerWon: number = 0) {
        this.isMultiplayer = multi;
        this.hasWinner = finished;
        this.winner = (this.isMultiplayer && this.hasWinner) ? playerWon : 0;
    }
}

export class Challenge {
    startBoard: number[][];
    goalBoard: number[][];

    constructor(start: number[][], goal: number[][]) {
        this.startBoard = start;
        this.goalBoard = goal;
    }
}

export abstract class AbstractGameMode {
    abstract challenge: Challenge;

    constructor() {
        this.initChallenge();
    } 

    // function that obtains the challenge data, i.e. requests a start and goal board from the server, and initializes the class variable 'challenge'
    protected initChallenge(): void {
        if (typeof this.challenge === 'undefined') {
            throw new Error('myVariable must be set in the constructor.');
        }
    };

    public getStartBoard(): number[][] {
        return this.challenge.startBoard;
    }

    // function that evaluates game state after each move and decides whether the game is over
    public abstract interpretGameState(board: number[][]): GameEvaluation;
}