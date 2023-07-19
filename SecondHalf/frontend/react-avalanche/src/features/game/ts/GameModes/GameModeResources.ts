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
    player1Color = 0xffa500;
    player2Color = 0x0000ff;

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
        this.stopIndicator(currentPlayer, scene);
        const nextPlayer = currentPlayer * (-1);
        this.indicateTurn(nextPlayer, scene);
        return nextPlayer;
    }

    protected indicateTurn(playerID: number, scene: Phaser.Scene): void {
        // Find the Text object based on its custom ID
        const foundText = scene.children.getChildren().find((child) => child.getData("playerText") === playerID);

        if (foundText instanceof Phaser.GameObjects.Text) {
            const textBounds = foundText.getBounds();
            const x = textBounds.x;
            const y = textBounds.y;
            const width = textBounds.width;
            const height = textBounds.height;

            // Create the rectangle graphics
            const rectangle = scene.add.graphics();
            rectangle.lineStyle(2, 0xffffff, 1);
            rectangle.strokeRect(x, y, width, height);

            // Start blinking the rectangle
            const blinkInterval = setInterval(() => {
                rectangle.visible = !rectangle.visible;
            }, 500); // Change blinking speed here (e.g., 500ms for half-second interval)

            // Save the interval ID and rectangle as properties of the Text object
            foundText.setData("blinkInterval", blinkInterval);
            foundText.setData("blinkRectangle", rectangle);
        }
    }

    protected stopIndicator(playerID: number, scene: Phaser.Scene): void {
        // Find the Text object based on its custom ID
        const foundText = scene.children.getChildren().find((child) => child.getData("playerText") === playerID);
        
        if (foundText instanceof Phaser.GameObjects.Text) {
            // Retrieve the interval ID and rectangle from the Text object's data
            const blinkInterval = foundText.getData("blinkInterval");
            const rectangle = foundText.getData("blinkRectangle");
        
            if (blinkInterval && rectangle) {
                // Stop the blinking and remove the rectangle graphics
                clearInterval(blinkInterval);
                foundText.data.remove("blinkInterval");
                foundText.data.remove("blinkRectangle");
                rectangle.destroy();
            }
        }
    }

    public createPlayerStatus(scene: Phaser.Scene, x: number, y: number, width: number, height: number, boardEnd: number, player1Text: string, player2Text: string): void {
        const playerNameText1 = scene.add.text(x, y, player1Text, { fontSize: 30,  color: this.convertToCSS(this.player1Color), align: "center" });
        playerNameText1.setData("playerText", 1);

        const playerNameText2 = scene.add.text(boardEnd + x, y, player2Text, { fontSize: 30,  color: this.convertToCSS(this.player2Color), align: "center" });
        playerNameText2.setData("playerText", -1);

        this.indicateTurn(1, scene);
    }

    public abstract getMarbleSprite(playerTurn: number, scene: Phaser.Scene): string;

    public abstract addChallengeIndicator(scene: Phaser.Scene, data: number, x: number, y: number, width: number, height: number, lineWidth: number): void;

    // function that evaluates game state after each move and decides whether the game is over
    public abstract interpretGameState(board: number[][]): GameEvaluation;

    public abstract getAgentMove(): Promise<number>;
}