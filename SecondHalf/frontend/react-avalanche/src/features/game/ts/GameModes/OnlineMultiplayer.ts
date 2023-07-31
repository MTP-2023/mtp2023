import { Challenge, GameEvaluation, AbstractGameMode, MessageAvalanche, MessageType } from "./GameModeResources";
import { Lobby } from "./GameModeResources";
import EventEmitter from "phaser3-rex-plugins/plugins/utils/eventemitter/EventEmitter";
import { waitFor } from "wait-for-event";

export class OnlineMultiPlayer extends AbstractGameMode {
    challenge: Challenge = new Challenge([], []);
    isLocal: boolean = false;
    isMultiplayer: boolean = true;
    isVsAi: boolean = false;
    player1Color = 0xffa500;
    player2Color = 0x0000ff;
    mixedColor = 0x925e6d;
    player1Name = "";
    player2Name = "";
    player1Skin = "";
    player2Skin = "";
    player1Wins = 0;
    player2Wins = 0;
    latestWinner = 0;
    me = 1;
    ws: WebSocket;
    public gameOverEvent: EventEmitter;
    public moveEvent: EventEmitter;
    public boardEvent: EventEmitter;
    public joinEvent: EventEmitter;
    public dcEvent: EventEmitter;

    public constructor(){
        super();
        this.gameOverEvent = new EventEmitter();
        this.moveEvent = new EventEmitter();
        this.boardEvent = new EventEmitter();
        this.joinEvent = new EventEmitter();
        this.dcEvent = new EventEmitter();
    }

    public async getAgentMove(): Promise<number> {
        return 1;
    }

    public getPlayerNames(): string[] {
        return [this.player1Name, this.player2Name];
    }

    gameOver() {
        // Emit the custom event when the game is over
        this.gameOverEvent.emit("");
    }
    
    updateScore(score: number) {
        // Emit the custom event when the score is updated
        this.moveEvent.emit(score.toString());
    }
      
    public async create(create: boolean, code: number, playerName: string, marbleSkin: string): Promise<void> {
        //var code = this.generateRandomSixDigitNumber();
        //var existing = false;
        // while(existing){
        //    existing = await checkCode(code);
        //    code = this.generateRandomSixDigitNumber();
        //}
        if(create){
            this.ws = new WebSocket("ws://localhost:8000/lobbies/"+ code.toString() + "?player=" + playerName + "&marbleSkin=" + marbleSkin + "&operation=create");
        } else {
            this.ws = new WebSocket("ws://localhost:8000/lobbies/"+ code.toString() + "?player=" + playerName + "&marbleSkin=" + marbleSkin + "&operation=join");
        }
        
        this.ws.onopen = () => {
            console.log("WebSocket is connected..");
        };
        this.ws.onmessage = (event) => {
            console.log("Received message from server: ", event.data);
            var receivedData = JSON.parse(event.data);
            var lobby: Lobby = JSON.parse(receivedData);
            console.log(lobby.goalBoard);
            switch(lobby.messageType){
                case "challenge":
                    this.challenge = new Challenge(lobby.currentBoard, lobby.goalBoard);
                    this.player1Name = lobby.player1_name;
                    this.player2Name = lobby.player2_name;
                    this.boardEvent.emit("emit");
                    break;
                case "move":
                    this.moveEvent.emit("move", lobby.recentMove);
                    break;
                case "join":
                    console.log("join received");
                    console.log("setting", lobby.player1_Skin, "and", lobby.player2_Skin,"as skins")
                    this.player1Skin = lobby.player1_Skin;
                    this.player2Skin = lobby.player2_Skin;
                    this.joinEvent.emit("join");
                    break;
                case "dc":
                    console.log("he disconnected");
                    this.dcEvent.emit("dc")
                    break;
                case "next round":
                    this.challenge = new Challenge(lobby.currentBoard, lobby.goalBoard);
                    this.player1Wins = lobby.player1_wins;
                    this.player2Wins = lobby.player2_wins;
                    break;
            }
        };
        this.ws.onerror = (event) => {
            console.error("WebSocket error: ", event);
        };
        this.ws.onclose = (event) => {
            console.log("WebSocket connection closed: ", event);
        };
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

    public handleTurnSwitch(playerTurn: number): [ marblePNG: string, turn: number ] {
        const newTurn = playerTurn * (-1);
        let newSpritePNG = "marble";

        switch (newTurn) {
            case 1:
                newSpritePNG = "marble-p1";
                break;
            case -1:
                console.log("sprite now p2")
                newSpritePNG = "marble-p2";
                break;
        }

        return [
            newSpritePNG,
            newTurn
        ]
    }

    public async makeMove(col: number){
        var data = {
            "move": col
        };
        this.ws.send(JSON.stringify(new MessageAvalanche(MessageType.MOVE, data)));
        await waitFor("emit", this.moveEvent);
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
                this.latestWinner = p1.won ? 1 : -1;
            }
        }

        return new GameEvaluation(finished, winnerList);
    }

    public async notifyWin(){
        var data = {
            "winner" : this.latestWinner
        }
        this.ws.send(JSON.stringify(new MessageAvalanche(MessageType.WIN, data)));
    }

    public getMarbleSprite(playerTurn: number, scene: Phaser.Scene): string {
        let newSpritePNG = "marble";

        switch (playerTurn) {
            case 1:
                newSpritePNG = this.player1Skin;
                break;
            case -1:
                newSpritePNG = this.player2Skin;
                break;
        }

        return newSpritePNG;
    }
}