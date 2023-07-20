import Utilities from "../Utilities";
import GameEnd from "./GameEnd";
import { AbstractGameMode } from "../GameModes/GameModeResources";
import { SinglePlayerChallenge } from "../GameModes/SinglePlayerChallenge";
import { LocalMultiPlayer } from "../GameModes/LocalMultiPlayer";
import { LocalVsAi} from "../GameModes/LocalVsAi";
import { interpretBoardReverse } from "../Helper/BoardInterpreter";
import { OnlineMultiPlayer } from "../GameModes/OnlineMultiplayer";
import {waitFor} from 'wait-for-event';

export default class MainGame extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "MainGame";

	// global var definition
	scaleFactor: number = 1.5;
	switchWidth: number;
	imgHeight: number;
	borderWidth: number;
	borderExtraHeight: number;
	switchSpacingY: number;
	boardWidth: number;
	rowCount: Array<number> = [3, 4, 3, 4];
	buttonRadius: number;
	buttonFontSize: number;
	simulationRunning: boolean;
	counter: number;
	marbleRadius: number;
	movementThreshold: number = 0.0005;
	switchRotationVelocity: number = 0.035;
	buttonColor: number;
	buttonOutlineColor: number;
	buttonTextColor: string;
	buttonTextStyle: { fontSize: string; fill: any; };
	gameMode: AbstractGameMode;
	turn: number = 1;
	boardMarbles: number = 0;
	boardSpacingTop: number = 90;

	constructor() {
		super({ key: MainGame.Name });
		// CONST VARS FOR INITIALIZATION
		// set vars for images
		this.switchWidth = this.scaleFactor * 70;
		this.imgHeight = this.scaleFactor * 104;
		this.borderWidth = this.scaleFactor * 5;
		this.switchSpacingY = this.scaleFactor * 60;
		this.borderExtraHeight = this.scaleFactor * 0.15 * this.switchSpacingY;
		this.boardWidth = 4 * this.switchWidth + 5 * this.borderWidth;
		this.marbleRadius = 13 * this.scaleFactor;

		this.buttonRadius = this.scaleFactor * 10;
		this.buttonFontSize = this.scaleFactor * 18;

		this.simulationRunning = false;
		this.counter = 0;

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

	private addButton(x: number, y: number, content: number): Phaser.GameObjects.Sprite {
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
		  if(this.gameMode.isMultiplayer && !this.gameMode.isLocal){
			var onlinegame = this.gameMode as OnlineMultiPlayer;
			onlinegame.makeMove(content);
			this.toggleInput(false);
		  }
		  else {
			this.dropMarble(content);
		  }
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
		const detectorY = y - (this.imgHeight / 2) + switchShape.centerOfMass.y + (detectorHeight / 1.5);
		const bugDetector = this.matter.add.rectangle(x, detectorY, this.switchWidth, detectorHeight/2.5, { label: "bugDetector", isStatic: true, isSensor: true });
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
			stiffness: 0.6,
			length: 0
		});

		this.matter.world.add(pin);

		const indicatorHeight = this.imgHeight + 2 * this.borderExtraHeight;
		this.gameMode?.addChallengeIndicator(this, goalBoardData, x, y, this.switchWidth, indicatorHeight, 2);

		return switchSprite;
	}

	public async create(data: { gameModeHandle: string , agent: string, gameModeObj: AbstractGameMode}): Promise<void> {
		Utilities.LogSceneMethodEntry("MainGame", "create");
		console.log(data.agent)

		// set matter options
		this.matter.world.update60Hz();
		this.matter.world.setGravity(0, 0.85);

		// initialize gameMode
		console.log(data.gameModeHandle)
		
		
		switch (data.gameModeHandle) {
			case "singlePlayerChallenge":
				this.gameMode = new SinglePlayerChallenge();
				break;
			case "local1v1":
				this.gameMode = new LocalMultiPlayer();
				break;
			case "localvsai":
				this.gameMode = new LocalVsAi();
				this.gameMode.agent = data.agent;
				break;
			case "online1v1":
				this.gameMode = data.gameModeObj;
				break;
		}
		console.log(this.gameMode.agent)

		if (this.gameMode.isLocal) {
			await this.gameMode.initChallenge();
		} else {
			onlinegame = this.gameMode as OnlineMultiPlayer;
			this.turn = 1;
			//await waitFor("emit", onlinegame.boardEvent);
		}
		this.simulationRunning = false;
		this.counter = 0;
		this.boardMarbles = 0;
		this.turn = 1;
		
		const startBoard =  this.gameMode!.getStartBoard();
		const goalBoard = this.gameMode!.getGoalBoard();

		console.log(startBoard)
	

		// initialize vars
		const camera = this.cameras.main;
		const boardX = (this.scale.width - this.boardWidth) / 2;
		const boardY = camera.worldView.y + 120 * this.scaleFactor;
		const buttonStartY = camera.worldView.y + 30 * this.scaleFactor;
		const switchGroup = this.add.container();
		switchGroup.setName("gameBoard");

		// player UI
		const playerStatusWidth = boardX * 0.8;
		const playerStatusHeight = this.imgHeight;
		const playerStatusX = (boardX - playerStatusWidth) / 2;
		const playerStatusY = camera.worldView.y + 30 * this.scaleFactor;

		if(this.gameMode.isMultiplayer) {
			let player1Text = "Player 1";
			let player2Text = "Player 2";
			if(!this.gameMode.isLocal) {
				player1Text = "You";
				player2Text = "Enemy";
			}
			if(this.gameMode.isVsAi){
				player1Text = "You";
				player2Text = "AI";
			}
			this.gameMode.createPlayerStatus(this, playerStatusX, playerStatusY, playerStatusWidth, playerStatusHeight, this.boardWidth + boardX, player1Text, player2Text);
		}
		// button init
		const buttonGroup = this.add.container();
		buttonGroup.setName("buttons");

		// BUTTONS -----------------------------------------------------------
		for (let i = 1; i < 7; i++) {
			const buttonX = boardX + (this.boardWidth / 8) * i + (i % 2 + 2) * this.borderWidth;
			//console.log(i, buttonX-boardX, this.boardWidth)
			const button = this.addButton(buttonX, buttonStartY, i);
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

		//Event Handler
		if(!this.gameMode.isLocal && this.gameMode.isMultiplayer){
			var onlinegame = this.gameMode as OnlineMultiPlayer;
			onlinegame.gameOverEvent.on("gameOver", this.handleGameOver, this);
			onlinegame.moveEvent.on("move", this.handleMove, this);
			onlinegame.boardEvent.on("emit", this.getChallenge, this)
		}

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

				//this.applyRepulsiveForceOnMarbles();

				this.checkForMarbleDeletion();
			}
		});
  

		this.matter.world.on("afterupdate", () => {
			if (this.simulationRunning) {
				const flipSwitchsToHandle = this.checkIfSwitchFlipRequired();
				if (!flipSwitchsToHandle) this.checkForCompletedSimulation();
			} 
		});

		this.keyboardListener = this.keyboardListener.bind(this);
		// Enable keyboard input
		if (this.input && this.input.keyboard) {
			this.input.keyboard.on('keydown', this.keyboardListener);
		}
		if(!this.gameMode.isLocal){
			var onlinegame = this.gameMode as OnlineMultiPlayer;
			if(onlinegame.me == -1){
				this.toggleInput(false);
			}
		}

	}

	private keyboardListener(event: Phaser.Input.Keyboard.Key): void {
		const code = event.keyCode;
		// Check if the key is a number
        if (code >= Phaser.Input.Keyboard.KeyCodes.ONE && code <= Phaser.Input.Keyboard.KeyCodes.SIX) {
            // The key is a number
            console.log('A number key was pressed');

            // Get the number from the keyCode (assuming it's a number key)
            const number = code - Phaser.Input.Keyboard.KeyCodes.ONE + 1;
            console.log('Number:', number);

            // Now you can use the number in your logic
            this.dropMarble(number);
		}
	}
	// Event handler for the "gameOverEvent"
	private handleGameOver() {
	  	console.log("Game Over!");
	}



	// Event handler for the "boardEvent"
	private getChallenge() {
		console.log("challenge recieved");
    }

	// Event handler for the "moveEvent"
	private handleMove(col: number) {
	  	// Score update logic here
	  	const boardX = (this.scale.width - this.boardWidth) / 2;
	  	this.dropMarble(col);
	}

	private dropMarble(col: number): void {
		if(!this.gameMode.isLocal){
			var onlinegame = this.gameMode as OnlineMultiPlayer;
			console.log("dropping as ", onlinegame.me);
		}
		console.log("PLAYER TRHOWS MARBLE INTO", col);
		this.boardMarbles += 1;
		//const marbleRadius = 13*this.scaleFactor;
		const switchShape = this.cache.json.get("marble-shape");
		const boardX = (this.scale.width - this.boardWidth) / 2;
		let x = boardX + this.switchWidth/2 + this.borderWidth + Math.floor((col-1) / 2) * (this.switchWidth + this.borderWidth);
		x = (col % 2 == 0) ? x + this.switchWidth - 1.075 * this.marbleRadius: x + 1.075 * this.marbleRadius;
		let marblePNG = "marble";
		if (this.gameMode.isMultiplayer) {
			marblePNG = this.gameMode.getMarbleSprite(this.turn, this);
		}
		let marbleSprite = this.matter.add.sprite(x, this.boardSpacingTop, marblePNG, undefined, { shape: switchShape });
		//marbleSprite.setMass(5);
		let a = 0.98;
		marbleSprite.setDisplaySize(2*this.marbleRadius*a, 2*this.marbleRadius*a);
		this.matter.alignBody(marbleSprite.body as MatterJS.BodyType, x, this.boardSpacingTop, Phaser.Display.Align.CENTER);
		this.counter = this.counter + 1;
		marbleSprite.setData("id", this.counter);
		marbleSprite.setData("player", this.turn);
		marbleSprite.setData("activeRow", -1);
		this.toggleInput(false);
		this.simulationRunning = true;
	}

	// enable/disable all marble buttons during simulation
	private toggleInput(clickable: boolean): void {
		const buttonGroup = this.children.getByName("buttons") as Phaser.GameObjects.Container;
		buttonGroup.getAll().forEach((child: Phaser.GameObjects.GameObject) => {
			if (child instanceof Phaser.GameObjects.Sprite) {
			  const button = child as Phaser.GameObjects.Sprite;
			  button.input!.enabled = clickable;
			}
		});

		if (this.input.keyboard) {
			if (clickable) {
				// Enable the keyboard listener
				this.input.keyboard.on('keydown', this.keyboardListener);
			} else {
				// Remove the keyboard listener
				this.input.keyboard.off('keydown', this.keyboardListener);
			}
		}
	}

	// determine type of collision and call respective function
	private handleCollisions(bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType): void {
		//console.log("THERE IS A COLLISION BETWEEN", bodyA.label, "AND", bodyB.label)
		if (this.checkCollision(bodyA, bodyB, "marble", "head")) {
			//console.log("SWITCH SHOULD HOLD MARBLE")
			const holdSwitch = bodyA.label == "head" ? bodyA.gameObject : bodyB.gameObject;
			const marblePlayer = holdSwitch == bodyA.gameObject ? bodyB.gameObject.getData("player"): bodyA.gameObject.getData("player");
			this.handleMarbleSwitchStop(holdSwitch, marblePlayer);
		} ///else if (this.checkCollision(bodyA, bodyB, "marble", "marble")) {
			//this.handleMarbleCollision(bodyA, bodyB);
		//} // original code block that used to initiate switch flips but turned out to be buggy, reason why marbles got stuck could not be found as of now
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

	private handleMarbleSwitchStop(holdSwitch: Phaser.GameObjects.GameObject, marblePlayer: number): void {
		//console.log("SWITCH HOLDS MARBLE", marblePlayer);
		holdSwitch.setData("marbleStatus", marblePlayer * 2);
	}

	private checkIfSwitchFlipRequired(): boolean {
		let result = false;
		const actionDetectors = this.matter.world.getAllBodies().filter((body: MatterJS.BodyType) => body.label === "bugDetector");
		const marbles = this.matter.world.getAllBodies().filter((body: MatterJS.BodyType) => body.label === "marble");

		for (const marble of marbles) {
			for (const actionDetector of actionDetectors) {
				const isColliding = this.matter.overlap(marble, [actionDetector]);

				if (isColliding){
					const currentMarbleRow =  marble.gameObject.getData("activeRow");
					const isSameRow = currentMarbleRow.toString() == actionDetector.gameObject.getData("id")[0];
					if (currentMarbleRow < (actionDetector.gameObject.getData("id")[0] as number)) {
						marble.gameObject.setData("activeRow", currentMarbleRow + 1);
						console.log("marble moved to row", currentMarbleRow + 1);
					}
					if (isSameRow && !actionDetector.gameObject.getData("rotating")) {
						console.log("MARBLE TAIL COLLISION; START ROTATION", isSameRow)
						marble.gameObject.setData("activeRow", currentMarbleRow + 1);
						actionDetector.gameObject.setData("rotating", true);
						this.handleSwitchFlip(actionDetector.gameObject.body);
					}
					result = true;
				}
			}
		}

		return result;
	}

	private handleSwitchFlip(flipSwitch: MatterJS.BodyType): void {
		//console.log("SWITCH FLIP TRIGGERED");
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
		let currentAngle = flipSwitch.angle;

		/*
		const updateRotation = () => {
			if (!flipSwitch.gameObject.getData("rotating")) return;
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
				console.log("Rotation complete");
			} else {
				steps += 1;
			  	requestAnimationFrame(updateRotation);
			}
		};*/


		const updateRotation = () => {
			if (!flipSwitch.gameObject.getData("rotating")) return;

			// Calculate the new rotation angle based on the current angle and rotation speed
			const newAngle = currentAngle + rotationSpeed;
			this.matter.body.setAngle(flipSwitch, newAngle, true); // Set the new angle

			// Update the current angle with the new angle
			currentAngle = newAngle;

			// Filter the bodies based on their label property
			const borders = this.matter.world.getAllBodies().filter(
			  (body: MatterJS.BodyType) => body.label === "border"
			);

			// Check for collision with a border
			const collidesWithBorder =
			  this.matter.query.region(borders, flipSwitch.bounds).length > 0;

			if (collidesWithBorder && steps > 8) {
			  const newTilt = sign < 0 ? "left" : "right";
			  flipSwitch.gameObject.setData("tilt", newTilt);
			  flipSwitch.gameObject.setData("rotating", false);
			  this.matter.body.setStatic(flipSwitch, true);
			  console.log("Rotation complete", flipSwitch.gameObject.getData("id"));
			} else {
				steps += 1;
			  requestAnimationFrame(updateRotation);
			}
		};

		updateRotation();
	}

	// NOT WORKING YET, PROBABLY TO BE REMOVED
	/*
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
	}*/

	/*private applyRepulsiveForceOnMarbles(): void {
		// Loop through each marble and apply the anti-magnetic force to the others
		const marbles = this.matter.world.getAllBodies().filter((body: MatterJS.BodyType) => body.label === "marble");
		const antiMagneticRange = 100;
		marbles.forEach((marbleA) => {
			marbles.forEach((marbleB) => {
				if (marbleA !== marbleB) {
					// Calculate the distance between the two marbles
					const distance = Phaser.Math.Distance.Between(
						marbleA.position.x,
						marbleA.position.y,
						marbleB.position.x,
						marbleB.position.y
					);

					// If the distance is within the range, apply an anti-magnetic force
					if (distance < antiMagneticRange) {
						// Generate a unique identifier for this pair of marbles
						const key = `${marbleA.id}-${marbleB.id}`;

						// Check if an attractor already exists for this pair
						if (!this.activeAttractors.has(key)) {
							const antiMagneticForce = 0.001; // Adjust the strength of the force as needed
							const attractor = this.matter.add.attractor(
								marbleA.x,
								marbleA.y,
								antiMagneticRange,
								antiMagneticForce
							);
							this.matter.body.addAttractor(marbleB, attractor);

							// Store the attractor in the Map with the unique key
							activeAttractors.set(key, attractor);
						}
					} else {
						// If the distance is outside the range, check if there is an attractor for this pair and remove it
						const key = `${marbleA.id}-${marbleB.id}`;
						if (activeAttractors.has(key)) {
							const attractor = activeAttractors.get(key);
							this.matter.body.removeAttractor(attractor.target, attractor);
							activeAttractors.delete(key);
						}
					}
				}
			});
		});
	}*/

	private checkForMarbleDeletion(): void {
		const marbles = this.matter.world.getAllBodies().filter((body: MatterJS.BodyType) => body.label === "marble");
		for (const marble of marbles){
			// Check if the marble is out of bounds
			if (marble.position.y > this.scale.height - this.marbleRadius) {
				//console.log("MARBLE FELL OUT OF THE BOARD, REMOVE IT")
				marble.gameObject.destroy();
				this.matter.world.remove(marble);
				this.boardMarbles -= 1;
			}
		}
	}

	private checkForCompletedSimulation(): void {
		const bodies = this.matter.world.getAllBodies();
		let marblesMoving = false;

		// Check if any bodies are still moving
		for (const body of bodies) {
			switch (body.label) {
				case "marble":
					const velocityMagnitude = this.getVelocityMagnitude(body);
					if (velocityMagnitude < this.movementThreshold) continue;
					marblesMoving = true;
					break;
			}
			if (["switch", "marble"].includes(body.label)) {
				const velocityMagnitude = this.getVelocityMagnitude(body);
				if (velocityMagnitude < this.movementThreshold) continue;
				marblesMoving = true;
				break;
			}
		}

		/*
		const switches = this.matter.world.getAllBodies()
		.filter((body: MatterJS.BodyType) => body.label === "switch")
		.map((body: MatterJS.BodyType) => body.gameObject);

		let marblesStopped = 0;
		for (const gameSwitch of switches) {
			if ([-2,2].includes(gameSwitch.getData("marbleStatus"))) {
				marblesStopped += 1;
			}
		}*/

		const simulationComplete = !marblesMoving //&& (marblesStopped == this.boardMarbles);

		// If the simulation is complete, enable the button
		if (simulationComplete && this.simulationRunning) {
			console.log("SIMULATION HAS FINISHED, NEW BOARD STATE:");
			this.toggleInput(true);
			this.simulationRunning = false;
			if(this.gameMode.isLocal){
				this.toggleInput(true);
			} else {
				console.log("blocking for " + this.turn)
				this.initButtonsclickable(this.turn);
			}
			this.interpretGameState();
			if(this.turn==1 || !this.gameMode.isVsAi) {
				this.toggleInput(true);
			}
			this.simulationRunning = false;
		}
	}

	private async interpretGameState(): Promise<void> {
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
				holds_marble[row].push(current_switch.getData("marbleStatus"));
			}
		}

		console.log(switch_orientation, holds_marble);
		if(this.gameMode.isVsAi) {
			this.gameMode.currentBoard = interpretBoardReverse(switch_orientation, holds_marble);
		}

		// PLACEHOLDER FOR GameMode.interpretGameState(board); 
		// precending logic potentially to be adapted
		const evalResult = this.gameMode!.interpretGameState(holds_marble);
		console.log("MULTIPLAYER?", this.gameMode.isMultiplayer)
		if (evalResult.hasWinner) {
			let gameEndText = '';
			if (this.gameMode.isMultiplayer) {
				switch (evalResult.winner.length) {
					case 1:
						gameEndText = "Player " + evalResult.winner[0] + " has won!";
						break;
					case 2:
						gameEndText = "It's a draw!";
						break;
				}
			} else {
				gameEndText = "Congratulation! You won!"
			}

			this.scene.pause(MainGame.Name);
			this.scene.launch(GameEnd.Name, { displayText: gameEndText });
		} else if (this.gameMode.isMultiplayer) {
			console.log("SWITCH TURNS CALLED")
			this.turn = this.gameMode.switchTurns(this.turn, this);
			if (this.gameMode.isVsAi && this.turn == -1){
				this.toggleInput(false);
				this.simulationRunning = false;
				await new Promise(f => setTimeout(f, 500));
				let agentTurn = await this.gameMode.getAgentMove()+1;
				this.dropMarble(agentTurn);
			}
		}
	}

	public initButtonsclickable(turn: number): void{
		if(!this.gameMode.isLocal ){
			var onlinegame = this.gameMode as OnlineMultiPlayer;
			if(onlinegame.me == turn){
				console.log("blocking", onlinegame.me, "on turn", turn);
				this.toggleInput(false);
			} else {
				console.log("enabling", onlinegame.me, "on turn", turn);
				this.toggleInput(true);
			}
		}
	}
	//public update(/*time: number, delta: number*/): void {
		
	//}
}
