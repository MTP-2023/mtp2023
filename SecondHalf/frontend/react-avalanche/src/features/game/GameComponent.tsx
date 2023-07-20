import React, { useEffect } from 'react';
import Phaser from 'phaser';
import Boot from "./ts/Scenes/Boot";
import Preloader from "./ts/Scenes/Preloader";
import MainMenu from "./ts/Scenes/MainMenu";
import SplashScreen from "./ts/Scenes/SplashScreen";
import MainGame from "./ts/Scenes/MainGame";
import MainSettings from "./ts/Scenes/MainSettings";
import Victory from './ts/Scenes/GameEnd';
import OnlineSettings from './ts/Scenes/OnlineSettings';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

const GameComponent: React.FC = () => {
  useEffect(() => {
    // Initialize your Phaser game logic here
    const game_width = 800;
    const game_height = 600;

    const gameConfig: Phaser.Types.Core.GameConfig = {
      width: game_width,
      height: game_height,
      type: Phaser.AUTO,
      parent: 'game',
      title: 'Avalanche Game',
      dom: {
        createContainer: true
      },
      physics: {
        default: 'matter',
        matter: {
          debug: true,
          velocityIterations: 36,
          positionIterations: 24,
          constraintIterations: 12
        }
      },
      plugins: {
        scene: [{
            key: 'rexUI',
            plugin: RexUIPlugin,
            mapping: 'rexUI'
        }]
      }
    };
    
    const game = new Phaser.Game(gameConfig);

    // Add scenes to the game
    game.scene.add(Boot.Name, Boot);
    game.scene.add(Preloader.Name, Preloader);
    game.scene.add(MainMenu.Name, MainMenu);
    game.scene.add(SplashScreen.Name, SplashScreen);
    game.scene.add(MainGame.Name, MainGame);
    game.scene.add(MainSettings.Name, MainSettings);
    game.scene.add(Victory.Name, Victory);
    game.scene.add(OnlineSettings.Name, OnlineSettings);

    // Start the Boot scene
    game.scene.start(Boot.Name);

    // Handle window resize event
    const resize = (): void => {
      const canvas = game.canvas;
      const width = window.innerWidth;
      const temp_height = window.innerHeight;

      // get height of navbar to prevent scrolling
      const navbar = document.getElementById('navbar');

      const height = temp_height - navbar!.clientHeight;

      const wratio = width / height;
      const ratio = game_width / game_height;
      
      if (wratio < ratio) {
        canvas.style.width = width + "px";
        canvas.style.height = (width / ratio) + "px";
      } else {
        canvas.style.width = (height * ratio) + "px";
        canvas.style.height = height + "px";
      }
    };

    // Resize the game initially
    resize();

    // Add resize event listener
    window.addEventListener("resize", resize, true);

    return () => {
      // Clean up any resources or event listeners when the component unmounts
      game.destroy(true);
      window.removeEventListener("resize", resize, true);
    };
  }, []);

  return <div id="game" />;
};

export default GameComponent;