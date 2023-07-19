import Utilities from "../Utilities";
import MainGame from "./MainGame";
import MainMenu from "./MainMenu";

export default class AgentSelect extends Phaser.Scene {
    /**
     * Unique name of the scene.
     */
    public static Name = "AgentSelect";

    public preload(): void {
        // Preload as needed.
    }

    public create(mainMenuScene: MainMenu): void {
        Utilities.LogSceneMethodEntry("GameEnd", "create");
        const textYPosition = this.cameras.main.height / 2;
        const textXPosition = this.cameras.main.centerX;


        const overlayHeight = this.cameras.main.height;
        const overlayWidth = this.cameras.main.width;
        const button1 = this.add.text(textXPosition, textYPosition, 'Reinforcement Learner', {
            fontSize: 60,
            backgroundColor: '#00aa00',
            align: "center"
        });

        const button2 = this.add.text(textXPosition, textYPosition+button1.height, 'MCTS', {
            fontSize: 60,
            backgroundColor: '#aa0000',
            align: "center"
        });
        button1.setOrigin(0.5)
        button2.setOrigin(0.5)
        button1.setInteractive();
        button1.on('pointerdown', () => {
            // Define the action to be performed when button1 is clicked
            console.log('Button 1 was clicked!');
            this.scene.stop(AgentSelect.Name);
            this.scene.stop(MainMenu.Name);
            this.scene.start(MainGame.Name, {gameModeHandle: "localvsai", agent: "rl"});
        });
        button2.setInteractive();
        button2.on('pointerdown', () => {
            // Define the action to be performed when button2 is clicked
            console.log('Button 2 was clicked!');
            this.scene.stop(MainMenu.Name);
            this.scene.stop(AgentSelect.Name);
            this.scene.start(MainGame.Name, {gameModeHandle: "localvsai", agent: "mcts"});

        });
    }

    public update():
        void {
        // Update logic, as needed.
    }

}

