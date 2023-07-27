import Utilities from "../Utilities";
import MainGame from "./MainGame";
import MainMenu from "./MainMenu";

export default class AgentSelect extends Phaser.Scene {
    /**
     * Unique name of the scene.
     */
    public static Name = "AgentSelect";

    public preload(): void {
        // Preload as needed.
    }

    public create(mainMenuScene: MainMenu): void {
        Utilities.LogSceneMethodEntry("GameEnd", "create");
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

        const selectBg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "wood-label");
        selectBg.setScale(0.6);

        const instructionText = this.add.text(textXPosition, textYPosition*3.1, "Select your opponent");
        instructionText
            .setFontFamily("monospace")
            .setFontSize(50)
            .setFill("#fff")
            .setAlign("center")
            .setOrigin(0.5);

        // RL button
        const rlButton = this.add.image(textXPosition, textYPosition*4, "wood-hexagon");
        rlButton.setScale(0.3);

        const rlText = this.add.text(textXPosition, textYPosition*4, "PPO Agent");
        rlText
            .setFontFamily("monospace")
            .setFontSize(50)
            .setFill("#fff")
            .setAlign("center")
            .setOrigin(0.5);

        rlButton.setInteractive();

        rlButton.on("pointerover", () => {
            this.toggleTextShadow(rlText, true);
        });

        rlButton.on("pointerout", () => {
            this.toggleTextShadow(rlText, false);
        });

        rlButton.on("pointerdown", () => {
            this.scene.stop(AgentSelect.Name);
            this.scene.stop(MainMenu.Name);
            this.scene.start(MainGame.Name, {gameModeHandle: "localvsai", agent: "rl"});
        }, this);

        
        // MCTS button
        const mctsButton = this.add.image(textXPosition, textYPosition*5, "wood-hexagon");
        mctsButton.setScale(0.3);

        const mctsText = this.add.text(textXPosition, textYPosition*5, "MCTS");
        mctsText
            .setFontFamily("monospace")
            .setFontSize(50)
            .setFill("#fff")
            .setAlign("center")
            .setOrigin(0.5);

        mctsButton.setInteractive();

        mctsButton.on("pointerover", () => {
            this.toggleTextShadow(mctsText, true);
        });

        mctsButton.on("pointerout", () => {
            this.toggleTextShadow(mctsText, false);
        });

        mctsButton.on("pointerdown", () => {
        this.scene.stop(MainMenu.Name);
        this.scene.stop(AgentSelect.Name);
        this.scene.start(MainGame.Name, {gameModeHandle: "localvsai", agent: "mcts"});
        }, this);


        const closeCircle = this.add.sprite(0, 0, "wood-circle");
        closeCircle.setScale(0.1);

        const closeCross = this.add.sprite(0, 0, "close-cross");
        closeCross.setScale(0.05); 
        closeCross.setDepth(1);

        const closeButton = this.add.container(
            textXPosition + this.cameras.main.width/4.2,
            textYPosition*3.1
        );

        closeButton.add(closeCircle);
        closeButton.add(closeCross);

        closeButton.setSize(closeCross.width, closeCross.height);
        closeButton
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.stop();
                this.scene.resume(MainMenu.Name);
            });
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

