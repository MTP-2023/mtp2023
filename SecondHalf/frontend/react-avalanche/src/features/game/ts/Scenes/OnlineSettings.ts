import Utilities from "../Utilities";
import MainMenu from "./MainMenu";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

export default class OnlineSettings extends Phaser.Scene {
    /**
     * Unique name of the scene.
     */
    public static Name = "OnlineSettings";
    private rexUI: RexUIPlugin;

    private lobbyCodeText: Phaser.GameObjects.Text | null = null;
    private lobbyInput: any = null; // We will set the type later
    private createLobbyButton: Phaser.GameObjects.Text;
    private joinLobbyButton: Phaser.GameObjects.Text;
    

    public create(): void {
        Utilities.LogSceneMethodEntry("MainSettings", "create");
        const startYPosition = this.cameras.main.height / 4;
        const fontSize = 25;

        const graphics = this.add.graphics();

        // Set the fill color and alpha (transparency) to create the dark overlay effect
        const fillColor = 0x000000; // Black color
        const alpha = 0.7; // Adjust the alpha value to control the darkness
        graphics.fillStyle(fillColor, alpha);

        // Draw a rectangle covering the entire scene
        const sceneWidth = this.cameras.main.width;
        const sceneHeight = this.cameras.main.height;
        graphics.fillRect(0, 0, sceneWidth, sceneHeight);

        // Create "Create Lobby" button
        this.createLobbyButton = this.add.text(
            this.cameras.main.centerX,
            startYPosition,
            "Create Lobby",
            { fontSize }
        );
        this.createLobbyButton.setOrigin(0.5);
        this.createLobbyButton.setInteractive({ useHandCursor: true });
        this.createLobbyButton.on("pointerdown", () => this.onCreateLobbyClicked());

        // Create "Join Lobby" button
        this.joinLobbyButton = this.add.text(
            this.cameras.main.centerX,
            startYPosition * 2,
            "Join Lobby",
            { fontSize }
        );
        this.joinLobbyButton.setOrigin(0.5);
        this.joinLobbyButton.setInteractive({ useHandCursor: true });
        this.joinLobbyButton.on("pointerdown", () => this.onJoinLobbyClicked());

        // Create "Join Lobby" button
        this.joinLobbyButton = this.add.text(
            this.cameras.main.centerX,
            startYPosition * 2,
            "Join Lobby",
            { fontSize }
        );
        this.joinLobbyButton.setOrigin(0.5);
        this.joinLobbyButton.setInteractive({ useHandCursor: true });
        this.joinLobbyButton.on("pointerdown", () => this.onJoinLobbyClicked());

        // Initialize lobby code text and input fields
        this.lobbyCodeText = null;
        this.lobbyInput = null;
    }

    private onCreateLobbyClicked(): void {
        // Remove any existing lobby code text or input
        this.hideLobbyInput();

        // Generate random lobby code (You can replace this with your own logic)
        const lobbyCode = "ABC123";

        // Display the lobby code as text
        this.showLobbyCodeText(lobbyCode);
        this.joinLobbyButton.visible = false;
    }

    private onJoinLobbyClicked(): void {
        // Remove any existing lobby code text or input
        this.hideLobbyInput();

        // Create input field for entering the lobby code using the Rex UI Plugin
        this.createLobbyInput();
    }

    private showLobbyCodeText(lobbyCode: string): void {
        this.lobbyCodeText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height / 2.5,
            "Lobby Code: " + lobbyCode,
            { fontSize: 20, color: "#ffffff" }
        );
        this.lobbyCodeText.setOrigin(0.5);
    }

    private createLobbyInput(): void {
        // Create input field for entering the lobby code using the Rex UI Plugin
        this.lobbyInput = this.rexUI.add.inputText({
            x: this.cameras.main.centerX,
            y: this.cameras.main.height / 2,
            width: 200,
            height: 40,
            fontSize: "24px",
            backgroundColor: "#ffffff",
            color: "#000000",
            maxLength: 6, // Limit the lobby code to 6 characters
            type: "text",
            placeholder: "Enter lobby code",
        }).setOrigin(0.5);

        // Handle enter key press to submit the lobby code
        this.lobbyInput.on("textchange", () => {
            const lobbyCode = this.lobbyInput.text;
            console.log("Entered lobby code:", lobbyCode);
        });

        if (this.input.keyboard) {
            // Handle enter key press to submit the lobby code
            this.input.keyboard.on("keydown-ENTER", () => {
                if (this.lobbyInput) {
                    const lobbyCode = this.lobbyInput.text;
                    console.log("Entered lobby code:", lobbyCode);

                    // Call your function to perform an action with the lobby code
                    this.onLobbyCodeEntered(lobbyCode);
                }
            });
        }
    }

    private onLobbyCodeEntered(lobbyCode: string): void {
        // Here, you can perform the desired action with the lobby code
        // For example, joining the lobby with the entered code
        console.log("Performing action with lobby code:", lobbyCode);
    }


    private hideLobbyInput(): void {
        this.joinLobbyButton.visible = false;
        // Remove any existing lobby code text or input
        if (this.lobbyCodeText) {
            this.lobbyCodeText.destroy();
            this.lobbyCodeText = null;
        }
        if (this.lobbyInput) {
            this.lobbyInput.destroy();
            this.lobbyInput = null;
        }
    }
}
