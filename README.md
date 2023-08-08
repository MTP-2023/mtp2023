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
tba

## Game
### Set up
For the backend, the installation of the requirements (see "Set up" in agent training) covers all the relevant packages. Specifically, fastapi and ray are required for the server.
For the game, navigate into the react-avalanche folder and run "npm install". This loads all required node modules for the game. Note, that a previous installation of Node.js is necessary.

### Start the game
In order to start the server (also required for local modes), it is required to navigate into the gameResources/API folder and start it via "uvicorn cAPI:app" with the activated environment.
To get the game running, execute "npm run dev" in the react-avalanche frontend folder. Then, open the provided localhost link ("/game") and you can play the game. To simulate online multiplayer, open the game in two different tabs/windows.
