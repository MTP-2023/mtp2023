import { Challenge, GameEvaluation, AbstractGameMode } from "./GameModeResources";
import { fetchChallenge } from "../../cAPICalls";
import { agentMove } from "../../cAPICalls";

export class LocalVsAi extends AbstractGameMode {
    challenge: Challenge = new Challenge([], []);
    isLocal: boolean = true;
    isMultiplayer: boolean = true;
    isVsAi: boolean = true;
    aiPlayer: number = -1;
    player1Color = 0xffa500;
    player2Color = 0x0000ff;
    mixedColor = 0x925e6d;

    public async initChallenge(): Promise<void> {
        console.log("here")
        const challengeData = await fetchChallenge("twoPlayers");
        //console.log(challengeData.goal)
        this.challenge = new Challenge(challengeData.start, challengeData.goal);
        this.currentBoard = this.challenge.originalStart;
    }

    public addChallengeIndicator(scene: Phaser.Scene, data: number, x: number, y: number, width: number, height: number, lineWidth: number): void {
        // Check if switch should hold a marble to fulfill the winning requirements
        if (data == 2) {
            const indicatorRectangle = scene.add.rectangle(x, y, width, height, this.player1Color, 0.5);
            indicatorRectangle.setDepth(-1);
        } else if (data == -2) {
            const indicatorRectangle = scene.add.rectangle(x, y, width, height, this.player2Color, 0.5);
            indicatorRectangle.setDepth(-2);
        } else if (data == 3) {
            const indicatorRectangle = scene.add.rectangle(x, y, width, height, this.mixedColor, 0.5);
            indicatorRectangle.setDepth(-3);
        }
    }

    public createPlayerStatus(scene: Phaser.Scene, x: number, y: number, width: number, height: number, boardEnd: number): void {
        const playerNameText1 = scene.add.text(x, y, "Player 1", { fontSize: 30,  color: this.convertToCSS(this.player1Color), align: "center" });
        playerNameText1.setData("playerText", 1);

        const playerNameText2 = scene.add.text(boardEnd + x, y, "Player 2", { fontSize: 30,  color: this.convertToCSS(this.player2Color), align: "center" });
        playerNameText2.setData("playerText", -1);

        this.indicateTurn(1, scene);
    }

    public getMarbleSprite(playerTurn: number, scene: Phaser.Scene): string {
        let newSpritePNG = "marble";

        switch (playerTurn) {
            case 1:
                newSpritePNG = "marble-p1";
                break;
            case -1:
                newSpritePNG = "marble-p2";
                break;
        }

        return newSpritePNG;
    }

    public interpretGameState(board: number[][]): GameEvaluation {
        let playerStatus = [
            {
                "id": 1,
                "won": true,
                "handle": 1
            },
            {
                "id": -1,
                "won": true,
                "handle": 2
            }
        ];

        const flattenedGoal = this.challenge.goalBoard.flat();
        const flattenedBoard = board.flat();

        for (const player of playerStatus) {
            const target = 2 * player.id;
            for (const [idx, val] of flattenedGoal.entries()) {
                if ((val == target || val == 3) && flattenedBoard[idx] != target) {
                    player.won = false;
                    break;
                }
            }
        }

        const p1 = playerStatus[0];
        const p2 = playerStatus[1];

        let finished = p1.won || p2.won;

        let winnerList = [];
        if (finished) {
            for (const player of playerStatus) {
                if (player.won) {
                    winnerList.push(player.handle)
                }
            }
        }

        return new GameEvaluation(finished, winnerList);
    }

    public getOriginalStartBoard(): number[][] {
        return this.challenge.originalStart;
    }

    public getOriginalGoalBoard(): number[][] {
        return this.challenge.originalGoal;
    }

    public async getAgentMove(): Promise<number> {
        return await agentMove(this.currentBoard, this.getOriginalGoalBoard(), this.aiPlayer);
    }
}