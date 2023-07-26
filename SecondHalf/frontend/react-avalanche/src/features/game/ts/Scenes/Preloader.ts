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
		this.load.image("Phaser-Logo-Small");
		this.load.image("switch-left");
		this.load.image("switch-right");
		this.load.image("marble");
		this.load.image("marble-p1");
		this.load.image("marble-p2");

		// shapes
		this.load.path = "src/features/game/assets/shapes/";
		this.load.json("switch-left-shape");
		this.load.json("switch-right-shape");
		this.load.json("marble-shape");

		// audio
		this.load.path = "src/features/game/assets/audio/";
		this.load.audio("snowStorm", "snowStorm.mp3");
	}

	public create(): void {
		Utilities.LogSceneMethodEntry("Preloader", "create");

		this.scene.start(SplashScreen.Name);
	}

	public update(): void {
		// preload handles updates to the progress bar, so nothing should be needed here.
	}
}
