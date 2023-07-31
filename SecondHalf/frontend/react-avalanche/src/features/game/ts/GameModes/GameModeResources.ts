    // class for object that must be returned by interpretGameState
export class GameEvaluation {
    hasWinner: boolean;
    winner: number[];

    constructor(finished: boolean, playerWon: number[] = []) {
        this.hasWinner = finished;
        this.winner = playerWon;
    }
}

import { interpretBoard } from "../Helper/BoardInterpreter";
export class Challenge {
    startBoard: number[][];
    goalBoard: number[][];
    originalGoal: number[][];
    originalStart: number[][];

    constructor(start: number[][], goal: number[][]) {
        this.startBoard = interpretBoard(start);
        this.goalBoard = interpretBoard(goal);
        this.originalGoal = goal;
        this.originalStart = start;
        console.log("ORIGINAL GOAL")
        console.log(this.originalGoal)
    }
}

export abstract class AbstractGameMode {
    abstract challenge: Challenge;
    isLocal: boolean = false;
    isMultiplayer: boolean = false;
    isVsAi: boolean = false;
    agent: string = "rl";
    currentBoard: number[][] = [];
    player1Color = 0x013220;
    player2Color = 0x0000ff;
    player1NameText: Phaser.GameObjects.Text;
    player2NameText: Phaser.GameObjects.Text;

    // function that obtains the challenge data, i.e. requests a start and goal board from the server, and initializes the class variable 'challenge'
    public initChallenge(): void {
        if (typeof this.challenge === 'undefined') {
            throw new Error('myVariable must be set in the constructor.');
        }
    };

    protected convertToCSS(decimalColor: number): string {
        const hexColor = decimalColor.toString(16).padStart(6, '0');
        return `#${hexColor}`;
      }

    public getStartBoard(): number[][] {
        return this.challenge.startBoard;
    }

    public getGoalBoard(): number[][] {
        return this.challenge.goalBoard;
    }

    public getOriginalStartBoard(): number[][] {
        return this.challenge.startBoard;
    }

    public getOriginalGoalBoard(): number[][] {
        return this.challenge.goalBoard;
    }

    public getCurrentBoard(): number[][]{
        return this.currentBoard;
    }

    public switchTurns(currentPlayer: number, scene: Phaser.Scene): number {
        console.log("CALLED SWITCH");
        //console.log("SWITCHING TURNS", currentPlayer);
        this.stopIndicator(currentPlayer, scene);
        //console.log("STOPPED INDICATOR");
        const nextPlayer = currentPlayer * (-1);
        this.indicateTurn(nextPlayer, scene);
        //console.log("STARTED INDICATOR", nextPlayer);
        return nextPlayer;
    }

    protected indicateTurn(playerID: number, scene: Phaser.Scene): void {
        console.log("TURN ON", playerID);
        // Find the Text object based on its custom ID
        const highlightText = playerID === 1 ? this.player1NameText : this.player2NameText;
        if (highlightText instanceof Phaser.GameObjects.Text) {
            console.log(highlightText.text);
            // Create a timer that repeatedly calls the blinkText function every 500ms
            const blinkTimer = scene.time.addEvent({
                delay: 500,
                callback: this.blinkText,
                args: [highlightText],
                callbackScope: this,
                loop: true,
            });
    
            // Save the timer as a property of the Text object
            highlightText.setData("blinkTimer", blinkTimer);
        }
    }
    
    
    protected blinkText(text: Phaser.GameObjects.Text): void {
        // Toggle the text visibility by setting alpha to 0 (invisible) or 1 (visible)
        text.alpha = text.alpha === 0.3 ? 1 : 0.3;
    }

    protected stopIndicator(playerID: number, scene: Phaser.Scene): void {
        console.log("TURN OFF", playerID);
        // Find the Text object based on its custom ID
        const highlightText = playerID === 1 ? this.player1NameText : this.player2NameText;
    
        if (highlightText instanceof Phaser.GameObjects.Text) {
            // Retrieve the timer from the Text object's data
            const blinkTimer = highlightText.getData("blinkTimer");
    
            if (blinkTimer) {
                // Stop and remove the timer, and make the text fully visible
                blinkTimer.remove();
                highlightText.setData("blinkTimer", null);
                highlightText.alpha = 1;
            }
        }
    }
    
    public stopIndicators(scene: Phaser.Scene): void {
        const foundTexts = scene.children.getChildren();
        for (const foundText of foundTexts) {
            if (foundText instanceof Phaser.GameObjects.Text) {
                // Retrieve the timer from the Text object's data
                const blinkTimer = foundText.getData("blinkTimer");
    
                if (blinkTimer) {
                    // Stop and remove the timer, and make the text fully visible
                    blinkTimer.remove();
                    foundText.setData("blinkTimer", null);
                    foundText.alpha = 1;
                }
            }
        }
    }
    
    public createPlayerStatus(scene: Phaser.Scene, x: number, y: number, width: number, height: number, boardEnd: number, player1Text: string, player2Text: string, imgLabel: string, imgScale: number): void {
        // Create a container to hold the image and text
        const container1 = scene.add.container(x, y);
        container1.setSize(width, height);

        // Add the image to the container
        const image1 = scene.add.image(0, 0, imgLabel).setScale(imgScale);
        container1.add(image1);

        // Add the text on top of the image in the container
        this.player1NameText = scene.add.text(0, 0, player1Text, { fontSize: 40, fontFamily: "rubik", color: this.convertToCSS(this.player1Color), align: "center" }).setOrigin(0.5);
        container1.add(this.player1NameText);

        // Set the custom data for the container and text
        container1.setData("playerText", 1);
        this.player1NameText.setData("playerText", 1);

        // Repeat the process for player 2
        const container2 = scene.add.container(scene.cameras.main.width - x, y);
        container2.setSize(width, height);

        const image2 = scene.add.image(0, 0, imgLabel).setScale(imgScale);
        container2.add(image2);

        this.player2NameText = scene.add.text(0, 0, player2Text, { fontSize: 40, fontFamily: "rubik", color: this.convertToCSS(this.player2Color), align: "center" }).setOrigin(0.5);
        container2.add(this.player2NameText);

        container2.setData("playerText", -1);
        this.player2NameText.setData("playerText", -1);

        this.indicateTurn(1, scene);
    }

    public abstract getMarbleSprite(playerTurn: number, scene: Phaser.Scene): string;

    public abstract addChallengeIndicator(scene: Phaser.Scene, data: number, x: number, y: number, width: number, height: number, lineWidth: number): void;

    // function that evaluates game state after each move and decides whether the game is over
    public abstract interpretGameState(board: number[][]): GameEvaluation;

    public abstract getAgentMove(): Promise<number>;

    public abstract getPlayerNames(): string[];
}

export class MessageAvalanche{
    type: MessageType;
    data: {};

    constructor(type: MessageType, data: {}){
        this.type = type
        this.data = data
    }
}

export interface Lobby {
    player1_name: string
    player2_name: string
    player1_wins: number
    player2_wins: number
    currentPlayer: number
    lobby_code: number
    currentBoard: number[][]
    goalBoard: number[][]
    width: number
    height: number
    minMarbles: number
    maxMarbles: number
    turnLimit: number
    availableMarbles: number
    isFull: boolean
    recentMove: number
    messageType: string
}

export enum MessageType {
    CREATE,
    JOIN,
    MOVE,
    NEWCHALLENGE,
    CHANGESETTINGS,
  }