import Utilities from "../Utilities";
import { interpretBoard } from "../Helper/BoardInterpreter";

export default class MainGame extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "MainGame";

	// global var definition
	scaleFactor: number;
	switchWidth: number;
	imgHeight: number;
	borderWidth: number;
	switchSpacingY: number;
	boardWidth: number;
	rowCount: Array<number>;
	buttonRadius: number;
	buttonFontSize: number;

	constructor() {
		super({ key: MainGame.Name });
		// CONST VARS FOR INITIALIZATION
		//camera = this.cameras.main;
		// set vars for images
		this.scaleFactor = 0.8;
		this.switchWidth = this.scaleFactor * 70;
		this.imgHeight = this.scaleFactor * 104;
		this.borderWidth = this.scaleFactor * 5;
		this.switchSpacingY = this.scaleFactor * 40;

		this.boardWidth = 4 * this.switchWidth + 5 * this.borderWidth;

		this.rowCount = [3, 4, 3, 4]; // Define the number of switches per row.

		this.buttonRadius = this.scaleFactor * 10;
		this.buttonFontSize = this.scaleFactor * 18;
	}

	public preload(): void {

	}

	private dropMarble(col: number, boardX: number): void {
		console.log(col);
		const marbleRadius = 13*this.scaleFactor;
		const switchShape = this.cache.json.get("marble-shape");
		let x = boardX + this.switchWidth/2 + this.borderWidth + Math.floor((col-1) / 2) * (this.switchWidth + this.borderWidth);
		x = (col % 2 == 0) ? x + this.switchWidth - marbleRadius : x + marbleRadius;
		const y = 40;
		const marbleSprite = this.matter.add.sprite(x, y, "marble", undefined, {shape: switchShape});
		marbleSprite.setMass(5);
		marbleSprite.setDisplaySize(2*marbleRadius, 2*marbleRadius);
	}

	private extendHiddenBorder(x: number, y: number): void {
		//console.log(y, y-this.switchSpacingY/2);
		this.matter.add.rectangle(x, y-this.imgHeight/2-this.switchSpacingY/2, this.borderWidth, 0.8*this.switchSpacingY, {isStatic: true});
	}

	private addBorder(row: number, switchIndex: number, boardX: number, boardY: number): Phaser.Physics.Matter.Image {
		// add a border after each switch
		let borderX =
			boardX +
			this.borderWidth / 2 +
			(switchIndex + 1) * (this.switchWidth + this.borderWidth);
		// shift in even rows with uneven num of switches
		borderX = row % 2 === 0 ? borderX + this.switchWidth / 2 : borderX;
		const borderY = boardY + this.imgHeight / 2 + row * (this.imgHeight + this.switchSpacingY);

		const borderImage = this.matter.add.image(
			borderX,
			borderY,
			"border",
			undefined,
			{ isStatic: true }
		);

		borderImage.setDisplaySize(this.borderWidth, this.imgHeight);
		this.extendHiddenBorder(borderX, borderY);

		return borderImage;
	}


	public create(): void {
		Utilities.LogSceneMethodEntry("MainGame", "create");

		//this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "Phaser-Logo-Small");

		// set world bounds
		this.matter.world.setBounds(0, 0, this.scale.width, this.scale.height);
		this.matter.world.update60Hz();

		// load game board state
		let example = [
		[0, 0, 1, 1, 0, 1, 0, 0],
		[0, 1, 1, 0, 0, 1, 1, 0],
		[0, 0, 1, 0, 1, 1, 0, 0],
		[1, 0, 0, 1, 1, 0, 1, 0],
		];

		let gameBoard = interpretBoard(example);
		console.log(gameBoard);
		// DEBUG
		// gameBoard = [[1,1,1], [1,1,1,1], [1,1,1], [1,1,1,1]]

		// initialize vars
		const camera = this.cameras.main;
		const boardX = (this.scale.width - this.boardWidth) / 2;
		const boardY = camera.worldView.y + 90 * this.scaleFactor;
		const buttonStartY = camera.worldView.y + 20 * this.scaleFactor;
		const switchGroup = this.add.container();

		// button init
		// set vars for buttons

		const buttonColor = 0x000000;
		const buttonOutlineColor = 0xffffff;
		const buttonTextColor = "#ffffff";
		const buttonTextStyle = { fontSize: this.buttonFontSize+"px", fill: buttonTextColor };
		const buttonGroup = this.add.container();

		// BUTTONS -----------------------------------------------------------
		for (let i = 1; i < 7; i++) {
			// Create the circle graphics
			const circle = this.add.graphics();
			circle.lineStyle(2, buttonOutlineColor, 1);
			circle.fillStyle(buttonColor, 1);
			circle.fillCircle(this.buttonRadius, this.buttonRadius, this.buttonRadius);
			circle.strokeCircle(this.buttonRadius, this.buttonRadius, this.buttonRadius);

			// Create the number text
			const numberText = this.add.text(
				this.buttonRadius, // Set the x position relative to the circle's x position
				this.buttonRadius, // Set the y position relative to the circle's y position
				i.toString(),
				buttonTextStyle
			);
			numberText.setOrigin(0.5);

			// Add the circle and text to the scene
			const container = this.add.container(
				boardX + (this.boardWidth / 8) * i + (i % 2 + 1) * this.borderWidth,
				buttonStartY,
				[circle, numberText]
			);

			// Set the size of the container
			container.setSize(this.buttonRadius * 2, this.buttonRadius * 2);

			// Make the container interactive
			container.setInteractive();

			// Handle container click event
			container.on("pointerdown", () => {
				this.dropMarble(parseInt(numberText.text), boardX);
				//console.log(numberText.text);
			});

			buttonGroup.add(container);
		}

		// SWITCHES -----------------------------------------------------------
		// Iterate over the rows
		for (let row = 0; row < this.rowCount.length; row++) {
			const switchesInRow = this.rowCount[row];
			let leftPadding = 0;
			if (row % 2 == 0) {
				leftPadding = this.switchWidth/2;
			}

			// Iterate over the switches in the row
			for (let switchIndex = 0; switchIndex < switchesInRow; switchIndex++)  {
				// Calculate the position of the switch
				const x =
				boardX +
				leftPadding +
				this.borderWidth +
				this.switchWidth / 2 +
				switchIndex * (this.switchWidth + this.borderWidth);
				const y = boardY + this.imgHeight / 2 + row * (this.imgHeight + this.switchSpacingY);

				// add invisible borders at the left and right for even rows
				if (row % 2 == 0) {
					this.matter.add.rectangle(boardX + this.borderWidth/2, y, this.borderWidth, this.imgHeight, {isStatic: true});
					this.matter.add.rectangle(boardX + this.boardWidth - this.borderWidth/2, y, this.borderWidth, this.imgHeight, {isStatic: true});
				}

				let img;
				let shape;
				// Create and position the switch sprite
				if (gameBoard[row][switchIndex] == 1) {
					img = "switch-left";
					shape = "switch-left-shape";
				} else {
					img = "switch-right";
          			shape = "switch-right-shape";
				}

				const switchShape = this.cache.json.get(shape);
				const switchSprite = this.matter.add.sprite(x, y, img, undefined, {shape: switchShape});
				this.matter.alignBody(switchSprite.body as MatterJS.BodyType, x, y, Phaser.Display.Align.CENTER);
				//switchSprite.setMass(1);
				//switchSprite.setOrigin(0.5, 0.5);
				
				const switchBody = switchSprite.body as MatterJS.BodyType;
				//this.matter.body.setPosition(switchBody, {x:x, y:y-100}, false);

				// obtain center of mass
				const vertices = switchSprite.body!.vertices;
				const centerOfMass = this.matter.vertices.centre(vertices);

				switchSprite.setDisplaySize(this.switchWidth, this.imgHeight);
				switchGroup.add(switchSprite);

				//const newPos = {x: x, y: y+100};
				//switchSprite.setPosition(newPos.x, newPos.y);
				//switchBody.setPosition(newPos.x, newPos.y);
				//switchSprite.setPosition(newPos.x, newPos.y);
				//switchBody.position.x = newPos.x;
				//switchBody.position.y = newPos.y;

				// set center and let sprite rotate around it
				const pin = this.matter.add.constraint(switchSprite.body as MatterJS.BodyType, this.matter.add.rectangle(x, y-(centerOfMass.y - y+17), 0, 0, {isStatic: true}), 0, 1);

				this.matter.world.add(pin);
				//console.log(switchBody.inertia);
				//switchBody.inertia = 1000;

				if (switchIndex == 0) {
					const borderImage = this.addBorder(row, -1, boardX, boardY);
					switchGroup.add(borderImage);
				}

				const borderImage = this.addBorder(row, switchIndex, boardX, boardY);
				//console.log(borderImage.x, borderImage.y)
				switchGroup.add(borderImage);
			}
		}

		// Position the button group at the top
		buttonGroup.setX(camera.worldView.x);
		buttonGroup.setY(camera.worldView.y);

		// Position the switch group below the buttons
		switchGroup.setX(camera.worldView.x);
		switchGroup.setY(camera.worldView.y);
	}

	//public update(/*time: number, delta: number*/): void {
		
	//}
}
