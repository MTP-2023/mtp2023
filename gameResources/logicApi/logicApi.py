from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

import sys
sys.path.append('../')
sys.path.append('../../agent/rl')
from simulation.simulate import run
from boardGenerator.generate import generate_random_board
from challengeGenerator.generateGoal import generateGoalState
from collections import OrderedDict
import numpy as np
from apply_policy import return_move, solve_challenge
from ray.rllib.policy.policy import Policy

# load policy
artifact_dir ='../../gameResources/trainedAgents/test/policies/default_policy'
agent = Policy.from_checkpoint(artifact_dir)

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
        "name": "challenge",
        "description": "Request a challenge with given parameters.",
    },
    {
        "name": "interpret",
        "description": "Provide a game board status and a marble throw. Receive the updated game state with all intermediate steps.",
    },
    {
        "name": "step",
        "description": "Request the next action from a pretrained agent.",
    },
    {
        "name": "solve",
        "description": "Request the sequence of moves that solves the challenge (within a mximum range).",
    }
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

class ChallengeDTO(BaseModel):
    current: list
    goal: list

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

@app.get("/challenge", tags=["challenge"])
async def returnChallenge(width: int = default_width, height: int = default_height, minMarbles: int = 3, maxMarbles: int = 3, turnLimit: int = 10, availableMarbles: int = 100, fallthrough: bool = False):
    start_board = generate_random_board(width, height)
    goal_board = generateGoalState(start_board, minMarbles, maxMarbles, turnLimit, availableMarbles, width*2, fallthrough)

    return {
        "start": start_board,
        "goal": goal_board
    }

# request to simulate a throw, return game board and marble states
@app.post("/interpret/", tags=["interpret"])
async def runSimulation(gameBoard: SimulationDTO):
    updatedStates = run(gameBoard.marble_throw, gameBoard.board, return_intermediate_data = True)
    return updatedStates

# request the next action from a pretrained RL agent
@app.get("/step/", tags=["step"])
async def requestAction(challenge: ChallengeDTO):
    # create observation
    obs = OrderedDict()
    obs["current"] = np.array(challenge.current)
    obs["goal"] = np.array(challenge.goal)

    action = return_move(agent, obs)

    return {
        "action": int(action)
    }

# request the solution for a challenge from a pretrained RL agent
@app.get("/solve/", tags=["solve"])
async def requestAction(challenge: ChallengeDTO, max_steps: int = 20):
    # create observation
    obs = OrderedDict()
    obs["current"] = np.array(challenge.current)
    obs["goal"] = np.array(challenge.goal)

    # obtain solution of agent
    solution = solve_challenge(agent, obs, max_steps)

    return solution