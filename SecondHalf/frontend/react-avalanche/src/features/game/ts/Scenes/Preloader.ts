import SplashScreen from "./SplashScreen";
import Utilities from "../Utilities";

export default class Preloader extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "Preloader";

	public preload(): void {

		// images
		this.load.path = "src/features/game/assets/img/";
		this.load.image("phaser_pixel_medium_flat");
		// menu elements
		this.load.image("close-cross");
		this.load.image("menu-background");
		this.load.image("wood-rounded-rectangle");
		this.load.image("wood-hexagon");
		this.load.image("wood-rectangle");
		this.load.image("wood-label");
		this.load.image("wood-circle");
		this.load.image("game-mode-icon");
		// board elements
		this.load.image("switch-left");
		this.load.image("switch-right");
		// marble skins
		this.load.image("marble");
		this.load.image("marble-p1");
		this.load.image("marble-p2");

		/*
		this.load.spritesheet("animated-background", "background-spritesheet.png", {
			frameWidth: 1600,
			frameHeight: 1200,
			startFrame: 0
		});*/

		// shapes
		this.load.path = "src/features/game/assets/shapes/";
		this.load.json("switch-left-shape");
		this.load.json("switch-right-shape");
		this.load.json("marble-shape");

		// audio
		this.load.path = "src/features/game/assets/audio/";
		this.load.audio("snowStorm", "snowStorm.mp3");
		this.load.audio("woodenClick", "woodenClick.wav");
		
		// fonts
		this.load.path = "src/features/game/assets/fonts/";
		const fonts = [
			"Monoton-Regular.ttf"
		];
	}

	public create(): void {
		Utilities.LogSceneMethodEntry("Preloader", "create");

		this.scene.start(SplashScreen.Name);
	}

	public update(): void {
		// preload handles updates to the progress bar, so nothing should be needed here.
	}
}
