from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

import sys
sys.path.append('../')
sys.path.append('../../agent/rl')
from simulation.simulate import run
from boardGenerator.generate import generate_random_board
from challengeGenerator.generateGoal import generateGoalState
from challengeGenerator.generateChallenges import merge
from collections import OrderedDict
import numpy as np
from apply_policy import return_move, solve_challenge
from ray.rllib.policy.policy import Policy
import os
from ray.rllib.models import ModelCatalog

# initialize agents
agent_handles = [
    #'SimpleAgent',
    #'MCTS',
    'PPO', # checkpoint_gpu_14_675:v2
    'AlphaZero' # curriculum2Marbles, 100 simulations, complex model
]

# register models required for alphazero
from train_resources.azModel import DefaultModel, SimplerModel, ComplexModel
ModelCatalog.register_custom_model("default_alphazero_model", DefaultModel)
ModelCatalog.register_custom_model("simpler_alphazero_model", SimplerModel)
ModelCatalog.register_custom_model("complex_alphazero_model", ComplexModel)

agent_dict = {}

# load policies if possible
for agent_handle in agent_handles:
    artifact_dir ='../../gameResources/trainedAgents/'+agent_handle+'/policies/default_policy'
    if os.path.isdir(artifact_dir):
        agent = Policy.from_checkpoint(artifact_dir)
        agent_dict[agent_handle] = agent

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
        "name": "agent_options",
        "description": "Request the available agent options.",
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

@app.post("/challenge", tags=["challenge"])
async def returnChallenge(mode: str = "singlePlayer", width: int = default_width, height: int = default_height, minMarbles: int = 2, maxMarbles: int = 2, turnLimit: int = 10, availableMarbles: int = 100, fallthrough: bool = False):
    start_board = generate_random_board(width, height)
    if mode == "singlePlayer":
        goal_board = generateGoalState(start_board, minMarbles, maxMarbles, turnLimit, availableMarbles, width*2, fallthrough)
    elif mode == "twoPlayers":
        goal1 = generateGoalState(randomBoard, minMarbles, maxMarbles, turnLimit, 42, width * 2, False)
        goal2 = generateGoalState(randomBoard, minMarbles, maxMarbles, turnLimit, 42, width * 2, False)
        goal_board = merge(goal1, goal2, width, height)
    return {
                "start": start_board,
                "goal": goal_board
            }


# request to simulate a throw, return game board and marble states
@app.post("/interpret/", tags=["interpret"])
async def runSimulation(gameBoard: SimulationDTO):
    updatedStates = run(gameBoard.marble_throw, gameBoard.board, player=1,return_intermediate_data = True)
    return updatedStates

# request the available agent options
@app.get("/agent_options/", tags=["agent_options"])
async def returnAgentList():
    return {
        "agents": agent_handles
    }

# request the solution for a challenge from a specified agent
@app.post("/solve/{agent_handle}", tags=["solve"])
async def requestSolution(challenge: ChallengeDTO, agent_handle: str, max_steps: int = 20):
    # check if requested agent exists
    if agent_handle not in agent_handles:
        raise HTTPException(status_code=404, detail="Agent not found")

    if agent_handle in agent_dict.keys():
        # create observation
        obs = OrderedDict()
        obs["current"] = np.array(challenge.current)
        obs["goal"] = np.array(challenge.goal)

        is_alphazero = False
        if "alphazero" in agent_handle.lower():
            is_alphazero = True

        # obtain solution of agent
        solution = solve_challenge(agent_dict[agent_handle], obs, max_steps, is_alphazero)

        #print(solution)

    return solution