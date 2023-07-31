import SplashScreen from "./SplashScreen";
import Utilities from "../Utilities";

export default class Preloader extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "Preloader";
	private frameNames: string[] = [];

	public preload(): void {

		// images
		this.load.path = "src/features/game/assets/img/";
		this.load.image("phaser_pixel_medium_flat");
		// menu elements
		this.load.image("close-cross");
		this.load.image("menu-background");
		this.load.image("wood-rounded-rectangle");
		this.load.image("wood-hexagon");
		this.load.image("wood-victory");
		this.load.image("wood-label");
		this.load.image("wood-circle");
		this.load.image("game-mode-icon");
		// board elements
		this.load.image("switch-left");
		this.load.image("switch-right");
		this.load.image("wood-board");
		this.load.image("wood-nametag");

		// marble skins
		this.load.path = "src/features/game/assets/img/marbleSkins/";
		this.load.image("marble");
		this.load.image("marble-p1");
		this.load.image("marble-p2");
		this.load.image("joker");
		this.load.image("capy");
		this.load.image("baseball");
		this.load.image("mike");

		// animated background frames
		this.load.path = "src/features/game/assets/img/animatedBackgroundFrames/";

		for (let i = 0; i < 30; i++) {
			const frameName = "frame"+i.toString();
			this.frameNames.push(frameName);
			this.load.image(frameName);
		}

		// shapes
		this.load.path = "src/features/game/assets/shapes/";
		this.load.json("switch-left-shape");
		this.load.json("switch-right-shape");
		this.load.json("marble-shape");

		// audio
		this.load.path = "src/features/game/assets/audio/";
		this.load.audio("snowStorm", "snowStorm.mp3");
		this.load.audio("woodenClick", "woodenClick.wav");
	}

	public create(): void {
		Utilities.LogSceneMethodEntry("Preloader", "create");

		// create background animation
		const animationKey = 'animatedBackground';
		const frameRate = 10;
		const repeat = -1;

		const mappedAnimationFrames = this.frameNames.map((frameName) => {
			return { key: frameName };
		});

		this.anims.create({
			key: animationKey,
			frames: mappedAnimationFrames,
			frameRate: frameRate,
			repeat: repeat,
    	});

		this.scene.start(SplashScreen.Name);
	}
}
