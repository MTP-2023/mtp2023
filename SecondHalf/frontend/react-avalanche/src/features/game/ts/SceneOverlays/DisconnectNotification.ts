import Utilities from "../Utilities";
import MainGame from "../Scenes/MainGame";
import MainMenu from "../Scenes/MainMenu";
import GameEnd from "./GameEnd";

export default class DisconnectNotification extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "DisconnectNotification";

	public preload(): void {
		// Preload as needed.
	}

	public create(): void {
		Utilities.LogSceneMethodEntry("DisconnectNotification", "create");
		
        const overlayHeight = this.cameras.main.height;
        const overlayWidth = this.cameras.main.width;

        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.5);
        graphics.fillRect(0, 0, overlayWidth, overlayHeight);

        // set background image
        const textBg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "wood-rounded-rectangle");
        textBg.setScale(0.8);

        const dcText = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY,
            "Your opponent disconnected. You are now returning to the main menu...",
            { fontSize: '50px', fontFamily: "monospace", align: "center", color: '#ffffff' },
        );
        dcText.setWordWrapWidth(textBg.width*0.6)
        dcText.setOrigin(0.5);

        setTimeout(() => {
            this.scene.stop(MainGame.Name);
            this.scene.stop(GameEnd.Name);
            this.scene.stop(DisconnectNotification.Name);
            this.scene.start(MainMenu.Name);
        }, 3000);
    }

	public update(): void {
		// Update logic, as needed.
	}
}
