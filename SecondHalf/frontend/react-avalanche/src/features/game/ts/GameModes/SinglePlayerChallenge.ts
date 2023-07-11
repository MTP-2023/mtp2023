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
            // Add rectangle around the switch as a non-colliding indicator
            const indicator = scene.add.graphics();
            
            // Set the line style for the border
            indicator.lineStyle(lineWidth, 0xffa500);

            // Draw the transparent rectangle with a colored border
            indicator.strokeRect(x - width / 2, y - height / 2, width, height);

            // Add the graphics object to the scene or container
            scene.add.existing(indicator);
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