// class for object that must be returned by interpretGameState
export class GameEvaluation {
    isMultiplayer: boolean;
    hasWinner: boolean;
    winner: number[];

    constructor(multi: boolean, finished: boolean, playerWon: number[] = []) {
        this.isMultiplayer = multi;
        this.hasWinner = finished;
        this.winner = (this.isMultiplayer && this.hasWinner) ? playerWon : [];
    }
}

import { interpretBoard } from "../Helper/BoardInterpreter";
export class Challenge {
    startBoard: number[][];
    goalBoard: number[][];

    constructor(start: number[][], goal: number[][]) {
        this.startBoard = interpretBoard(start);
        this.goalBoard = interpretBoard(goal);
    }
}

export abstract class AbstractGameMode {
    abstract challenge: Challenge;
    isLocal: boolean = false;

    // function that obtains the challenge data, i.e. requests a start and goal board from the server, and initializes the class variable 'challenge'
    public initChallenge(): void {
        if (typeof this.challenge === 'undefined') {
            throw new Error('myVariable must be set in the constructor.');
        }
    };

    public getStartBoard(): number[][] {
        return this.challenge.startBoard;
    }

    public getGoalBoard(): number[][] {
        return this.challenge.goalBoard;
    }

    public abstract createPlayerStatus(scene: Phaser.Scene, x: number, y: number, width: number, height: number, boardWidth: number): void;

    public abstract addChallengeIndicator(scene: Phaser.Scene, data: number, x: number, y: number, width: number, height: number, lineWidth: number): void;

    public abstract handleTurnSwitch(playerTurn: number): [ marblePNG: string, turn: number ];

    // function that evaluates game state after each move and decides whether the game is over
    public abstract interpretGameState(board: number[][]): GameEvaluation;
}