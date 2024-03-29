import { Challenge, GameEvaluation, AbstractGameMode } from "./GameModeResources";
import { fetchChallenge } from "../../cAPICalls";

export class SinglePlayerChallenge extends AbstractGameMode {
    challenge: Challenge = new Challenge([], []);
    isLocal: boolean = true;
    isMultiplayer: boolean = false;
    playerColor = 0xd333ff;

    public async initChallenge(): Promise<void> {
       // load game board state, to be replaced by API calls
       /*
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
        ]);*/

        const challengeData = await fetchChallenge("singlePlayer");
        console.log(challengeData.goal)
        this.challenge = new Challenge(challengeData.start, challengeData.goal);
    }

    public addChallengeIndicator(scene: Phaser.Scene, data: number, x: number, y: number, width: number, height: number, lineWidth: number): void {
        // Check if switch should hold a marble to fulfill the winning requirements
        if (data == 2) {
            // add indicator, here a semi-transparent, orange rectangle
            const indicatorRectangle = scene.add.rectangle(x, y, width, height, this.playerColor, 0.5);
            indicatorRectangle.setDepth(-1);
        }
    }

    public createPlayerStatus(scene: Phaser.Scene, x: number, y: number, width: number, height: number, boardWidth: number): void {
        // player status not required for single player challenge
    }

    public getMarbleSprite(playerTurn: number, scene: Phaser.Scene): string {
        return scene.registry.get("marbleSkin");
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

        return new GameEvaluation(finished);
    }

    public getAgentMove(): Promise<number> {
        throw new Error("Method not callable for this game mdoe.");
    }

    public getPlayerNames(): string[] {
        throw new Error("Method not callable for this game mdoe.");
    }
}