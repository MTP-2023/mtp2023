import Utilities from "../Utilities";
import MainGame from "../Scenes/MainGame";
import MainMenu from "../Scenes/MainMenu";
import { AbstractGameMode } from "../GameModes/GameModeResources";
import { OnlineMultiPlayer } from "../GameModes/OnlineMultiplayer";
import { waitFor } from "wait-for-event";

export default class GameEnd extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "GameEnd";
    private clickAudio: any;
    private gameMode: AbstractGameMode;
    private infoText: Phaser.GameObjects.Text;
	public preload(): void {
		// Preload as needed.
	}

	public create(data: { displayText: string, gameMode: AbstractGameMode, gameScene: MainGame }): void {
		Utilities.LogSceneMethodEntry("GameEnd", "create");
		
        const overlayHeight = this.cameras.main.height;
        const overlayWidth = this.cameras.main.width;

        this.clickAudio = this.sound.add("woodenClick");
        this.gameMode = data.gameMode;

        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.5);
        graphics.fillRect(0, 0, overlayWidth, overlayHeight);

        // set background image
        const textBg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY*0.8, "wood-victory");
        textBg.setScale(0.8);

        const victorySound = this.sound.add("victory");
        victorySound.setVolume(0.1);
        victorySound.play();


        this.infoText = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY*0.8,
            data.displayText,
            { fontSize: '60px', fontFamily: "rubik", align: "center", color: '#ffffff' },
        );
        this.infoText.setWordWrapWidth(textBg.width*0.6)
        this.infoText.setOrigin(0.5);

        // Play again button
        const playAgainButton = this.add.image(this.cameras.main.centerX/3*2, this.cameras.main.centerY*1.5, "wood-hexagon");
        playAgainButton.setScale(0.25);
        playAgainButton.setInteractive();

        const createText = this.add.text(this.cameras.main.centerX/3*2, this.cameras.main.centerY*1.5, "Play Again");
        createText
            .setFontFamily("rubik")
            .setFontSize(40)
            .setFill("#fff")
            .setAlign("center")
            .setOrigin(0.5);

        playAgainButton.on("pointerover", () => {
            this.toggleTextShadow(createText, true);
        });

        playAgainButton.on("pointerout", () => {
            this.toggleTextShadow(createText, false);
        });

        playAgainButton.on("pointerdown", () => {
            this.clickAudio.play();
            this.onPlayAgainClicked(playAgainButton);
        });

        // Join Lobby button
        const returnToMenuButton = this.add.image(this.cameras.main.centerX/3*4, this.cameras.main.centerY*1.5, "wood-hexagon");
        returnToMenuButton.setScale(0.25);
        returnToMenuButton.setInteractive();

        const joinText = this.add.text(this.cameras.main.centerX/3*4, this.cameras.main.centerY*1.5, "Return to Menu");
        joinText
            .setFontFamily("rubik")
            .setFontSize(40)
            .setFill("#fff")
            .setAlign("center")
            .setOrigin(0.5);

        returnToMenuButton.on("pointerover", () => {
            this.toggleTextShadow(joinText, true);
        });

        returnToMenuButton.on("pointerout", () => {
            this.toggleTextShadow(joinText, false);
        });

        returnToMenuButton.on("pointerdown", () => {
            this.clickAudio.play();
            data.gameScene.backgroundSound.stop();
            this.onReturnToMenuClicked();
        });
	}

    private async onPlayAgainClicked(button: Phaser.GameObjects.Image): Promise<void> {
        this.clickAudio.play();
        if(!this.gameMode.isLocal){
            var onlinegame = this.gameMode as OnlineMultiPlayer;
            if(!onlinegame.waitingForConfirmation){
                onlinegame.notifyWin();
                console.log("waiting for opponent");
                this.infoText.text = "Waiting for opponent..."
                button.disableInteractive();
                await waitFor("confirmed", onlinegame.newGameEvent);
            } else {
                onlinegame.confirmNextMatch();
            }
        }
        this.scene.stop();
        this.scene.start(MainGame.Name);
    }

    private onReturnToMenuClicked(): void {
        this.clickAudio.play();
        if(!this.gameMode.isLocal){
            var onlinegame = this.gameMode as OnlineMultiPlayer;
            onlinegame.ws.close();
        }
        this.scene.stop(MainGame.Name);
        this.scene.stop(GameEnd.Name);
        this.scene.start(MainMenu.Name);
    }

    private toggleTextShadow(text: Phaser.GameObjects.Text, toggleOn: boolean) {
        if (toggleOn) {
            text.setShadow(5, 5, 'rgba(0,0,0,0.5)', 4);
        } else {
            text.setShadow(0, 0, undefined);
        }
    }


	public update(): void {
		// Update logic, as needed.
	}
}
