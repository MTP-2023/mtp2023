import Utilities from "../Utilities";
import MainMenu from "./MainMenu";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

export default class SkinSelector extends Phaser.Scene {
    /**
     * Unique name of the scene.
     */
    public static Name = "SkinSelector";

    private rexUI: RexUIPlugin;
    private skinOptions = [
        { label: "Default", imgName: "marble" },
        { label: "P1", imgName: "marble-p1" },
        { label: "P2", imgName: "marble-p2" }
    ]

    private selectedSkin = this.skinOptions[0].imgName;

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

        const gallery = this.add.group();
        const buttonWidth = 200;
        const buttonHeight = 150;
        const buttonScale = 3;
        const buttonSpacing = 10;
        const maxButtonsPerRow = Math.floor(this.cameras.main.width / (buttonWidth + buttonSpacing)) > 3 ? 3 : Math.floor(this.cameras.main.width / (buttonWidth + buttonSpacing));

        const galleryWidth = maxButtonsPerRow * (buttonWidth + buttonSpacing) - buttonSpacing;
        const galleryHeight = Math.ceil(this.skinOptions.length / maxButtonsPerRow) * (buttonHeight + buttonSpacing) - buttonSpacing;

        const offsetX = (this.cameras.main.width - galleryWidth) / 2;
        const offsetY = (this.cameras.main.height - galleryHeight) / 2;

        let currentX = offsetX + buttonSpacing;
        let currentY = offsetY + buttonSpacing;

        for (let i = 0; i < this.skinOptions.length; i++) {
            const option = this.skinOptions[i];
            const image = this.add.image(0, 0, option.imgName).setScale(buttonScale);
            const label = this.add.text(0, image.height * buttonScale, option.label, { fontSize: '32px', color: '#ffffff' }).setOrigin(0.5, 0);

            const buttonContainer = this.add.container(0, 0, [image, label]).setSize(buttonWidth, buttonHeight);
            buttonContainer.setData('index', i);

            const buttonGraphics = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0xffffff).setAlpha(0);
            buttonContainer.addAt(buttonGraphics, 0);

            buttonContainer.setInteractive()
                .on('pointerdown', () => {
                    console.log(`${option.label} clicked!`);
                    this.handleSelection(buttonContainer, buttonGraphics);
                });

            buttonContainer.on('pointerover', () => {
                buttonGraphics.setAlpha(0.3);
            });

            buttonContainer.on('pointerout', () => {
                if (!buttonContainer.getData('selected')) {
                    buttonGraphics.setAlpha(0);
                }
            });

            buttonContainer.x = currentX;
            buttonContainer.y = currentY;

            gallery.add(buttonContainer);

            currentX += buttonWidth + buttonSpacing;

            // Move to the next row if the current row is filled
            if ((i + 1) % maxButtonsPerRow === 0 || i === this.skinOptions.length - 1) {
                currentX = buttonSpacing;
                currentY += buttonHeight + buttonSpacing;
            }
        }

        Phaser.Actions.GridAlign(gallery.getChildren(), {
            width: maxButtonsPerRow,
            cellWidth: buttonWidth + buttonSpacing,
            cellHeight: buttonHeight + buttonSpacing,
            x: offsetX,
            y: offsetY,
            position: Phaser.Display.Align.CENTER,
        });

        // Select the current option
        const selectIdx = this.skinOptions.findIndex((item) => item.imgName == this.registry.get("marbleSkin"));
        const firstOptionContainer = gallery.getChildren()[selectIdx] as Phaser.GameObjects.Container;
        const firstOptionBackground = firstOptionContainer.getAt(0) as Phaser.GameObjects.Rectangle;
        this.handleSelection(firstOptionContainer, firstOptionBackground);

        // Add the "Save" button
        const saveButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height/8 *7, // Adjust the Y position as needed
            'Save',
            { fontSize: '48px', color: '#ffffff' }
        ).setOrigin(0.5).setInteractive();

        // Handle "Save" button click
        saveButton.on('pointerdown', () => {
            // saves selection into registry
            this.registry.set("marbleSkin", this.selectedSkin);
            this.scene.stop();
            this.scene.resume(MainMenu.Name);
        });
    }

    // Function to handle selection highlighting
    handleSelection(selectedButton: Phaser.GameObjects.Container, background: Phaser.GameObjects.Rectangle) {
        const children = this.children.getChildren() as Phaser.GameObjects.Container[];
    
        children.forEach((buttonContainer: Phaser.GameObjects.Container) => {
            if (buttonContainer instanceof Phaser.GameObjects.Container) {
                const buttonBackground = buttonContainer.getAt(0) as Phaser.GameObjects.Rectangle;
                if (buttonContainer !== selectedButton) {
                    buttonContainer.setData('selected', false);
                    buttonBackground.setAlpha(0);
                }
            }
        });
    
        selectedButton.setData('selected', true);
        background.setAlpha(0.3);

        // Get the selected option and store it in the variable
        const selectedOptionIndex = selectedButton.getData('index');
        const updatedSkin = this.skinOptions[selectedOptionIndex];
        // Update the selected skin variable
        this.selectedSkin = updatedSkin.imgName;
    }    
}