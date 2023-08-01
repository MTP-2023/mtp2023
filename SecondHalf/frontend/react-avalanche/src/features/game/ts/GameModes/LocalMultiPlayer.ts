import { Challenge, GameEvaluation, AbstractGameMode } from "./GameModeResources";
import {agentMove, fetchChallenge} from "../../cAPICalls";

export class LocalMultiPlayer extends AbstractGameMode {
    challenge: Challenge = new Challenge([], []);
    isLocal: boolean = true;
    isMultiplayer: boolean = true;
    isVsAi: boolean = false;
    mixedColor = 0x396cff;

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
            indicatorRectangle.setDepth(-2);
        } else if (data == 3) {
            const indicatorRectangle = scene.add.rectangle(x, y, width, height, this.mixedColor, 0.5);
            indicatorRectangle.setDepth(-3);
        }
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

    public getAgentMove(): Promise<number> {
        throw new Error("Method not callable for this game mdoe.");
    }

    public getPlayerNames(): string[] {
        return [
            "Player 1",
            "Player 2"
        ]
    }

    public createPlayerStatus(scene: Phaser.Scene, x: number, y: number, width: number, height: number, boardEnd: number, player1Text: string, player2Text: string, imgLabel: string, imgScale: number): void {
        // Create a container to hold the image and text
        const container1 = scene.add.container(x, y);
        container1.setSize(width, height);

        // Add the image to the container
        const image1 = scene.add.image(0, 0, imgLabel).setScale(imgScale);
        container1.add(image1);

        // Add the text on top of the image in the container
        this.player1NameText = scene.add.text(0, 0, player1Text, { fontSize: 40, fontFamily: "monospace", color: this.convertToCSS(this.player1Color), align: "center" }).setOrigin(0.5);
        container1.add(this.player1NameText);

        // Set the custom data for the container and text
        container1.setData("playerText", 1);
        this.player1NameText.setData("playerText", 1);

        // add score circle
        const scoreCircle1 = scene.add.image(0, 100, "wood-circle").setScale(0.1);
        const scoreText1 =  scene.add.text(0, 100, "1", { fontSize: 36, fontFamily: "monospace", color: this.convertToCSS(this.player1Color), align: "center" }).setOrigin(0.5);
        container1.add(scoreCircle1);
        container1.add(scoreText1);


        // Repeat the process for player 2
        const container2 = scene.add.container(scene.cameras.main.width - x, y);
        container2.setSize(width, height);

        const image2 = scene.add.image(0, 0, imgLabel).setScale(imgScale);
        container2.add(image2);

        this.player2NameText = scene.add.text(0, 0, player2Text, { fontSize: 40, fontFamily: "monospace", color: this.convertToCSS(this.player2Color), align: "center" }).setOrigin(0.5);
        container2.add(this.player2NameText);

        container2.setData("playerText", -1);
        this.player2NameText.setData("playerText", -1);

        // add score circle
        const scoreCircle2 = scene.add.image(0, 100, "wood-circle").setScale(0.1);
        const scoreText2 =  scene.add.text(0, 100, "1", { fontSize: 36, fontFamily: "monospace", color: this.convertToCSS(this.player2Color), align: "center" }).setOrigin(0.5);
        container2.add(scoreCircle2);
        container2.add(scoreText2);

        this.indicateTurn(1, scene);
    }
}