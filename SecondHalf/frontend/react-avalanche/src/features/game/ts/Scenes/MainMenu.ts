import Utilities from "../Utilities";
import MainGame from "./MainGame";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import AgentSelect from "../SceneOverlays/AgentSelect";
import OnlineSettings from "../SceneOverlays/OnlineSettings";
import SkinSelector from "../SceneOverlays/SkinSelector";


export default class MainMenu extends Phaser.Scene {
    /**
     * Unique name of the scene.
     */
    public static Name = "MainMenu";
    private rexUI: RexUIPlugin;
    private gameMode: string;
    private dropDownList: RexUIPlugin.DropDownList;
    // first element is the default mode
    private gameModeOptions = [
        {text: "Challenge", value: "singlePlayerChallenge"},
        {text: "Local 1v1", value: "local1v1"},
        {text: "vs AI", value: "localvsai"},
        { text: "Online 1v1", value: "online1v1"}
    ];
    private clickAudio: any;
    public backgroundTheme: any;

    public preload(): void {
        // Preload as needed.
    }

    public create(): void {
        Utilities.LogSceneMethodEntry("MainMenu", "create");

        // add audio and background animation
        this.clickAudio = this.sound.add("woodenClick");
        this.backgroundTheme = this.sound.add("menuTheme", { loop: true });
        this.backgroundTheme.setVolume(0.015);
        this.backgroundTheme.play();
        this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, "frame0").play("animatedBackground");

        const textYPosition = this.cameras.main.height / 5;

        // PLAY button
        const playButton = this.add.image(this.cameras.main.centerX, textYPosition, "wood-rounded-rectangle");
        playButton.setScale(0.4);

        const playText = this.add.text(this.cameras.main.centerX, textYPosition + playButton.height * 0.02, "PLAY");
        playText
            .setFontFamily("rubik")
            .setFontSize(70)
            .setFill("#fff")
            .setAlign("center")
            .setOrigin(0.5);

        playButton.setInteractive();

        playButton.on("pointerover", () => {
            this.toggleTextShadow(playText, true);
        });

        playButton.on("pointerout", () => {
            this.toggleTextShadow(playText, false);
        });

        playButton.on("pointerdown", () => {
            this.clickAudio.play();
            this.backgroundTheme.stop();
            this.scene.start(MainGame.Name, { gameModeHandle: this.gameMode, agent: "rl", gameModeObj: null, scores: [0, 0] });
        }, this);

        // SELECT SKIN button
        const selectSkinButton = this.add.image(this.cameras.main.centerX, textYPosition * 2, "wood-rounded-rectangle");
        selectSkinButton.setScale(0.4);

		const selectSkinText = this.add.text(this.cameras.main.centerX, textYPosition * 2 + selectSkinButton.height * 0.02, "Skin Selection");
        selectSkinText
            .setFontFamily("rubik")
            .setFontSize(54)
            .setFill("#fff")
            .setAlign("center")
            .setOrigin(0.5);

        selectSkinButton.setInteractive();

        selectSkinButton.on("pointerover", () => {
            this.toggleTextShadow(selectSkinText, true);
        });

        selectSkinButton.on("pointerout", () => {
            this.toggleTextShadow(selectSkinText, false);
        });

        selectSkinButton.on("pointerdown", () => {
            this.clickAudio.play();
            this.scene.pause();
			this.scene.launch(SkinSelector.Name);
        }, this);

        // set default game mode
        this.gameMode = this.gameModeOptions[0].value;

        // drop down list for mode selection
        const mainMenuScene = this;
        const dropDownConfig = {
            x: this.cameras.main.centerX,
            y: textYPosition * 3,
            background: this.add.image(0, textYPosition * 3 + 100, "wood-hexagon").setScale(0.33),
            icon: this.add.image(0, 0, "game-mode-icon").setScale(0.15),
            text: this.add.text(0, 20, this.gameModeOptions[0].text, {
                fontSize: 50,
                fontFamily: "rubik",
                align: "center"
            }).setFixedSize(this.cameras.main.width / 3, 0),
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
                icon: -100
            },

            options: this.gameModeOptions,

            alignTargetY: 200,

            list: {/*
                space: {
                   top: 200
                },
                createBackgroundCallback: () => {
                    return this.add.image(0, 200, "wood-rectangle").setScale(0.5);
                },*/
                createButtonCallback: function (scene: Phaser.Scene, option: { text: string, value: string }, index: number, options: Array<{ text: string, value: string }>) {
                    const text = option.text;
                    const button = mainMenuScene.rexUI.add.label({
                        background: mainMenuScene.add.image(0, 0, "wood-hexagon").setScale(0.225),
                        text: scene.add.text(0, 0, text, {fontSize: 45, fontFamily: "rubik"}),
                        align: "center",
                        space: {
                            left: 5,
                            right: 5,
                            top: 20,
                            bottom: 20
                        }
                    });
                    return button;
                },
				onButtonClick: function (button: Phaser.GameObjects.GameObject) {
                    mainMenuScene.clickAudio.play();
					// Set label text, and value
					const labelButton = button as RexUIPlugin.Label;
					mainMenuScene.dropDownList.text = labelButton.text;
                    mainMenuScene.gameMode = mainMenuScene.gameModeOptions.find((item) => item.text === labelButton.text)!.value;

                    switch (mainMenuScene.gameMode) {
                        case "online1v1":
                            mainMenuScene.backgroundTheme.stop();
                            mainMenuScene.scene.pause(MainMenu.Name);
							mainMenuScene.scene.stop(AgentSelect.Name);
                            mainMenuScene.scene.launch(OnlineSettings.Name, { mainMenuScene: this });
							break;
						case "localvsai":
                            mainMenuScene.backgroundTheme.stop();
							mainMenuScene.scene.pause(MainMenu.Name);
							mainMenuScene.scene.stop(OnlineSettings.Name);
							mainMenuScene.scene.launch(AgentSelect.Name, { mainMenuScene: this });
							break;
						default:
							mainMenuScene.scene.stop(AgentSelect.Name);
							mainMenuScene.scene.stop(OnlineSettings.Name);
							break;
                    }
				},
				onButtonOver: function (button: Phaser.GameObjects.GameObject) {
					const labelButton = button as RexUIPlugin.Label;
                    // Apply shadow effect to the text element
                    const textElement = labelButton.getElement('text') as Phaser.GameObjects.Text;
                    mainMenuScene.toggleTextShadow(textElement, true);
				},
				onButtonOut: function (button: Phaser.GameObjects.GameObject) {
					const labelButton = button as RexUIPlugin.Label;
                    const textElement = labelButton.getElement('text') as Phaser.GameObjects.Text;
                    mainMenuScene.toggleTextShadow(textElement, false);
				},
			},
			value: this.gameModeOptions[0].value
			
        };

		this.dropDownList = this.rexUI.add.dropDownList(dropDownConfig).layout();

        this.dropDownList.on("pointerdown", () => {
           this.clickAudio.play();
        });

        this.dropDownList.on("pointerover", () => {
            this.toggleTextShadow(this.dropDownList.getElement("text") as Phaser.GameObjects.Text, true);
        });

        this.dropDownList.on("pointerout", () => {
            this.toggleTextShadow(this.dropDownList.getElement("text") as Phaser.GameObjects.Text, false);
        });

		this.events.on('resume', this.onCancel, this);
	}

	private onCancel(): void {
		this.dropDownList.text = this.gameModeOptions[0].text;
		this.dropDownList.value = this.gameModeOptions[0].value;
		this.gameMode = this.gameModeOptions[0].value;
        this.backgroundTheme.play();
	}

    private toggleTextShadow(text: Phaser.GameObjects.Text, toggleOn: boolean) {
        if (toggleOn) {
            text.setShadow(5, 5, 'rgba(0,0,0,0.5)', 4);
        } else {
            text.setShadow(0, 0, undefined);
        }
    }

    public update(): void {
        // Update logic, as needed.
    }
}
