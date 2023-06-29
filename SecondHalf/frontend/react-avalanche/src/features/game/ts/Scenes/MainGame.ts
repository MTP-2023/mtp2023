import Utilities from "../Utilities";
import { interpretBoard } from "../Helper/BoardInterpreter";

export default class MainGame extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "MainGame";

	public preload(): void {

	}

	public create(): void {
		Utilities.LogSceneMethodEntry("MainGame", "create");

		//this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "Phaser-Logo-Small");

		// load game board state
		let example = [
		[0, 0, 1, 1, 0, 1, 0, 0],
		[0, 1, 1, 0, 0, 1, 1, 0],
		[0, 0, 1, 0, 1, 1, 0, 0],
		[1, 0, 0, 1, 1, 0, 1, 0],
		];

		let gameBoard = interpretBoard(example);
		console.log(gameBoard);

		// CONST VARS FOR INITIALIZATION
		const camera = this.cameras.main;

		// set vars for images
		const scaleFactor = 1;
		const switchWidth = scaleFactor * 72;
		const imgHeight = scaleFactor * 104;
		const borderWidth = scaleFactor * 5;
		const switchSpacingY = scaleFactor * 25;

		const boardWidth = 4 * switchWidth + 5 * borderWidth;

		const rowCount = [3, 4, 3, 4]; // Define the number of switches per row.
		const boardX = (this.scale.width - boardWidth) / 2;// camera.worldView.x + 10;
		console.log(this.scale.width, boardWidth, boardX)
		const boardY = camera.worldView.y + 30;

		const switchGroup = this.add.container();

		// set vars for buttons
		const buttonRadius = scaleFactor * 10;
		const buttonColor = 0x000000;
		const buttonOutlineColor = 0xffffff;
		const buttonTextColor = "#ffffff";
		const fontSize = scaleFactor * 18;
		const buttonTextStyle = { fontSize: fontSize+"px", fill: buttonTextColor };
		const buttonStartX = boardX;
		const buttonStartY = camera.worldView.y + 10;
		const buttonSpacingX = 24;

		const buttonGroup = this.add.container();

		// BUTTONS -----------------------------------------------------------
		for (let i = 1; i < 7; i++) {
		// Create the circle graphics
		const circle = this.add.graphics();
		circle.lineStyle(2, buttonOutlineColor, 1);
		circle.fillStyle(buttonColor, 1);
		circle.fillCircle(buttonRadius, buttonRadius, buttonRadius);
		circle.strokeCircle(buttonRadius, buttonRadius, buttonRadius);

		// Create the number text
		const numberText = this.add.text(
			buttonRadius, // Set the x position relative to the circle's x position
			buttonRadius, // Set the y position relative to the circle's y position
			i.toString(),
			buttonTextStyle
		);
		numberText.setOrigin(0.5);

		// Add the circle and text to the scene
		const container = this.add.container(
			//buttonStartX + (boardWidth / 8) * i + buttonRadius,
			buttonStartX + (boardWidth / 8) * i + (i % 2 + 1) * borderWidth,
			buttonStartY,
			[circle, numberText]
		);

		// Set the size of the container
		container.setSize(buttonRadius * 2, buttonRadius * 2);

		// Make the container interactive
		container.setInteractive();

		// Handle container click event
		container.on("pointerup", () => {
			console.log(numberText.text);
		});

		buttonGroup.add(container);
		}
		
		// SWITCHES -----------------------------------------------------------
		// Iterate over the rows
		for (let row = 0; row < rowCount.length; row++) {
			const switchesInRow = rowCount[row];
			let leftPadding = 0;
			if (row % 2 == 0) {
				leftPadding = switchWidth/2;
			}

			// add first border directly
			let borderX = row % 2 === 0 ? boardX + switchWidth/2 : boardX;
			let borderY = row * (imgHeight + switchSpacingY) + boardY;
			let borderImage = this.add.image(borderX, borderY, "border");
			borderImage.setOrigin(0, 0);
      		borderImage.setDisplaySize(borderWidth, imgHeight);
			switchGroup.add(borderImage);

			// Iterate over the switches in the row
			for (let switchIndex = 0; switchIndex < switchesInRow; switchIndex++) {
				// Calculate the position of the switch
				const x = boardX + leftPadding + borderWidth + (switchIndex * (switchWidth + borderWidth));
				const y = boardY + (row * (imgHeight + switchSpacingY));

				// Create and position the switch sprite
				const switchSprite = this.add.sprite(x, y, "switch");
				switchSprite.setOrigin(0,0);
				if (gameBoard[row][switchIndex] == -1) {
					switchSprite.flipX = true;
				}
				switchSprite.setDisplaySize(switchWidth, imgHeight);

				switchGroup.add(switchSprite);
				
				// add a border after each switch
				let borderX = boardX + (switchIndex + 1) * (switchWidth + borderWidth);
				// shift in even rows with uneven num of switches
				borderX = row % 2 === 0 ? borderX + switchWidth/2 : borderX;
				let borderY = boardY + row * (imgHeight + switchSpacingY);
				let borderImage = this.add.image(borderX, borderY, "border");
				borderImage.setOrigin(0, 0);
				borderImage.setDisplaySize(borderWidth, imgHeight);
				switchGroup.add(borderImage);
			}
		}

		// Position the button group at the top
		buttonGroup.setX(camera.worldView.x);
		buttonGroup.setY(camera.worldView.y + 10);

		// Position the switch group below the buttons
		switchGroup.setX(camera.worldView.x);
		switchGroup.setY(camera.worldView.y + 30);
  	}
}
