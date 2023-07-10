import Utilities from "../Utilities";
import MainGame from "./MainGame";
import MainMenu from "./MainMenu";

export default class Victory extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "Victory";

	public preload(): void {
		// Preload as needed.
	}

	public create(): void {
		Utilities.LogSceneMethodEntry("Victory", "create");
		
        const overlayHeight = this.cameras.main.height / 2;
        const overlayWidth = this.cameras.main.width;

        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.5);
        graphics.fillRect(0, 0, overlayWidth, overlayHeight);

        const victoryText = this.add.text(
        overlayWidth / 2,
        overlayHeight / 2,
        'Victory',
        { fontSize: '48px', color: '#ffffff' }
        );
        victoryText.setOrigin(0.5);

        setTimeout(() => {
            this.scene.stop(MainGame.Name);
            this.scene.stop(Victory.Name);
            this.scene.start(MainMenu.Name);
        }, 3000);
	}

	public update(): void {
		// Update logic, as needed.
	}
}
