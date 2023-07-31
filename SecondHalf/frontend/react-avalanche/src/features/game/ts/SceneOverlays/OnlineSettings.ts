import { waitFor } from "wait-for-event";
import { OnlineMultiPlayer } from "../GameModes/OnlineMultiplayer";
import Utilities from "../Utilities";
import MainMenu from "../Scenes/MainMenu";
import MainGame from "../Scenes/MainGame";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

export default class OnlineSettings extends Phaser.Scene {
    /**
     * Unique name of the scene.
     */
    public static Name = "OnlineSettings";
    private rexUI: RexUIPlugin;

    private lobbyCodeText: Phaser.GameObjects.Text | null = null;
    private instructionText: Phaser.GameObjects.Text | null = null;

    private inputField: any = null;
    private createLobbyButton: Phaser.GameObjects.Image;
    private joinLobbyButton: Phaser.GameObjects.Image;

    private clickAudio: any;


    public create(): void {
        Utilities.LogSceneMethodEntry("OnlineSettings", "create");

        this.clickAudio = this.sound.add("woodenClick");

        const textYPosition = this.cameras.main.height/4;
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

        // Create Lobby button
        this.createLobbyButton = this.add.image(textXPosition/3*2, this.cameras.main.centerY - selectBg.height/3, "wood-hexagon");
        this.createLobbyButton.setScale(0.25);

        const createText = this.add.text(textXPosition/3*2, this.cameras.main.centerY - selectBg.height/3, "Create Lobby");
        createText
            .setFontFamily("rubik")
            .setFontSize(40)
            .setFill("#fff")
            .setAlign("center")
            .setOrigin(0.5);

        this.createLobbyButton.on("pointerover", () => {
            this.toggleTextShadow(createText, true);
        });

        this.createLobbyButton.on("pointerout", () => {
            this.toggleTextShadow(createText, false);
        });

        this.createLobbyButton.on("pointerdown", () => {
            this.clickAudio.play();
            this.onCreateLobbyClicked();
        });

        // Join Lobby button
        this.joinLobbyButton = this.add.image(textXPosition/3*4, this.cameras.main.centerY - selectBg.height/3, "wood-hexagon");
        this.joinLobbyButton.setScale(0.25);
 
        const joinText = this.add.text(textXPosition/3*4, this.cameras.main.centerY - selectBg.height/3, "Join Lobby");
        joinText
            .setFontFamily("rubik")
            .setFontSize(40)
            .setFill("#fff")
            .setAlign("center")
            .setOrigin(0.5);
 
        this.joinLobbyButton.on("pointerover", () => {
            this.toggleTextShadow(joinText, true);
        });

        this.joinLobbyButton.on("pointerout", () => {
            this.toggleTextShadow(joinText, false);
        });

        this.joinLobbyButton.on("pointerdown", () => {
        this.clickAudio.play();
        this.onJoinLobbyClicked();
        });

        // close button
        const closeCircle = this.add.sprite(0, 0, "wood-circle");
        closeCircle.setScale(0.1);

        const closeCross = this.add.sprite(0, 0, "close-cross");
        closeCross.setScale(0.05); 
        closeCross.setDepth(1);

        const closeButton = this.add.container(
            textXPosition + this.cameras.main.width/4.2,
            textYPosition * 1.5
        );

        closeButton.add(closeCircle);
        closeButton.add(closeCross);
        closeCircle
            .setInteractive()
            .on('pointerdown', () => {
                this.clickAudio.play();
                this.scene.stop();
                this.scene.resume(MainMenu.Name);
            });


        // Name input
        this.instructionText = this.add.text(textXPosition, textYPosition * 1.75, "Press ENTER to submit the name");
        this.instructionText
            .setFontFamily("rubik")
            .setFontSize(40)
            .setFill("#fff")
            .setAlign("center")
            .setOrigin(0.5)
            .setWordWrapWidth(this.cameras.main.width/2);

        this.inputField = this.createInputField("username");
    }

    private createInputField(type: string, maxChars: number = 20): Phaser.GameObjects.Text {
        let labelText = "Press to edit";
        const labelStyle = {
            fontSize: "36px",
            fontFamily: "rubik",
            fill: "#000000", // Text color
            backgroundColor: "#ffffff", // Background color
            padding: {
                left: 10,
                right: 10,
                top: 5,
                bottom: 5,
            },
        };
        
        let isEditing = false;
        
        const inputField = this.add.text(
          this.cameras.main.centerX,
          this.cameras.main.centerY,
          labelText,
          labelStyle
        ).setOrigin(0.5);
        
        inputField.setInteractive();

        // Function to start editing the label text
        function startEditing() {
            isEditing = true;
            inputField.setAlpha(1); // Restore full opacity
            inputField.setText(""); // Clear the text to allow user input
            labelText = "";
        }

        const onlineSettings = this;
        // Function to stop editing the label text and apply changes
        function handleInputConfirmation(): void {
            if (type == "username") {
                if (inputField.text.length > 0 && inputField.text != "Press to edit") {
                    isEditing = false;
                    onlineSettings.registry.set("playerName", inputField.text);
                    onlineSettings.enableButtons();
                    onlineSettings.instructionText!.text = "Create or join lobby";
                    inputField.destroy();
                }
            } else if (type == "lobbycode") {
                onlineSettings.finalizeJoin();
            }
            
        }

        // Event listener for pointerdown event
        inputField.on("pointerdown", () => {
            if (!isEditing) {
                startEditing();
            }
        });

        // Add keyboard input handling for editing the label
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
                if (isEditing) {
                    if (event.key === "Enter") {
                        // Stop editing when Enter key is pressed
                        handleInputConfirmation();
                    } else if (event.key === "Backspace") {
                        // Remove the last character when Backspace key is pressed
                        labelText = labelText.slice(0, -1);
                        inputField.setText(labelText);
                    } else if (event.key.length === 1 && inputField.text.length < maxChars) {
                        // Add the pressed character to the label text
                        labelText += event.key;
                        inputField.setText(labelText);
                    }
                }
            });
        }

        return inputField;
    }

    private toggleTextShadow(text: Phaser.GameObjects.Text, toggleOn: boolean) {
        if (toggleOn) {
            text.setShadow(5, 5, 'rgba(0,0,0,0.5)', 4);
        } else {
            text.setShadow(0, 0, undefined);
        }
    }

    private enableButtons(): void {
        this.createLobbyButton.setInteractive();
        this.joinLobbyButton.setInteractive();
    }

    private async onCreateLobbyClicked(): Promise<void> {
        this.instructionText!.text = "Share the lobby code with your opponent. Waiting for join..."

        // Remove any existing lobby code text or input
        this.removePrevPageContent();

        // Generate random lobby code (You can replace this with your own logic)
        const lobbyCode = 123456;

        // Display the lobby code as text
        this.showLobbyCodeText(lobbyCode.toString());
        var gameMode: OnlineMultiPlayer = new OnlineMultiPlayer();
        gameMode.create(true, lobbyCode);  
        await waitFor("join", gameMode.joinEvent);
        await waitFor("emit", gameMode.boardEvent);
        this.startGame(gameMode);
    }

    private onJoinLobbyClicked(): void {
        // Remove any existing lobby code text or input
        this.removePrevPageContent();

        // Create input field for entering the lobby code using the Rex UI Plugin
        this.createLobbyInput();
    }

    private showLobbyCodeText(lobbyCode: string): void {
        this.lobbyCodeText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY * 1.1,
            "Lobby Code: " + lobbyCode,
            { fontSize: 40, fontFamily: "rubik", color: "#ffffff" }
        );
        this.lobbyCodeText.setOrigin(0.5);
    }

    private async createLobbyInput(): Promise<void> {
        this.instructionText!.text = "Enter the lobby code:";
        this.inputField = this.createInputField("lobbycode", 6);
    }

    private async finalizeJoin(){
        if (this.inputField) {
            const lobbyCode = this.inputField.text;
            console.log("Entered lobby code:", lobbyCode);

            var gameMode: OnlineMultiPlayer = new OnlineMultiPlayer();
            gameMode.me = -1;
            gameMode.create(false, lobbyCode);

            await waitFor("emit", gameMode.boardEvent);
            this.startGame(gameMode);
        }
    }

    private removePrevPageContent(): void {
        // Remove any existing lobby code text or input
        if (this.lobbyCodeText) {
            this.lobbyCodeText.destroy();
            this.lobbyCodeText = null;
        }
        if (this.inputField) {
            this.inputField.destroy();
            this.inputField = null;
        }
    }

    private startGame(gameMode: OnlineMultiPlayer): void {
        this.scene.stop(MainMenu.Name);
        this.scene.stop(OnlineSettings.Name);
        this.scene.start(MainGame.Name, { gameModeHandle: "online1v1", gameModeObj: gameMode });
    }
}
