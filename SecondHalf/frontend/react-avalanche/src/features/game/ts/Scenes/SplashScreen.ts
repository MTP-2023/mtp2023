import Utilities from "../Utilities";
import MainMenu from "./MainMenu";

export default class SplashScreen extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "SplashScreen";

	public preload(): void {
		this.load.path = "assets/";
	}

	public create(): void {
		Utilities.LogSceneMethodEntry("SplashScreen", "create");

		// set default skin
		this.game.registry.set('marbleSkin', "marble");

		 // add background animation
		 this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, "frame0").play("animatedBackground");

		const titleText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY * 0.5, "SnowSlider")
			.setOrigin(0.5, 0)
			.setFontFamily("monoton").setFontSize(80).setFill("#000");

		const poweredByText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 120, "Powered By");
		poweredByText.setOrigin(0.5, 1);
		poweredByText.setFontFamily("monoton").setFontSize(36).setFill("#000");
		this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 160, "phaser_pixel_medium_flat").setScale(2);

		const attributionText = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 120, "UI elements by ukplyak on Freepik");
		attributionText.setOrigin(0.5);
		attributionText.setFontFamily("monospace").setFontSize(24).setFill("#000");

		this.input.setDefaultCursor("pointer");
		this.input.on("pointerdown", this.loadMainMenu, this);

		this.time.addEvent({
			// Run after three seconds.
			delay: 3000,
			callback: this.loadMainMenu,
			callbackScope: this,
			loop: false
		});
	}

	/**
	 * Load the next scene, the main menu.
	 */
	private loadMainMenu(): void {
		this.scene.start(MainMenu.Name);
	}
}
