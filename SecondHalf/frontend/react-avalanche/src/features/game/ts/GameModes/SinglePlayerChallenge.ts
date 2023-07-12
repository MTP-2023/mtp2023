import { Challenge, GameEvaluation, AbstractGameMode } from "./GameModeResources";
import { interpretBoard } from "../Helper/BoardInterpreter";

export class SinglePlayerChallenge extends AbstractGameMode {
    challenge: Challenge = new Challenge([], []);

    constructor() {
        super();
        this.initChallenge();
    }

    protected initChallenge(): void {
       // load game board state, to be replaced by API calls
       const start = ([
            [0, 0, 1, 1, 0, 1, 0, 0],
            [0, 1, 1, 0, 0, 1, 1, 0],
            [0, 0, 1, 0, 1, 1, 0, 0],
            [1, 0, 0, 1, 1, 0, 1, 0],
        ]);

        const goal = interpretBoard([
            [0, 0, 1, 1, 0, 2, 0, 0],
            [0, 1, 1, 0, 0, 1, 1, 0],
            [0, 0, 1, 0, 1, 1, 0, 0],
            [1, 0, 0, 1, 1, 0, 1, 0],
        ]);

        this.challenge = new Challenge(start, goal);
    }

    public addChallengeIndicator(scene: Phaser.Scene, data: number, x: number, y: number, width: number, height: number, lineWidth: number): void {
        // Check if switch should hold a marble to fulfill the winning requirements
        if (data == 2) {
            // add indicator, here a semi-transparent, orange rectangle
            const indicatorRectangle = scene.add.rectangle(x, y, width, height, 0xffa500, 0.5);
            indicatorRectangle.setDepth(-1);
        }
    }

    public interpretGameState(board: number[][]): GameEvaluation {
        let finished = true;
        
        const flattenedGoal = this.challenge.goalBoard.flat();
        const flattenedBoard = board.flat();

        for (const [idx, val] of flattenedGoal.entries()) {
            if (val == 2 && flattenedBoard[idx] != 2) {
                finished = false;
                break;
            }
        }

        return new GameEvaluation(false, finished);
    }
}