import Utilities from "../Utilities";
import MainGame from "../Scenes/MainGame";
import MainMenu from "../Scenes/MainMenu";

export default class GameEnd extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "GameEnd";
    private clickAudio: any;

	public preload(): void {
		// Preload as needed.
	}

	public create(data: { displayText: string }): void {
		Utilities.LogSceneMethodEntry("GameEnd", "create");
		
        const overlayHeight = this.cameras.main.height;
        const overlayWidth = this.cameras.main.width;

        this.clickAudio = this.sound.add("woodenClick");

        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.5);
        graphics.fillRect(0, 0, overlayWidth, overlayHeight);

        // set background image
        const textBg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY*0.8, "wood-victory");
        textBg.setScale(0.8);

        const victorySound = this.sound.add("victory");
        victorySound.setVolume(0.1);
        victorySound.play();

        const victoryText = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY*0.8,
            data.displayText,
            { fontSize: '60px', fontFamily: "rubik", align: "center", color: '#ffffff' },
        );
        victoryText.setWordWrapWidth(textBg.width*0.6)
        victoryText.setOrigin(0.5);

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
            this.onPlayAgainClicked();
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
            this.onReturnToMenuClicked();
        });
	}

    private onPlayAgainClicked(): void {
        this.clickAudio.play();
        this.scene.stop();
        this.scene.start(MainGame.Name);
    }

    private onReturnToMenuClicked(): void {
        this.clickAudio.play();
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
