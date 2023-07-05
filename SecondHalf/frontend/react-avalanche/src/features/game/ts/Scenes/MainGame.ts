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
	borderExtraHeight: number;
	switchSpacingY: number;
	boardWidth: number;
	rowCount: Array<number>;
	buttonRadius: number;
	buttonFontSize: number;
	simulationRunning: boolean;

	constructor() {
		super({ key: MainGame.Name });
		// CONST VARS FOR INITIALIZATION
		// set vars for images
		this.scaleFactor = 0.8;
		this.switchWidth = this.scaleFactor * 70;
		this.imgHeight = this.scaleFactor * 104;
		this.borderWidth = this.scaleFactor * 5;
		this.switchSpacingY = this.scaleFactor * 50;
		this.borderExtraHeight = this.scaleFactor * 0.3 * this.switchSpacingY;
		this.boardWidth = 4 * this.switchWidth + 5 * this.borderWidth;

		this.rowCount = [3, 4, 3, 4]; // Define the number of switches per row.

		this.buttonRadius = this.scaleFactor * 10;
		this.buttonFontSize = this.scaleFactor * 18;

		this.simulationRunning = false;
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
		let a = 0.9;
		marbleSprite.setDisplaySize(2*marbleRadius*a, 2*marbleRadius*a);
		this.matter.alignBody(marbleSprite.body as MatterJS.BodyType, x, y, Phaser.Display.Align.CENTER);
		this.simulationRunning = true;
	}

	/*
	private extendHiddenBorder(x: number, y: number): void {
		//console.log(y, y-this.switchSpacingY/2);
		this.matter.add.rectangle(x, y-this.imgHeight/2-this.switchSpacingY/2, this.borderWidth, 0.8*this.switchSpacingY, {isStatic: true});
	}*/

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
			{isStatic: true, label: "border"}
		);

		borderImage.setDisplaySize(this.borderWidth, this.imgHeight+2*this.borderExtraHeight);
		//this.extendHiddenBorder(borderX, borderY);

		return borderImage;
	}


	public create(): void {
		Utilities.LogSceneMethodEntry("MainGame", "create");

		//this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "Phaser-Logo-Small");

		// set matter options
		//this.matter.world.setBounds(0, 0, this.scale.width, this.scale.height);
		this.matter.world.update60Hz();
		this.matter.world.setGravity(0, 0.8);

		// add floor
		//this.matter.add.rectangle(this.scale.width/2, this.scale.height, this.scale.width, 5, { isStatic: true, label: "floor"});

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
					this.matter.add.rectangle(boardX + this.borderWidth/2, y, this.borderWidth, this.imgHeight, {isStatic: true, label: "border"});
					this.matter.add.rectangle(boardX + this.boardWidth - this.borderWidth/2, y, this.borderWidth, this.imgHeight, {isStatic: true, label: "border"});
				}

				let tilt;
				// Create and position the switch sprite
				if (gameBoard[row][switchIndex] == 1) {
					tilt = "left";
					//img = "switch-left";
					//shape = "switch-left-shape";
				} else {
					tilt = "right";
					//img = "switch-right";
          			//shape = "switch-right-shape";
				}

				const img = "switch-" + tilt;
				const shape = img + "-shape";

				const switchShape = this.cache.json.get(shape);
				const switchSprite = this.matter.add.sprite(x, y, img, undefined, {shape: switchShape, isStatic: true});
				switchSprite.setData("id", row.toString() + switchIndex.toString());
				switchSprite.setData("tilt", tilt);
				switchSprite.setData("marbleStatus", 0);
				//switchSprite.setOrigin(switchShape.centerOfMass.x/switchSprite.width, switchShape.centerOfMass.y/switchSprite.height);
				this.matter.alignBody(switchSprite.body as MatterJS.BodyType, x, y, Phaser.Display.Align.CENTER);
				//switchSprite.setMass(1);
				//switchSprite.setOrigin(0.5, 0.5);
				
				
				//this.matter.body.setPosition(switchBody, {x:x, y:y-100}, false);

				// obtain center of mass
				//const vertices = switchSprite.body!.vertices;
				//const centerOfMass = this.matter.vertices.centre(vertices);
				//switchSprite.setBounds
				switchSprite.setDisplaySize(this.switchWidth, this.imgHeight);
				switchGroup.add(switchSprite);

				//switchSprite.angle = Math.PI / 8;

				//const newPos = {x: x, y: y+100};
				//switchSprite.setPosition(newPos.x, newPos.y);
				//switchBody.setPosition(newPos.x, newPos.y);
				//switchSprite.setPosition(newPos.x, newPos.y);
				//switchBody.position.x = newPos.x;
				//switchBody.position.y = newPos.y;

				//console.log(switchShape.centerOfMass.y*this.scaleFactor)
				//console.log(centerOfMass.y-y)
				//console.log((y-centerOfMass.y)*3, 17)

				// set center and let sprite rotate around it
				//const pin = this.matter.add.constraint(switchSprite.body as MatterJS.BodyType, this.matter.add.rectangle(x, y-(y-centerOfMass.y), 0, 0, {isStatic: true}), 0, 0.4);

				//this.matter.world.add(pin);
				//switchBody.centerOfMass.x = switchShape.centerOfMass.x;
				//switchBody.centerOfMass.y = switchShape.centerOfMass.y;

				//switchSprite.setPosition(x, y - 100);
				//switchSprite.setOrigin(switchShape.centerOfMass.x/switchSprite.width, switchShape.centerOfMass.y/switchSprite.height);
				//this.matter.alignBody(switchSprite.body as MatterJS.BodyType, switchSprite.x, switchSprite.y, Phaser.Display.Align.CENTER);
				//this.matter.body.setPosition(switchBody, {x: switchSprite.x, y: switchSprite.y}, false);
				//switchBody.position.x = switchSprite.x;
				//switchBody.position.y = switchSprite.y;
				
				const pinX = x;
				const pinY = y - this.imgHeight/2 + switchShape.centerOfMass.y * this.scaleFactor;
				const switchBody = switchSprite.body as MatterJS.BodyType;

				const pin = this.matter.constraint.create({
					bodyA: switchBody,
					pointA: { x: 0, y: 0 },
					bodyB: this.matter.add.rectangle(pinX, pinY, 0, 0, {isStatic:true}),
					pointB: { x: 0, y: 0 },
					stiffness: 0.8,
					length: 0
				});

				this.matter.world.add(pin);

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

		// collision handling
		this.matter.world.on("collisionstart", (event: MatterJS.IEventCollision<MatterJS.BodyType>, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => {
			this.handleCollisions(bodyA, bodyB);
		});

		this.matter.world.on("afterupdate", () => {
			if (this.simulationRunning) this.checkForCompletedSimulation();
		});
	}

	private checkForCompletedSimulation(): void {
		const bodies = this.matter.world.getAllBodies();
		let simulationComplete = true;

		// Check if any bodies are still moving
		
		for (const body of bodies) {
			if (["switch", "marble"].includes(body.label)) {
				const velocityMagnitude = this.matter.vector.magnitude(body.velocity);
				if (body.label == "marble") console.log (velocityMagnitude, body)
				if (-0.1 < body.velocity.y && body.velocity.y < 0.1) continue;
				simulationComplete = false;
				break;
			}
		}

		// If the simulation is complete, enable the button
		//if (this.marblesFalling == 0 && this.simulationRunning) {
		if (simulationComplete && this.simulationRunning) {
			console.log("SIMULATION HAS FINISHED");
			this.simulationRunning = false;
		}
	}

	private handleCollisions(bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) {
		// determine type of collision and call respective function
		if (this.checkCollision(bodyA, bodyB, "marble", "head")) {
			//console.log("SWITCH SHOULD HOLD MARBLE")
			const holdSwitch = bodyA.label == "body" ? bodyA.gameObject : bodyB.gameObject;
			this.handleMarbleSwitchStop(holdSwitch);
		} else if (this.checkCollision(bodyA, bodyB, "marble", "tail")) {
			console.log("SWITCH SHOULD FLIP")
			const flipSwitch = bodyA.label == "tail" ? bodyA.gameObject : bodyB.gameObject;
			this.handleSwitchFlip(flipSwitch.body);
		} else if (this.checkCollision(bodyA, bodyB, "marble", "floor")) {
			const marble = bodyA.label == "marble" ? bodyA : bodyB;
			this.removeMarble(marble);
		}
	}

	private checkCollision(bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType, type1: string, type2: string): boolean {
		//console.log("CHECK COLLISION", bodyA.label, bodyB.label)
		const isA1 = bodyA.label === type1;
		const isB1 = bodyB.label === type1;
		const isA2 = bodyA.label === type2;
		const isB2 = bodyB.label === type2;

		return (isA1 && isB2 || isA2 && isB1)? true : false;
	}

	private handleMarbleSwitchStop(holdSwitch: Phaser.GameObjects.GameObject): void {
		holdSwitch.setData("marbleStatus", 1);
	}

	private handleSwitchFlip(flipSwitch: MatterJS.BodyType): void {
		//console.log("TRIGGERED");
		this.matter.body.setStatic(flipSwitch, false);
		//flipSwitch.ignoreGravity = true;
		flipSwitch.gameObject.setData("marbleStatus", 0);
	  
		const sign = flipSwitch.gameObject.getData("tilt") == "left" ? 1 : -1;
		const rotationSpeed = sign * 0.025; // Adjust the rotation speed as needed
		let steps = 0;
	  
		const updateRotation = () => {
			this.matter.body.rotate(flipSwitch, rotationSpeed); // Rotate the switch

			// Filter the bodies based on their label property
			const borders = this.matter.world.getAllBodies().filter((body: MatterJS.BodyType) => body.label === "border");

			// Check for collision with a border
			const collidesWithBorder = this.matter.query.region(borders, flipSwitch.bounds).length > 0;
		
			if (collidesWithBorder && steps > 10) {
				const newTilt = sign < 0 ? "left" : "right";
				flipSwitch.gameObject.setData("tilt", newTilt);
				this.matter.body.setStatic(flipSwitch, true);
				//console.log("Rotation complete");
			} else {
				steps += 1;
			  	requestAnimationFrame(updateRotation);
			}
		};
	  
		updateRotation();
	}

	private removeMarble(marble: MatterJS.BodyType): void {
		console.log("remove marble")
		this.matter.world.remove(marble);
		this.checkForCompletedSimulation();
	}

	//public update(/*time: number, delta: number*/): void {
		
	//}
}
