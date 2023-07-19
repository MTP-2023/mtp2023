import Utilities from "../Utilities";
import MainGame from "./MainGame";
import MainMenu from "./MainMenu";

export default class GameEnd extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "GameEnd";

	public preload(): void {
		// Preload as needed.
	}

	public create(data: { displayText: string }): void {
		Utilities.LogSceneMethodEntry("GameEnd", "create");
		
        const overlayHeight = this.cameras.main.height;
        const overlayWidth = this.cameras.main.width;

        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.5);
        graphics.fillRect(0, 0, overlayWidth, overlayHeight);

        const victoryText = this.add.text(
        overlayWidth / 2,
        overlayHeight / 2,
        data.displayText,
        { fontSize: '72px', color: '#ffffff' }
        );
        victoryText.setOrigin(0.5);

        setTimeout(() => {
            this.scene.stop(MainGame.Name);
            this.scene.stop(GameEnd.Name);
            this.scene.start(MainMenu.Name);
        }, 3000);
	}

	public update(): void {
		// Update logic, as needed.
	}
}
