from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

import sys
sys.path.append('../')
from simulation.simulate import run
from boardGenerator.generate import generate_random_board
from challengeGenerator.generateGoal import generateGoalState

# basic description of API endpoints for /docs
tags_metadata = [
    {
        "name": "randomboard",
        "description": "Request a random, empty game board with width and height attributes.",
    },
    {
        "name": "staticboard",
        "description": "Request a predefined, empty game board of default size.",
    },
    {
        "name": "defaultchallenge",
        "description": "Request a challenge of the baseline game variant.",
    },
    {
        "name": "interpret",
        "description": "Provide a game board status and a marble throw. Receive the updated game state with all intermediate steps.",
    },
]


# documentation is available at "/docs"
app = FastAPI(title = "Logic API for the frontend of the Avalanche marble game", docs_url="/docs", openapi_tags=tags_metadata)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# set default game board size params globally
default_width = 3
default_height = 2


class SimulationDTO(BaseModel):
    marble_throw: int
    board: list

# request new random board
@app.get("/randomboard", tags=["randomboard"])
async def randomBoard(width: int = default_width, height: int = default_height):
    return generate_random_board(width, height)

# get some fixed board
@app.get("/staticboard", tags=["staticboard"])
async def staticBoard():
    return [[0,0,1,1,0,1,0,0],
        [1,0,0,1,1,0,1,0],
        [0,1,0,0,1,0,1,0],
        [1,0,1,0,1,0,0,1]]

@app.get("/defaultchallenge", tags=["defaultchallenge"])
async def returnChallenge(width: int = default_width, height: int = default_height, marbleCount: int = 3, max_turns: int = 10, fallthrough: bool = False):
    start_board = generate_random_board(width, height)
    goal_board = generateGoalState(start_board, marbleCount, max_turns, 42, width*2, fallthrough)

    return {
        "start": start_board,
        "goal": goal_board
    }

# request to simulate a throw, return game board and marble states
@app.post("/interpret/", tags=["interpret"])
async def runSimulation(gameBoard: SimulationDTO):
    updatedStates = run(gameBoard.marble_throw, gameBoard.board, return_intermediate_data = True)
    return updatedStates
