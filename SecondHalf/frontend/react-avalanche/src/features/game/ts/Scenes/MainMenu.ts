import Utilities from "../Utilities";
import MainGame from "./MainGame";
import MainSettings from "./MainSettings";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';


export default class MainMenu extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "MainMenu";
	private rexUI: RexUIPlugin;
	private gameMode: string;

	public preload(): void {
		// Preload as needed.
	}

	public create(): void {
		Utilities.LogSceneMethodEntry("MainMenu", "create");

		const textYPosition = this.cameras.main.height / 3;

		const newGameText = this.add.text(this.cameras.main.centerX, textYPosition, "PLAY");
		newGameText
			.setFontFamily("monospace")
			.setFontSize(40)
			.setFill("#fff")
			.setAlign("center")
			.setOrigin(0.5);
		newGameText.setInteractive();
		newGameText.on("pointerdown", () => { this.scene.start(MainGame.Name, { gameModeHandle: this.gameMode }); }, this);

		// first element is the default mode
		const gameModeOptions = [
			{ text: "Online 1v1", value: "online1v1"},
			{ text: "Single Player", value: "singlePlayerChallenge"},
			{ text: "Local 1v1", value: "local1v1"}
		];

		// set default game mode
		this.gameMode = gameModeOptions[0].value;

		const mainMenuScene = this;
		const dropDownConfig = {
            x: this.cameras.main.centerX, 
			y: textYPosition * 2,
            background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xffa500),
            icon: this.rexUI.add.roundRectangle(0, 0, 20, 20, 10, 0xffd580),
            text: this.add.text(0, 0, gameModeOptions[0].text, { fontSize: 20, align: "center" }).setFixedSize(this.cameras.main.width/3, 0),

            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
                icon: 10
            },

            options: gameModeOptions,

            list: {
				createBackgroundCallback: () => {
					return this.rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0x8b4000);
				},
				createButtonCallback: function (scene: Phaser.Scene, option: { text: string, value: string }, index: number, options: Array<{ text: string, value: string }>) {
                    const text = option.text;
                    const button = mainMenuScene.rexUI.add.label({
                        background: mainMenuScene.rexUI.add.roundRectangle(0, 0, 2, 2, 0),
                        text: scene.add.text(0, 0, text, { fontSize: 20 }),
						align: "center",
                        space: {
                            left: 10,
                            right: 10,
                            top: 10,
                            bottom: 10,
                            icon: 10
                        }
                    });
                    return button;
                },
				onButtonClick: function (button: Phaser.GameObjects.GameObject) {
					// Set label text, and value
					const labelButton = button as RexUIPlugin.Label;
					dropDownList.text = labelButton.text;
                    mainMenuScene.gameMode = gameModeOptions.find((item) => item.text === labelButton.text)!.value;
				},
				onButtonOver: function (button: Phaser.GameObjects.GameObject) {
					const labelButton = button as RexUIPlugin.Label;
					const el = labelButton.getElement('background') as Phaser.GameObjects.Shape;
					el.setStrokeStyle(1, 0xffffff);
				},
				onButtonOut: function (button: Phaser.GameObjects.GameObject) {
					const labelButton = button as RexUIPlugin.Label;
					const el = labelButton.getElement('background') as Phaser.GameObjects.Shape;
					el.setStrokeStyle();
				},
			},
			value: gameModeOptions[0].value
			
        };

		const dropDownList = this.rexUI.add.dropDownList(dropDownConfig).layout();
	}

	public update(): void {
		// Update logic, as needed.
	}
}
