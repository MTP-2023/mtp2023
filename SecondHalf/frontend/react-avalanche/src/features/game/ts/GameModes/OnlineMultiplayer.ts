import { Challenge, GameEvaluation, AbstractGameMode } from "./GameModeResources";
import { fetchChallenge } from "../../cAPICalls";
import { Lobby } from "./GameModeResources";

export class OnlineMultiPlayer extends AbstractGameMode {
    challenge: Challenge = new Challenge([], []);
    isLocal: boolean = true;
    player1Color = 0xffa500;
    player2Color = 0x0000ff;
    mixedColor = 0x925e6d;

    public async initChallenge(): Promise<void> {
        // client.ts
        const ws = new WebSocket("ws://localhost:8000/lobbies/create/?player=shadowwizardmoneygang");
        ws.onopen = () => {
          console.log("WebSocket is connected..");
          ws.send("Hello, server!");
        };
        ws.onmessage = (event) => {
          console.log("Received message from server: ", event.data);
          var receivedData = JSON.parse(event.data);
          var lobby: Lobby = JSON.parse(receivedData);
          this.challenge = new Challenge(lobby.currentBoard, lobby.goalBoard);
        };
        ws.onerror = (event) => {
          console.error("WebSocket error: ", event);
        };
        ws.onclose = (event) => {
          console.log("WebSocket connection closed: ", event);
        };
        //const challengeData = await fetchChallenge("twoPlayers");
        //console.log(challengeData.goal)
        //this.challenge = new Challenge(challengeData.start, challengeData.goal);
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

    public createPlayerStatus(scene: Phaser.Scene, x: number, y: number, width: number, height: number, boardWidth: number): void {

        /*
        const playerStatusContainer = scene.add.container(x, y);
        const playerNameText = scene.add.text(0, 0, "Player 1", { fontSize: 16,  color: this.playerColor.toString()});
        playerStatusContainer.add(playerNameText);*/
    }

    public handleTurnSwitch(playerTurn: number): [ marblePNG: string, turn: number ] {
        const newTurn = playerTurn * (-1);
        let newSpritePNG = "marble";

        switch (newTurn) {
            case 1:
                newSpritePNG = "marble-p1";
                break;
            case -1:
                newSpritePNG = "marble-p2";
                break;
        }

        return [
            newSpritePNG,
            newTurn
        ]
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

        return new GameEvaluation(true, finished, winnerList);
    }
}