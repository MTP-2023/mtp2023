import Utilities from "../Utilities";
import MainGame from "../Scenes/MainGame";
import MainMenu from "../Scenes/MainMenu";

export default class QuitGame extends Phaser.Scene {
    /**
     * Unique name of the scene.
     */
    public static Name = "QuitGame";
    private clickAudio: any;

    public preload(): void {
        // Preload as needed.
    }

    public create(mainMenuScene: MainMenu): void {
        Utilities.LogSceneMethodEntry("QuitGame", "create");

        this.clickAudio = this.sound.add("woodenClick");

        const textYPosition = this.cameras.main.height/8;
        const textXPosition = this.cameras.main.centerX;
        
        const graphics = this.add.graphics();
        // Set the fill color and alpha (transparency) to create the dark overlay effect
        const fillColor = 0x000000; // Black color
        const alpha = 0.7; // Adjust the alpha value to control the darkness
        graphics.fillStyle(fillColor, alpha);

        // Draw a rectangle covering the entire scene
        const sceneWidth = this.cameras.main.width;
        const sceneHeight = this.cameras.main.height;
        graphics.fillRect(0, 0, sceneWidth, sceneHeight);

        const quitBg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "wood-label");
        quitBg.setScale(0.6);

        const instructionText = this.add.text(textXPosition, textYPosition*3.5, "Are you sure you want to quit the game?");
        instructionText.setWordWrapWidth(this.scale.width*0.5);
        instructionText
            .setFontFamily("rubik")
            .setFontSize(50)
            .setFill("#fff")
            .setAlign("center")
            .setOrigin(0.5);

        // Yes button
        const yesButton = this.add.image(this.scale.width*0.35, textYPosition*4.5, "wood-hexagon");
        yesButton.setScale(0.2);

        const yesText = this.add.text(this.scale.width*0.35, textYPosition*4.5, "Yes");
        yesText
            .setFontFamily("rubik")
            .setFontSize(50)
            .setFill("#fff")
            .setAlign("center")
            .setOrigin(0.5);

        yesButton.setInteractive();

        yesButton.on("pointerover", () => {
            this.toggleTextShadow(yesText, true);
        });

        yesButton.on("pointerout", () => {
            this.toggleTextShadow(yesText, false);
        });

        yesButton.on("pointerdown", () => {
            this.clickAudio.play();
            this.scene.stop(MainGame.Name);
            this.scene.stop(QuitGame.Name);
            this.scene.start(MainMenu.Name)
        }, this);

        
        // No button
        const noButton = this.add.image(this.scale.width*0.65, textYPosition*4.5, "wood-hexagon");
        noButton.setScale(0.2);

        const noText = this.add.text(this.scale.width*0.65, textYPosition*4.5, "No");
        noText
            .setFontFamily("rubik")
            .setFontSize(50)
            .setFill("#fff")
            .setAlign("center")
            .setOrigin(0.5);

        noButton.setInteractive();

        noButton.on("pointerover", () => {
            this.toggleTextShadow(noText, true);
        });

        noButton.on("pointerout", () => {
            this.toggleTextShadow(noText, false);
        });

        noButton.on("pointerdown", () => {
            this.clickAudio.play();
            this.scene.stop();
            this.scene.resume(MainGame.Name);
        }, this);
    }

    private toggleTextShadow(text: Phaser.GameObjects.Text, toggleOn: boolean) {
        if (toggleOn) {
            text.setShadow(5, 5, 'rgba(0,0,0,0.5)', 4);
        } else {
            text.setShadow(0, 0, undefined);
        }
    }

    public update():
        void {
        // Update logic, as needed.
    }

}

