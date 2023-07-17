import { Challenge, GameEvaluation, AbstractGameMode } from "./GameModeResources";
import { interpretBoard } from "../Helper/BoardInterpreter";
import { fetchChallenge } from "../../cAPICalls";

export class LocalMultiPlayer extends AbstractGameMode {
    challenge: Challenge = new Challenge([], []);
    player1Color = 0xffa500;
    player2Color = 0x0000ff;

    public async initChallenge(): Promise<void> {
        const challengeData = await fetchChallenge("twoPlayers");
        //console.log(challengeData.goal)
        this.challenge = new Challenge(challengeData.start, challengeData.goal);
    }

    public addChallengeIndicator(scene: Phaser.Scene, data: number, x: number, y: number, width: number, height: number, lineWidth: number): void {
        // Check if switch should hold a marble to fulfill the winning requirements
        if (data == 2) {
            const indicatorRectangle = scene.add.rectangle(x, y, width, height, this.player1Color, 0.5);
            indicatorRectangle.setDepth(-1);
        } else if (data == -2) {
            const indicatorRectangle = scene.add.rectangle(x, y, width, height, this.player2Color, 0.5);
            indicatorRectangle.setDepth(-1);
        }
    }

    public createPlayerStatus(scene: Phaser.Scene, x: number, y: number, width: number, height: number, boardWidth: number): void {
        
        /*
        const playerStatusContainer = scene.add.container(x, y);
        const playerNameText = scene.add.text(0, 0, "Player 1", { fontSize: 16,  color: this.playerColor.toString()});
        playerStatusContainer.add(playerNameText);*/
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