# mtp2023
Both halves of the project have a dedicated folder. While the first half focuses on training agents to solve single player challenges, the second half includes the adaptation of the agent for a multiplayer game mode and the implementation of a playable game.

## Agent training
### Set up
Make sure to install Build Tools for Visual Studio from https://visualstudio.microsoft.com/de/downloads/.

Scroll down to "Tools für Visual Studio" -> "Buildtools für Visual Studio 2022".

In the installer, select only the C++ Package.

Create a python virtual environment (python version <= 3.9) using Anaconda and use "conda install swig" (It is important to do this before installing the rest of the requirements.)

Then, install the remaining required packages using "pip install -r requirements.txt". If you receive an error concerning "mucojo", you can ignore it.

### Run agent training
Starting a training run for both singleplayer (First Half) and multiplayer (Second Half) consists of the same steps, although you might want to use different settings in each case.

First, navigate to agent/rl. There, you can run train.py to train an agent, with run-specific settings being handled using command line arguments.
Check out train.py to see all arguments, but here is a quick overview of the most important arguments:

--variant lets you select the game variant (or more accurately the way the reward is calculated). The different options that are available can be seen in gameVariants.

--train_on lets you select the set of challenges you want your agent to train on. Make sure they fit your selected variant.

--stop_reward sets the reward you want to stop training at. Be careful to not set it too low.

--curriculum_threshold sets the reward your agent goes up to the next level during curriculum training. Finding a good value here requires some trial and error.

--wandb (or --no-wandb) toggles the logging of the run to weights and biases. If you want to use this feature, you will need to change the wandb workspace referred to in the code and provide a file called "wandb_api_key.txt" in agent/rl.

--log_as lets you set the name of the run in wandb.

--algo lets you select the algorithm you want to train (AlphaZero or PPO for singleplayer, multiplayer only allows for PPO).

--vs lets you select the opponent you want to train against in multiplayer (random or mcts)

## Game
### Set up
For the backend, the installation of the requirements (see "Set up" in agent training) covers all the relevant packages. Specifically, fastapi and ray are required for the server.
For the game, navigate into the react-avalanche folder and run "npm install". This loads all required node modules for the game. Note, that a previous installation of Node.js is necessary.

### Start the game
In order to start the server (also required for local modes), it is required to navigate into the gameResources/API folder and start it via "uvicorn cAPI:app" with the activated environment.
To get the game running, execute "npm run dev" in the react-avalanche frontend folder. Then, open the provided localhost link ("/game") and you can play the game. To simulate online multiplayer, open the game in two different tabs/windows.


## Drive
Artefacts and other data associated with the project can be found in the following Google Drive Folder:

https://drive.google.com/drive/folders/1PgLWJMNvnSesAZkv0Q1Fyz1sceVV4hRL?usp=drive_link
