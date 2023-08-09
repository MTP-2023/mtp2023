import Utilities from "../Utilities";
import GameEnd from "../SceneOverlays/GameEnd";
import { AbstractGameMode } from "../GameModes/GameModeResources";
import { SinglePlayerChallenge } from "../GameModes/SinglePlayerChallenge";
import { LocalMultiPlayer } from "../GameModes/LocalMultiPlayer";
import { LocalVsAi} from "../GameModes/LocalVsAi";
import { interpretBoardReverse } from "../Helper/BoardInterpreter";
import { OnlineMultiPlayer } from "../GameModes/OnlineMultiplayer";
import QuitGame from "../SceneOverlays/QuitGame";
import DisconnectNotification from "../SceneOverlays/DisconnectNotification";

export default class MainGame extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "MainGame";

	// global var definition
	scaleFactor: number = 1.4;
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
	movementThreshold: number = 0.001;
	switchRotationVelocity: number = 0.032;
	buttonColor: number;
	buttonOutlineColor: number;
	buttonTextColor: string;
	buttonTextStyle: { fontSize: string; fill: any; };
	gameMode: AbstractGameMode;
	turn: number = 1;
	boardMarbles: number = 0;
	boardSpacingTop: number = 180;
	clickAudio: any;
	marbleStopSound: any;
	marbleDropSound: any;
	switchRotationSound: any;
	backgroundSound: any;

	constructor() {
		super({ key: MainGame.Name });
		// CONST VARS FOR INITIALIZATION
		// set vars for images
		this.switchWidth = this.scaleFactor * 70;
		this.imgHeight = this.scaleFactor * 104;
		this.borderWidth = this.scaleFactor * 5;
		this.switchSpacingY = this.scaleFactor * 50;
		this.borderExtraHeight = this.scaleFactor * 0.15 * this.switchSpacingY;
		this.boardWidth = 4 * this.switchWidth + 5 * this.borderWidth;
		this.marbleRadius = 13 * this.scaleFactor;

		this.buttonRadius = this.scaleFactor * 10;
		this.buttonFontSize = this.scaleFactor * 20;

		this.simulationRunning = false;
		this.counter = 0;

		// set vars for buttons
		this.buttonColor = 0x000000;
		this.buttonOutlineColor = 0xffffff;
		this.buttonTextColor = "#ffffff";
		this.buttonTextStyle = { fontSize: this.buttonFontSize+"px", fill: this.buttonTextColor };
	}

	// set up of visual and acoustic elements
	private createBackground(): void {
		// start playing audio
		this.backgroundSound = this.sound.add("gameplaySoundtrack", { loop: true });
		this.backgroundSound.setVolume(0.3);
    	this.backgroundSound.play();

		this.marbleStopSound = this.sound.add("marbleStopSound");
		this.marbleStopSound.setVolume(0.4);
		this.marbleDropSound = this.sound.add("marbleDropSound");
		this.marbleDropSound.setVolume(0.4);
		this.switchRotationSound = this.sound.add("switchRotationSound");
		this.switchRotationSound.setVolume(0.4);
		this.clickAudio = this.sound.add("woodenClick");

		// background animation
		const backgroundAnimation = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, "frame0").play("animatedBackground");
		backgroundAnimation.setDepth(-5);

		// wooden board
		const woodenBoard = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "wood-board");
        woodenBoard.setScale(0.55);
		woodenBoard.setDepth(-4);
	}

	// add borders to increase gameplay consistency
	private addBorder(row: number, switchIndex: number, boardX: number, boardY: number): Phaser.GameObjects.Rectangle {
		// calculate border coordinates
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

	// add buttons that allow the player to drop marbles into the board
	private addButton(x: number, y: number, content: number): Phaser.GameObjects.Image {
		// Create a sprite for the circular image
		const circularImage = this.add.sprite(x, y, "wood-circle").setScale(0.06);
		
		// Create a text object to display the number
		const text = this.add.text(x, y, content.toString(), this.buttonTextStyle);
		text.setOrigin(0.5);
		
		// Add the click event listener
		circularImage.setInteractive();
		circularImage.on('pointerdown', () => {
			this.clickAudio.play();
			if (this.gameMode.isMultiplayer && !this.gameMode.isLocal) {
				var onlinegame = this.gameMode as OnlineMultiPlayer;
				onlinegame.makeMove(content);
				this.toggleInput(false);
			} else {
				this.dropMarble(content);
			}
		});

		// onhover effect
		circularImage.on('pointerover', () => {
			this.toggleTextShadow(text, true);
		});

		circularImage.on('pointerout', () => {
			this.toggleTextShadow(text, false);
		});
		
		return circularImage;
	}

	// add a dedicated button that allows the player to quit the game
	private addQuitButton(y: number): void {
        const closeCircle = this.add.sprite(0, 0, "wood-circle");
        closeCircle.setScale(0.08);

        const closeCross = this.add.sprite(0, 0, "close-cross");
        closeCross.setScale(0.04); 
        closeCross.setDepth(1);

        const closeButton = this.add.container(this.scale.width * 0.675, y);

        closeButton.add(closeCircle);
        closeButton.add(closeCross);
        closeCircle
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.pause();
				this.scene.run(QuitGame.Name, { gameMode: this.gameMode, gameScene: this });
            });
	}

	// function that handles text shadow effect
	private toggleTextShadow(text: Phaser.GameObjects.Text, toggleOn: boolean) {
        if (toggleOn) {
            text.setShadow(5, 5, 'rgba(0,0,0,0.5)', 4);
        } else {
            text.setShadow(0, 0, undefined);
        }
    }

	// add switches as a core game element
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
		
		const detectorHeight = (this.imgHeight - switchShape.centerOfMass.y);
		// add rectangle to act as a sensor to hold marbles (collision detection of matter appeared to be buggy sometimes)
		const holdDetectorY = y - (this.imgHeight / 2.5);
		const holdDetector = this.matter.add.rectangle(x, holdDetectorY, this.switchWidth, detectorHeight/2.5, { label: "holdDetector", isStatic: true, isSensor: true });
		holdDetector.gameObject = switchSprite;

		// add rectangle to act as a sensor to initiate switch flips (collision detection of matter appeared to be buggy sometimes)
		const switchDetectorY = y - (this.imgHeight / 2) + switchShape.centerOfMass.y + (detectorHeight / 1.65);
		const switchDetector = this.matter.add.rectangle(x, switchDetectorY, this.switchWidth, detectorHeight/2.5, { label: "switchDetector", isStatic: true, isSensor: true });
		switchDetector.gameObject = switchSprite;
		
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

		// add challenge goal indicator if required
		const indicatorHeight = this.imgHeight + 2 * this.borderExtraHeight;
		this.gameMode?.addChallengeIndicator(this, goalBoardData, x, y, this.switchWidth, indicatorHeight, 2);

		return switchSprite;
	}

	// main function that is called during creatin of the game scene
	public async create(data: { gameModeHandle: string , agent: string, gameModeObj: AbstractGameMode, scores: number[] }): Promise<void> {
		Utilities.LogSceneMethodEntry("MainGame", "create");

		// set matter options
		this.matter.world.update60Hz();
		this.matter.world.setGravity(0, 0.8);

		// init graphics
		this.createBackground();

		// initialize gameMode
		switch (data.gameModeHandle) {
			case "singlePlayerChallenge":
				this.gameMode = new SinglePlayerChallenge();
				break;
			case "local1v1":
				this.gameMode = new LocalMultiPlayer();
				this.gameMode.player1Score = data.scores[0];
				this.gameMode.player1Score = data.scores[1];
				break;
			case "localvsai":
				this.gameMode = new LocalVsAi();
				this.gameMode.agent = data.agent;
				this.gameMode.player1Score = data.scores[0];
				this.gameMode.player1Score = data.scores[1];
				break;
			case "online1v1":
				this.gameMode = data.gameModeObj;
				break;
		}

		if (this.gameMode.isLocal) {
			await this.gameMode.initChallenge();
		} else {
			onlinegame = this.gameMode as OnlineMultiPlayer;
			this.turn = 1;
		}

		// set initial values for dynamic variables
		this.simulationRunning = false;
		this.counter = 0;
		this.boardMarbles = 0;
		this.turn = 1;
		
		// retrieve start and goal board that is required for the game board set up
		const startBoard =  this.gameMode!.getStartBoard();
		const goalBoard = this.gameMode!.getGoalBoard();

		// initialize UI vars
		const camera = this.cameras.main;
		const boardX = (this.scale.width - this.boardWidth) / 2;
		const boardY = camera.worldView.y + 180 * this.scaleFactor;
		const buttonStartY = camera.worldView.y + 120 * this.scaleFactor;
		const switchGroup = this.add.container();
		switchGroup.setName("gameBoard");

		// player UI
		const playerStatusWidth = boardX * 0.8;
		const playerStatusHeight = this.imgHeight;
		const playerStatusX = (boardX - playerStatusWidth/1.2);
		const playerStatusY = camera.worldView.y + 100 * this.scaleFactor;

		if(this.gameMode.isMultiplayer) {
			const playerNames = this.gameMode.getPlayerNames();
			this.gameMode.createPlayerStatus(this, playerStatusX, playerStatusY, playerStatusWidth, playerStatusHeight, this.boardWidth + boardX, playerNames[0], playerNames[1], "wood-nametag", 0.25);
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

		this.addQuitButton(buttonStartY,);

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

		//Event Handler
		if(!this.gameMode.isLocal && this.gameMode.isMultiplayer){
			var onlinegame = this.gameMode as OnlineMultiPlayer;
			onlinegame.gameOverEvent.on("gameOver", this.handleGameOver, this);
			onlinegame.moveEvent.on("move", this.handleMove, this);
			onlinegame.boardEvent.on("emit", this.getChallenge, this);
			onlinegame.dcEvent.on("dc", this.handleDisconnect, this)
		}

		// Register the beforeupdate event
		this.matter.world.on("beforeupdate", () => {
			//console.log("BEFOREUPDATE")
			if (this.simulationRunning) {
				this.checkForMarbleDeletion();
			}
		});
  

		this.matter.world.on("afterupdate", () => {
			if (this.simulationRunning) {
				this.registerMarbleStops();
				const flipSwitchsToHandle = this.checkIfSwitchFlipRequired();
				if (!flipSwitchsToHandle) this.checkForCompletedSimulation();
			} 
		});

		this.onKeyPress = this.onKeyPress.bind(this);
		// Enable keyboard input
		if (this.input && this.input.keyboard) {
			this.input.keyboard.on('keydown', this.onKeyPress);
		}
		if(!this.gameMode.isLocal){
			var onlinegame = this.gameMode as OnlineMultiPlayer;
			if(onlinegame.me == -1){
				this.toggleInput(false);
			}
		}

		// use phaser's collision detection for audio playback (too inconsistent for logic/data handling)
		// listen for collision events detected by matter
		this.matter.world.on("collisionstart", (event: MatterJS.IEventCollision<MatterJS.BodyType>, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => {
			this.handleCollisions(bodyA, bodyB);
		});
	}

	// determine type of collision and call respective function
	private handleCollisions(bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType): void {
		if (this.checkCollision(bodyA, bodyB, "marble", "head")) {
			
			//console.log("SWITCH SHOULD HOLD MARBLE")
			
			const marble = bodyA.label == "marble" ? bodyA : bodyB;
			if (this.getVelocityMagnitude(marble) < this.movementThreshold) {
				this.marbleStopSound.play();
				console.log(this.getVelocityMagnitude(marble))
			} 
		} 
	}

	// determine whether the collision is between two specified types
	private checkCollision(bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType, type1: string, type2: string): boolean {
		const isA1 = bodyA.label === type1;
		const isB1 = bodyB.label === type1;
		const isA2 = bodyA.label === type2;
		const isB2 = bodyB.label === type2;

		return (isA1 && isB2 || isA2 && isB1)? true : false;
	}

	// handle marble drop via numeric keys
	private onKeyPress(event: Phaser.Input.Keyboard.Key): void {
		const code = event.keyCode;
        if (code >= Phaser.Input.Keyboard.KeyCodes.ONE && code <= Phaser.Input.Keyboard.KeyCodes.SIX) {
			if (!this.simulationRunning) {
				// Get the number from the keyCode (assuming it's a number key)
				const number = code - Phaser.Input.Keyboard.KeyCodes.ONE + 1;
				this.clickAudio.play();
				if(this.gameMode.isMultiplayer && !this.gameMode.isLocal) {
					console.log("multi")
					var onlinegame = this.gameMode as OnlineMultiPlayer;
					onlinegame.makeMove(number);
					this.toggleInput(false);
				  }
				  else {
					console.log("single")
					this.dropMarble(number);
				  }
			}
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

	// handle opponent disconnect
	private handleDisconnect(){
		if(!this.gameMode.isLocal){
			var onlinegame = this.gameMode as OnlineMultiPlayer;
			onlinegame.moveEvent.destroy();
		}
		this.scene.pause();
		this.scene.run(DisconnectNotification.Name);
	}

	// Event handler for the "moveEvent"
	private handleMove(col: number) {
	  	this.dropMarble(col);
	}

	// spawn a marble in the respective column
	private dropMarble(col: number): void {
		if(!this.gameMode.isLocal){
			var onlinegame = this.gameMode as OnlineMultiPlayer;
			console.log("dropping as ", onlinegame.me);
		}
		console.log("PLAYER TRHOWS MARBLE INTO", col);
		this.boardMarbles += 1;

		// create marble sprite adn calculate location
		const switchShape = this.cache.json.get("marble-shape");
		const boardX = (this.scale.width - this.boardWidth) / 2;
		let x = boardX + this.switchWidth/2 + this.borderWidth + Math.floor((col-1) / 2) * (this.switchWidth + this.borderWidth);
		x = (col % 2 == 0) ? x + this.switchWidth - 1.075 * this.marbleRadius: x + 1.075 * this.marbleRadius;
		const marblePNG = this.gameMode.getMarbleSprite(this.turn, this);
		let marbleSprite = this.matter.add.sprite(x, this.boardSpacingTop, marblePNG, undefined, { shape: switchShape });

		// add body/shape to marble
		let a = 0.98;
		marbleSprite.setDisplaySize(2*this.marbleRadius*a, 2*this.marbleRadius*a);
		this.matter.alignBody(marbleSprite.body as MatterJS.BodyType, x, this.boardSpacingTop, Phaser.Display.Align.CENTER);
		this.counter = this.counter + 1;

		// set marble data
		marbleSprite.setData("id", this.counter);
		marbleSprite.setData("player", this.turn);
		marbleSprite.setData("activeRow", -1);

		// disable input and set simulationRunning to true
		this.toggleInput(false);
		this.simulationRunning = true;
	}

	// enable/disable all marble buttons during simulation
	private toggleInput(clickable: boolean): void {
		const buttonGroup = this.children.getByName("buttons") as Phaser.GameObjects.Container;
		buttonGroup.getAll().forEach((child: Phaser.GameObjects.GameObject) => {
			if (child instanceof Phaser.GameObjects.Sprite) {
			  	const button = child as Phaser.GameObjects.Sprite;
			  	clickable ? button.setInteractive() : button.disableInteractive();
			}
		});

		if (this.input.keyboard) {
			if (clickable) {
				// Enable the keyboard listener
				this.input.keyboard.on('keydown', this.onKeyPress);
			} else {
				// Remove the keyboard listener
				this.input.keyboard.off('keydown', this.onKeyPress);
			}
		}
	}

	// funciton to retrieve the velocity of a body
	private getVelocityMagnitude(obj: MatterJS.BodyType): number {
		return this.matter.vector.magnitude(obj.velocity);
	}

	// manual detection whether a switch rotation is required
	private checkIfSwitchFlipRequired(): boolean {
		let result = false;
		const actionDetectors = this.matter.world.getAllBodies().filter((body: MatterJS.BodyType) => body.label === "switchDetector");
		const marbles = this.matter.world.getAllBodies().filter((body: MatterJS.BodyType) => body.label === "marble");

		for (const marble of marbles) {
			for (const actionDetector of actionDetectors) {
				// check if a marble is inside a switch tail detector
				const isColliding = this.matter.overlap(marble, [actionDetector]);
				// if yes, make sure that the rotation is performed once and the data is updated correctly
				if (isColliding){
					const currentMarbleRow =  marble.gameObject.getData("activeRow");
					const isSameRow = currentMarbleRow.toString() == actionDetector.gameObject.getData("id")[0];
					if (currentMarbleRow < (actionDetector.gameObject.getData("id")[0] as number)) {
						marble.gameObject.setData("activeRow", currentMarbleRow + 1);
					}
					if (isSameRow && !actionDetector.gameObject.getData("rotating")) {
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

	// execute the switch flip
	private handleSwitchFlip(flipSwitch: MatterJS.BodyType): void {
		this.matter.body.setStatic(flipSwitch, false);
		flipSwitch.gameObject.setData("marbleStatus", 0);
	  
		// determine direction and set speed
		const sign = flipSwitch.gameObject.getData("tilt") == "left" ? 1 : -1;
		const rotationSpeed = sign * this.switchRotationVelocity;

		// use steps as additional check to allow switch to start rotation
	  	let steps = 0;
		let currentAngle = flipSwitch.angle;

		// function to update rotation for each frame
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

			// if yes, stop the rotation and update data, otherwise continue
			if (collidesWithBorder && steps > 8) {
			  const newTilt = sign < 0 ? "left" : "right";
			  flipSwitch.gameObject.setData("tilt", newTilt);
			  flipSwitch.gameObject.setData("rotating", false);
			  this.matter.body.setStatic(flipSwitch, true);
			} else {
				steps += 1;
			  requestAnimationFrame(updateRotation);
			}
		};
		// play corresponding audio and start rotation
		this.switchRotationSound.play();
		updateRotation();
	}

	// check if marbles stop movement inside of respective detectors and update the game board data accordingly
	private registerMarbleStops(): void {
		const actionDetectors = this.matter.world.getAllBodies().filter((body: MatterJS.BodyType) => body.label === "holdDetector");
		const marbles = this.matter.world.getAllBodies().filter((body: MatterJS.BodyType) => body.label === "marble");

		for (const marble of marbles) {
			for (const actionDetector of actionDetectors) {
				const isColliding = this.matter.overlap(marble, [actionDetector]);

				if (isColliding && this.getVelocityMagnitude(marble) <= this.movementThreshold){
					actionDetector.gameObject.setData("marbleStatus", marble.gameObject.getData("player") * 2);
				}
			}
		}
	}

	// remove marbles if they pass a certain y value
	private checkForMarbleDeletion(): void {
		const marbles = this.matter.world.getAllBodies().filter((body: MatterJS.BodyType) => body.label === "marble");
		for (const marble of marbles){
			// Check if the marble is out of bounds
			if (marble.position.y > this.scale.height - this.marbleRadius) {
				marble.gameObject.destroy();
				this.matter.world.remove(marble);
				this.boardMarbles -= 1;
				// play delayed drop sound
				setTimeout(() => { this.marbleDropSound.play() }, 100);
			}
		}
	}

	// perform check if the simulation is complete to start post move logic or continue
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

		
		const switches = this.matter.world.getAllBodies()
		.filter((body: MatterJS.BodyType) => body.label === "switch")
		.map((body: MatterJS.BodyType) => body.gameObject);

		// count registered marbles
		let marblesStopped = 0;
		for (const gameSwitch of switches) {
			if ([-2,2].includes(gameSwitch.getData("marbleStatus"))) {
				marblesStopped += 1;
			}
		}

		const simulationComplete = !marblesMoving;
		
		// If the simulation is complete, interpret the game state and enable the button
		if (simulationComplete && this.simulationRunning) {
			this.interpretGameState();
			this.simulationRunning = false;

			if(this.turn==1 || !this.gameMode.isVsAi) {
				this.toggleInput(true);
			}
			if(this.gameMode.isLocal){
				this.toggleInput(true);
			} else {
				this.initButtonsclickable(this.turn);
			}
		}
	}

	// check if the a player has win
	private async interpretGameState(): Promise<void> {
		// Filter the bodies based on their label property
		const switches = this.matter.world.getAllBodies()
		.filter((body: MatterJS.BodyType) => body.label === "switch")
		.map((body: MatterJS.BodyType) => body.gameObject);

		// read data from physics engine (switch orientation and switch/marble relation)
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

		// add extra layer of game board conversion that is required for the AI agent
		if(this.gameMode.isVsAi) {
			this.gameMode.currentBoard = interpretBoardReverse(switch_orientation, holds_marble);
		}

		
		const evalResult = this.gameMode!.interpretGameState(holds_marble);

		// if there is a winner, end the game and show game end overlay scene
		if (evalResult.hasWinner) {
			this.gameMode.stopIndicators(this);
			this.toggleInput(false);
			let gameEndText = '';
			if (this.gameMode.isMultiplayer) {
				switch (evalResult.winner.length) {
					case 1:
						var winner = "Player " + evalResult.winner[0].toString();
						if(!this.gameMode.isLocal){
							var onlinegame = this.gameMode as OnlineMultiPlayer;
							if(evalResult.winner[0] == 1){
								winner = onlinegame.player1Name;
							} else {
								winner = onlinegame.player2Name;
							}
							onlinegame.moveEvent.destroy();
						} else if (this.gameMode.isVsAi) {
							if(evalResult.winner[0] == 1){
								winner = "You";
							} else {
								winner = "The AI agent";
							}
						}
						gameEndText = winner + " won!";
						break;
					case 2:
						gameEndText = "It's a draw!";
						break;
				}
			} else {
				gameEndText = "Congratulations! You won!"
			}
			if(!this.gameMode.isLocal){
				var onlinegame = this.gameMode as OnlineMultiPlayer;
				onlinegame.moveEvent.destroy();
			} else {
				this.gameMode.updateScores(evalResult.winner);
			}
			this.scene.pause(MainGame.Name);
			this.backgroundSound.stop();
			this.scene.launch(GameEnd.Name, { displayText: gameEndText, gameMode: this.gameMode, gameScene: this });
		} else if (this.gameMode.isMultiplayer) {
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

	// handle clickable buttons for online multiplayer
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
}