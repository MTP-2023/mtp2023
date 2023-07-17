import { Challenge, GameEvaluation, AbstractGameMode } from "./GameModeResources";
import { fetchChallenge } from "../../cAPICalls";

export class SinglePlayerChallenge extends AbstractGameMode {
    challenge: Challenge = new Challenge([], []);
    isLocal: boolean = true;
    playerColor = 0xffa500;

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
        console.log("HERE")
        if (data == 2) {
            // add indicator, here a semi-transparent, orange rectangle
            const indicatorRectangle = scene.add.rectangle(x, y, width, height, this.playerColor, 0.5);
            indicatorRectangle.setDepth(-1);
        }
    }

    public createPlayerStatus(scene: Phaser.Scene, x: number, y: number, width: number, height: number, boardWidth: number): void {
        
        /*
        const playerStatusContainer = scene.add.container(x, y);
        const playerNameText = scene.add.text(0, 0, "Player 1", { fontSize: 16,  color: this.playerColor.toString()});
        playerStatusContainer.add(playerNameText);*/
    }

    public handleTurnSwitch(playerTurn: number): [ marblePNG: string, turn: number ] {
        const newSpritePNG = "marble-p1";
        return [
            newSpritePNG,
            1
        ]
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