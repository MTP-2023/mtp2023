import Utilities from "../Utilities";
import MainMenu from "../Scenes/MainMenu";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

export default class SkinSelector extends Phaser.Scene {
    /**
     * Unique name of the scene.
     */
    public static Name = "SkinSelector";

    private rexUI: RexUIPlugin;
    private skinOptions = [
        { label: "Baseball", imgName: "baseball" },
        { label: "Swiss", imgName: "marble" },
        { label: "Green", imgName: "marble-p1" },
        { label: "Purple", imgName: "marble-p2" },
        { label: "Joker", imgName: "joker" },
        { label: "Capy", imgName: "capy" },
        { label: "Santa", imgName: "santa" },
        { label: "Lars", imgName: "lars_fast" },
        { label: "Lars Ski", imgName: "lars_ski" },
        { label: "Gomme", imgName: "gomme" },
        { label: "Amogus", imgName: "amogus" },
        { label: "Sans", imgName: "sans" },
        
        { label: "Mike", imgName: "mike" }
    ]

    private selectedSkin = this.skinOptions[0].imgName;
    private clickAudio: any;

    public create(): void {
        Utilities.LogSceneMethodEntry("MainSettings", "create");
        this.clickAudio = this.sound.add("woodenClick");

        const graphics = this.add.graphics();

        // Set the fill color and alpha (transparency) to create the dark overlay effect
        const fillColor = 0x000000; // Black color
        const alpha = 0.7; // Adjust the alpha value to control the darkness
        graphics.fillStyle(fillColor, alpha);

        // Draw a rectangle covering the entire scene
        const sceneWidth = this.cameras.main.width;
        const sceneHeight = this.cameras.main.height;
        graphics.fillRect(0, 0, sceneWidth, sceneHeight);

        // set background image
        const skinBg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY*0.8, "wood-label");
        skinBg.setScale(0.75);

        const instructionText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY*0.45, "Select your marble style:");
        instructionText
            .setFontFamily("rubik")
            .setFontSize(48)
            .setFill("#fff")
            .setAlign("center")
            .setOrigin(0.5)
            .setWordWrapWidth(this.cameras.main.width/2);

        // add selection for skins as gallery
        const gallery = this.add.group();
        const buttonWidth = 110;
        const buttonHeight = 110;
        const buttonScale = 2;
        const buttonSpacing = 60;
        const allowButtonsPerRow = 6;
        const maxButtonsPerRow = Math.floor(this.cameras.main.width / (buttonWidth + buttonSpacing)) > allowButtonsPerRow ? allowButtonsPerRow : Math.floor(this.cameras.main.width / (buttonWidth + buttonSpacing));

        const galleryWidth = maxButtonsPerRow * (buttonWidth + buttonSpacing) - buttonSpacing;
        const galleryHeight = Math.ceil(this.skinOptions.length / maxButtonsPerRow) * (buttonHeight + buttonSpacing) - buttonSpacing;

        const offsetX = (this.cameras.main.width - galleryWidth) / 2;
        const offsetY = (this.cameras.main.height - galleryHeight) / 2.75;

        let currentX = offsetX;
        let currentY = offsetY;

        for (let i = 0; i < this.skinOptions.length; i++) {
            const option = this.skinOptions[i];
            const outline = this.add.image(0, 0, "wood-circle").setScale(0.15);
            const image = this.add.image(0, 0, option.imgName).setScale(buttonScale);
            const label = this.add.text(0, outline.height * 0.15 * 0.9, option.label, { fontSize: '36px', fontFamily: "rubik", color: '#ffffff' }).setOrigin(0.5, 1);

            const buttonContainer = this.add.container(0, 0, [outline, image, label]).setSize(buttonWidth, buttonHeight);
            buttonContainer.setData('index', i);

            const buttonGraphics = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0xffffff).setAlpha(0);
            buttonContainer.addAt(buttonGraphics, 0);

            buttonContainer.setInteractive()
                .on('pointerdown', () => {
                    this.clickAudio.play();
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
                currentX = offsetX;
                currentY += buttonHeight + buttonSpacing;
            }
        }

        Phaser.Actions.GridAlign(gallery.getChildren(), {
            width: maxButtonsPerRow,
            cellWidth: buttonWidth + buttonSpacing,
            cellHeight: buttonHeight + buttonSpacing,
            x: offsetX,
            y: offsetY,
            position: Phaser.Display.Align.LEFT_TOP,
        });

        // Select the current option
        const selectIdx = this.skinOptions.findIndex((item) => item.imgName == this.registry.get("marbleSkin"));
        const firstOptionContainer = gallery.getChildren()[selectIdx] as Phaser.GameObjects.Container;
        const firstOptionBackground = firstOptionContainer.getAt(0) as Phaser.GameObjects.Rectangle;
        this.handleSelection(firstOptionContainer, firstOptionBackground);

        // Add "Save" button
        const saveButton = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY*1.6, "wood-hexagon");
        saveButton.setScale(0.3);
        saveButton.setInteractive();

        const saveText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY*1.6, "Save");
        saveText
            .setFontFamily("rubik")
            .setFontSize(56)
            .setFill("#fff")
            .setAlign("center")
            .setOrigin(0.5);

        saveButton.on("pointerover", () => {
            this.toggleTextShadow(saveText, true);
        });

        saveButton.on("pointerout", () => {
            this.toggleTextShadow(saveText, false);
        });

        // Handle "Save" button click
        saveButton.on('pointerdown', () => {
            this.clickAudio.play();
            // saves selection into registry
            this.registry.set("marbleSkin", this.selectedSkin);
            this.scene.stop();
            this.scene.resume(MainMenu.Name);
        });
    }

    private toggleTextShadow(text: Phaser.GameObjects.Text, toggleOn: boolean) {
        if (toggleOn) {
            text.setShadow(5, 5, 'rgba(0,0,0,0.5)', 4);
        } else {
            text.setShadow(0, 0, undefined);
        }
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