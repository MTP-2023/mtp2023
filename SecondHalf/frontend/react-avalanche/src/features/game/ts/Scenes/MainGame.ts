import Utilities from "../Utilities";
import { interpretBoard } from "../Helper/BoardInterpreter";
import { AbstractGameMode } from "../GameModes/GameModeResources";
import { SinglePlayerChallenge } from "../GameModes/SinglePlayerChallenge";
import Victory from "./Victory";

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
	counter: number;
	marbleRadius: number;
	movementThreshold: number;
	switchRotationVelocity: number;
	buttonColor: number;
	buttonOutlineColor: number;
	buttonTextColor: string;
	buttonTextStyle: { fontSize: string; fill: any; };
	gameMode: AbstractGameMode;

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
		this.marbleRadius = 13 * this.scaleFactor;

		this.rowCount = [3, 4, 3, 4]; // Define the number of switches per row.

		this.buttonRadius = this.scaleFactor * 10;
		this.buttonFontSize = this.scaleFactor * 18;

		this.simulationRunning = false;
		this.counter = 0;
		this.movementThreshold = 0.02;
		this.switchRotationVelocity = 0.04;

		// set vars for buttons

		this.buttonColor = 0x000000;
		this.buttonOutlineColor = 0xffffff;
		this.buttonTextColor = "#ffffff";
		this.buttonTextStyle = { fontSize: this.buttonFontSize+"px", fill: this.buttonTextColor };
	}

	public preload(): void {

	}

	private addBorder(row: number, switchIndex: number, boardX: number, boardY: number): Phaser.GameObjects.Rectangle {
		// add a border after each switch
		let borderX =
			boardX +
			this.borderWidth / 2 +
			(switchIndex + 1) * (this.switchWidth + this.borderWidth);
		// shift in even rows with uneven num of switches
		borderX = row % 2 === 0 ? borderX + this.switchWidth / 2 : borderX;
		const borderY = boardY + this.imgHeight / 2 + row * (this.imgHeight + this.switchSpacingY);

		const borderVisuals = this.add.rectangle(
			borderX,
			borderY,
			this.borderWidth,
			this.imgHeight + 2 * this.borderExtraHeight,
			0xffffff // Set the color of the border image
		);

		this.matter.add.gameObject(borderVisuals, {
			shape: { type: "rectangle", width: this.borderWidth, height: this.imgHeight + 2 * this.borderExtraHeight },
			isStatic: true,
			label: "border"
		});

		return borderVisuals;
	}

	private addButton(x: number, y: number, content: number, boardX: number): Phaser.GameObjects.Sprite {
		// Create a circle graphics object
		const circle = this.add.graphics();
		circle.lineStyle(2, this.buttonOutlineColor, 1);
		circle.fillStyle(this.buttonColor, 1);
		circle.fillCircle(this.buttonRadius, this.buttonRadius, this.buttonRadius);
		circle.strokeCircle(this.buttonRadius, this.buttonRadius, this.buttonRadius);
	  
		// Create a texture from the circle graphics object
		const textureKey = `circleButtonTexture_${content}`;
		circle.generateTexture(textureKey, this.buttonRadius * 2, this.buttonRadius * 2);
	  
		// Create a sprite using the circle texture
		const button = this.add.sprite(x, y, textureKey);
		button.setInteractive();
	  
		// Add the number as a text object
		const text = this.add.text(x, y, content.toString(), this.buttonTextStyle);
		text.setOrigin(0.5);
	  
		// Add the click event listener
		button.on('pointerdown', () => {
		  this.dropMarble(content, boardX);
		});
	  
		// Clean up the circle graphics object
		circle.destroy();

		return button;
	}

	private addSwitch(startBoardData: number, goalBoardData: number, row: number, switchIndex: number, x: number, y: number): Phaser.GameObjects.GameObject {
		// interpret data and set variables accordingly
		let tilt;
		if (startBoardData == 1) {
			tilt = "left";
		} else {
			tilt = "right";
		}

		const img = "switch-" + tilt;
		const shape = img + "-shape";

		// create switch and set its data
		const switchShape = this.cache.json.get(shape);
		const switchSprite = this.matter.add.sprite(x, y, img, undefined, {shape: switchShape, isStatic: true});
		const switchID = row.toString() + switchIndex.toString();
		switchSprite.setData("id", switchID);
		switchSprite.setData("tilt", tilt);
		switchSprite.setData("marbleStatus", 0);
		switchSprite.setData("rotating", false);
		this.matter.alignBody(switchSprite.body as MatterJS.BodyType, x, y, Phaser.Display.Align.CENTER);

		switchSprite.setDisplaySize(this.switchWidth, this.imgHeight);
		

		// add rectangle to act as a sensor to initiate switch flips (collision detection of matter appeared to be buggy sometimes)
		const detectorHeight = (this.imgHeight - switchShape.centerOfMass.y);
		const detectorY = y - (this.imgHeight / 2) + switchShape.centerOfMass.y + (detectorHeight / 3);
		const bugDetector = this.matter.add.rectangle(x, detectorY, this.switchWidth, detectorHeight/3, { label: "bugDetector", isStatic: true, isSensor: true });
		bugDetector.gameObject = switchSprite;
		
		// add pin to let the switch rotate around
		const pinX = x;
		const pinY = y - this.imgHeight/2 + switchShape.centerOfMass.y * this.scaleFactor;
		const switchBody = switchSprite.body as MatterJS.BodyType;

		const pin = this.matter.constraint.create({
			bodyA: switchBody,
			pointA: { x: 0, y: 0 },
			bodyB: this.matter.add.circle(pinX, pinY, 1, { isStatic: true, isSensor: true }),
			pointB: { x: 0, y: 0 },
			stiffness: 0.8,
			length: 0
		});

		this.matter.world.add(pin);

		const indicatorHeight = this.imgHeight + 2 * this.borderExtraHeight;
		this.gameMode?.addChallengeIndicator(this, goalBoardData, x, y, this.switchWidth, indicatorHeight, 2);

		return switchSprite;
	}

	public create(data: { gameModeHandle: string }): void {
		Utilities.LogSceneMethodEntry("MainGame", "create");

		// set matter options
		this.matter.world.update60Hz();
		this.matter.world.setGravity(0, 0.85);

		// initialize gameMode
		switch (data.gameModeHandle) {
			case "singlePlayerChallenge":
				this.gameMode = new SinglePlayerChallenge();
		}

		const startBoard = this.gameMode!.getStartBoard();
		const goalBoard = this.gameMode!.getGoalBoard();

		// PLACEHOLDER for GameMode.getChallenge();

		/*
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
		// gameBoard = [[1,1,1], [1,1,1,1], [1,1,1], [1,1,1,1]]*/

		// initialize vars
		const camera = this.cameras.main;
		const boardX = (this.scale.width - this.boardWidth) / 2;
		const boardY = camera.worldView.y + 90 * this.scaleFactor;
		const buttonStartY = camera.worldView.y + 30 * this.scaleFactor;
		const switchGroup = this.add.container();
		switchGroup.setName("gameBoard");

		// button init
		
		const buttonGroup = this.add.container();
		buttonGroup.setName("buttons");

		// BUTTONS -----------------------------------------------------------
		for (let i = 1; i < 7; i++) {
			const buttonX = boardX + (this.boardWidth / 8) * i + (i % 2 + 1) * this.borderWidth;
			const button = this.addButton(buttonX, buttonStartY, i, boardX);
			buttonGroup.add(button);
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

				// add switch
				const switchSprite = this.addSwitch(startBoard[row][switchIndex], goalBoard[row][switchIndex], row, switchIndex, x, y);
				switchGroup.add(switchSprite);

				// add first border of the row if required
				if (switchIndex == 0) {
					const borderImage = this.addBorder(row, -1, boardX, boardY);
					switchGroup.add(borderImage);
				}

				// add a border after each switch
				const borderImage = this.addBorder(row, switchIndex, boardX, boardY);
				switchGroup.add(borderImage);
			}
		}

		// Position the button group at the top
		buttonGroup.setX(camera.worldView.x);
		buttonGroup.setY(camera.worldView.y);

		// Position the switch group below the buttons
		switchGroup.setX(camera.worldView.x);
		switchGroup.setY(camera.worldView.y);

		// listen for collision events detected by matter
		this.matter.world.on("collisionstart", (event: MatterJS.IEventCollision<MatterJS.BodyType>, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => {
			this.handleCollisions(bodyA, bodyB);
		});

		// Register the beforeupdate event
		this.matter.world.on("beforeupdate", () => {
			//console.log("BEFOREUPDATE")
			if (this.simulationRunning) {
				// check if impulse of marble collision event needs to be applied
				/*
				if (this.data.has("impulse")) {
					console.log("APPLY IMPULSE")
					const data = this.data.get("impulse");
					//this.matter.body.applyForce(data.body, data.pos, data.vector);
					//this.matter.body.setVelocity(data.body, data.vector);
					this.matter.applyForce(data.body, data.vector);
					this.data.remove("impulse");
				}*/
				
				this.checkForMarbleDeletion();
			}
		});
  

		this.matter.world.on("afterupdate", () => {
			if (this.simulationRunning){
				const buggedCollisionsToHandle = this.checkIfSwitchFlipRequired();
				if (!buggedCollisionsToHandle) this.checkForCompletedSimulation();
			} 
		});
	}

	private dropMarble(col: number, boardX: number): void {
		console.log(col);
		//const marbleRadius = 13*this.scaleFactor;
		const switchShape = this.cache.json.get("marble-shape");
		let x = boardX + this.switchWidth/2 + this.borderWidth + Math.floor((col-1) / 2) * (this.switchWidth + this.borderWidth);
		x = (col % 2 == 0) ? x + this.switchWidth - this.marbleRadius : x + this.marbleRadius;
		const y = 40;
		const marbleSprite = this.matter.add.sprite(x, y, "marble", undefined, {shape: switchShape });
		marbleSprite.setMass(5);
		let a = 0.925;
		marbleSprite.setDisplaySize(2*this.marbleRadius*a, 2*this.marbleRadius*a);
		this.matter.alignBody(marbleSprite.body as MatterJS.BodyType, x, y, Phaser.Display.Align.CENTER);
		this.counter = this.counter + 1;
		marbleSprite.setData("id", this.counter);
		this.toggleClickableButtons(false);
		this.simulationRunning = true;
	}

	// enable/disable all marble buttons during simulation
	private toggleClickableButtons(clickable: boolean): void {
		const buttonGroup = this.children.getByName("buttons") as Phaser.GameObjects.Container;
		buttonGroup.getAll().forEach((child: Phaser.GameObjects.GameObject) => {
			if (child instanceof Phaser.GameObjects.Sprite) {
			  const button = child as Phaser.GameObjects.Sprite;
			  button.input!.enabled = clickable;
			}
		});
	}

	// determine type of collision and call respective function
	private handleCollisions(bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType): void {
		//console.log("THERE IS A COLLISION BETWEEN", bodyA.label, "AND", bodyB.label)
		if (this.checkCollision(bodyA, bodyB, "marble", "head")) {
			//console.log("SWITCH SHOULD HOLD MARBLE")
			const holdSwitch = bodyA.label == "head" ? bodyA.gameObject : bodyB.gameObject;
			this.handleMarbleSwitchStop(holdSwitch);
		} else if (this.checkCollision(bodyA, bodyB, "marble", "marble")) {
			this.handleMarbleCollision(bodyA, bodyB);
		} // original code block that used to initiate switch flips but turned out to be buggy, reason why marbles got stuck could not be found as of now
		//else if (this.checkCollision(bodyA, bodyB, "marble", "tail")) {
			//console.log("SWITCH SHOULD FLIP")
			//const flipSwitch = bodyA.label == "tail" ? bodyA.gameObject : bodyB.gameObject;
			//this.handleSwitchFlip(flipSwitch.body);}
		
	}

	private checkCollision(bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType, type1: string, type2: string): boolean {
		const isA1 = bodyA.label === type1;
		const isB1 = bodyB.label === type1;
		const isA2 = bodyA.label === type2;
		const isB2 = bodyB.label === type2;

		return (isA1 && isB2 || isA2 && isB1)? true : false;
	}

	private getVelocityMagnitude(obj: MatterJS.BodyType): number {
		return this.matter.vector.magnitude(obj.velocity);
	}

	private handleMarbleSwitchStop(holdSwitch: Phaser.GameObjects.GameObject): void {
		holdSwitch.setData("marbleStatus", 1);
	}

	private checkIfSwitchFlipRequired(): boolean {
		let result = false;
		const bugDetectors = this.matter.world.getAllBodies().filter((body: MatterJS.BodyType) => body.label === "bugDetector");
		const marbles = this.matter.world.getAllBodies().filter((body: MatterJS.BodyType) => body.label === "marble");

		for (const marble of marbles) {
			for (const bugDetector of bugDetectors) {
				const isColliding = this.matter.overlap(marble, [bugDetector]);

				if (isColliding){
					//console.log("BUGGED COLLISION REGISTERED")
					if (!bugDetector.gameObject.getData("rotating")) {
						bugDetector.gameObject.setData("rotating", true);
						this.handleSwitchFlip(bugDetector.gameObject.body);
					}
					result = true;
				}
			}
		}

		return result;
	}

	private handleSwitchFlip(flipSwitch: MatterJS.BodyType): void {
		//console.log("TRIGGERED");
		this.matter.body.setStatic(flipSwitch, false);
		flipSwitch.gameObject.setData("marbleStatus", 0);
		//console.log(flipSwitch.gameObject.getData("id"), flipSwitch.gameObject.getData("marbleStatus"))
	  
		const sign = flipSwitch.gameObject.getData("tilt") == "left" ? 1 : -1;
		const rotationSpeed = sign * this.switchRotationVelocity; // Adjust the rotation speed as needed
		
		//let steps = 0;
		//const targetAngle = flipSwitch.angle + (sign * 0.9);
		//console.log(targetAngle, rotationSpeed)

		// use steps as additional check to allow switch to start rotation
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
				flipSwitch.gameObject.setData("rotating", false);
				this.matter.body.setStatic(flipSwitch, true);
				//console.log("Rotation complete");
			} else {
				steps += 1;
			  	requestAnimationFrame(updateRotation);
			}
		};

		updateRotation();
	}

	// NOT WORKING YET
	private handleMarbleCollision(marbleA: MatterJS.BodyType, marbleB: MatterJS.BodyType): void {
		//console.log("MARBLE COLLISION")
		const fallingMarble = (marbleA.position.y > marbleB.position.y) ? marbleA : marbleB;
		//const staticMarble = (fallingMarble === marbleA) ? marbleB : marbleA;

		const impulseMagniutude = 10;
		const angle = Math.atan2(marbleB.position.y - marbleA.position.y, marbleB.position.x - marbleA.position.x);
		const duration = 0.1;

		const impulseVector = {
			x: Math.cos(angle) * impulseMagniutude / duration,
			y: Math.sin(angle) * impulseMagniutude / duration
		};

		//console.log(impulseVector)
		//this.data.set("impulse", { body: fallingMarble, pos: fallingMarble.position, vector: impulseVector })
		//this.matter.body.setVelocity(fallingMarble, impulseVector);
		this.matter.applyForceFromPosition(fallingMarble, fallingMarble.position, 0.1, angle);
	}

	private checkForMarbleDeletion(): void {
		const marbles = this.matter.world.getAllBodies().filter((body: MatterJS.BodyType) => body.label === "marble");
		for (const marble of marbles){
			// Check if the marble is out of bounds
			if (marble.position.y > this.scale.height - this.marbleRadius) {
				//console.log("REMOVE MARBLE")
				marble.gameObject.destroy();
				this.matter.world.remove(marble);
			}
		}
	}

	private checkForCompletedSimulation(): void {
		const bodies = this.matter.world.getAllBodies();
		let simulationComplete = true;

		// Check if any bodies are still moving
		for (const body of bodies) {
			if (["switch", "marble"].includes(body.label)) {
				const velocityMagnitude = this.getVelocityMagnitude(body);
				if (velocityMagnitude < this.movementThreshold) continue;
				simulationComplete = false;
				break;
			}
		}

		// If the simulation is complete, enable the button
		if (simulationComplete && this.simulationRunning) {
			console.log("SIMULATION HAS FINISHED");
			this.toggleClickableButtons(true);
			this.simulationRunning = false;
			this.interpretGameState();
		}
	}

	private interpretGameState(): void {
		// Filter the bodies based on their label property
		const switches = this.matter.world.getAllBodies()
		.filter((body: MatterJS.BodyType) => body.label === "switch")
		.map((body: MatterJS.BodyType) => body.gameObject);

		let switch_orientation: String[][] = [];
		let holds_marble: number[][] = [];

		for (let row = 0; row < this.rowCount.length; row++) {
			const switchesInRow = this.rowCount[row];
			switch_orientation.push([]);
			holds_marble.push([]);
			for (let switchIndex = 0; switchIndex < switchesInRow; switchIndex++) {
				const current_switch = switches.shift();
				switch_orientation[row].push(current_switch.getData("tilt"));
				const hasMarble = current_switch.getData("marbleStatus") ? 2 : 0;
				holds_marble[row].push(hasMarble);
			}
		}

		console.log(switch_orientation, holds_marble);

		// PLACEHOLDER FOR GameMode.interpretGameState(board); 
		// precending logic potentially to be adapted
		const evalResult = this.gameMode!.interpretGameState(holds_marble);
		if (evalResult.hasWinner) {
			this.scene.launch(Victory.Name);
		}
	}

	//public update(/*time: number, delta: number*/): void {
		
	//}
}
