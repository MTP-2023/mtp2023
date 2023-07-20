import random

import fastapi
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

import sys

sys.path.append('../')
sys.path.append('../../agent/rl')
from lobby.message import MoveMessage
from lobby.message import Message, MessageTypes
from uuid import UUID
from fastapi_sessions.backends.implementations import InMemoryBackend
from simulation.simulate import run
from lobby.lobby import Lobby
from boardGenerator.generate import generate_random_board
from challengeGenerator.generateGoal import generateGoalState
from challengeGenerator.generateChallenges import merge
from collections import OrderedDict
from pydantic import BaseModel
import numpy as np
from agent.rl.apply_policy import return_move, solve_challenge
from ray.rllib.policy.policy import Policy
from uuid import uuid4
from uuid import UUID
from fastapi_sessions.backends.implementations import InMemoryBackend
from fastapi import FastAPI, Response
from fastapi_sessions.frontends.implementations import SessionCookie, CookieParameters
import os
import json
from simulation.simulate import run
from ray.rllib.models import ModelCatalog
import lobby.lobby
from lobby.message import ChallengeMessage, CreateMessage

# initialize agents
agent_handles = [
    # 'SimpleAgent',
    # 'MCTS',
    'PPO',  # checkpoint_gpu_14_675:v2
    'AlphaZero'  # curriculum2Marbles, 100 simulations, complex model
]


class SessionData(BaseModel):
    username: str


backend = InMemoryBackend[UUID, SessionData]()

# register models required for alphazero
from agent.rl.train_resources.azModel import DefaultModel, SimplerModel, ComplexModel

ModelCatalog.register_custom_model("default_alphazero_model", DefaultModel)
ModelCatalog.register_custom_model("simpler_alphazero_model", SimplerModel)
ModelCatalog.register_custom_model("complex_alphazero_model", ComplexModel)

agent_dict = {}

# load policies if possible
for agent_handle in agent_handles:
    artifact_dir = '../../gameResources/trainedAgents/' + agent_handle + '/policies/default_policy'
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
app = FastAPI(title="Logic API for the frontend of the Avalanche marble game", docs_url="/docs",
              openapi_tags=tags_metadata)

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

cookie_params = CookieParameters()

lobbies = {}

# Uses UUID
cookie = SessionCookie(
    cookie_name="cookie",
    identifier="general_verifier",
    auto_error=True,
    secret_key="DONOTUSE",
    cookie_params=cookie_params,
)


class SimulationDTO(BaseModel):
    marble_throw: int
    board: list


class ChallengeDTO(BaseModel):
    current: list
    goal: list


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, data: str):
        for connection in self.active_connections:
            await connection.send_json(data)


manager = ConnectionManager()


@app.websocket("/lobbies/{code}")
async def websocket_endpoint_create(code: int, websocket: WebSocket, player: str):
    # websocket = fastapi.WebSocket("ws://localhost:8000/ws/" + str(code))
    start_board = generate_random_board(3, 2)
    goal1 = generateGoalState(start_board, 3, 3, 12, 42, 3 * 2, False)
    goal2 = generateGoalState(start_board, 3, 3, 12, 42, 3 * 2, False)
    goal_board = merge(goal1, goal2, 3, 2)
    lobby = Lobby(player, start_board, goal_board, code, websocket, "")
    lobbies[code] = lobby
    lobby.messageType = "challenge"
    await manager.connect(websocket)
    await manager.broadcast(json.dumps(lobby.toDict()))
    try:
        while True:
            message: Message = await websocket.receive_json()
            print(message)
            if message["type"] == 2:
                #lobby = lobbies[message.data["code"]]
                #run(message.data["move"], lobby.currentBoard, message.data["player"], False)
                lobby.recentMove = message["data"]["move"]
                lobby.messageType = "move"
                await manager.broadcast(json.dumps(lobby.toDict()))
            elif message.Type == MessageTypes.NEWCHALLENGE:
                lobby = lobbies[message.data["code"]]
                start_board = generate_random_board(lobby.width, lobby.height)
                goal1 = generateGoalState(randomBoard, lobby.minMarbles, lobby.maxMarbles, lobby.turnLimit, 42,
                                          lobby.width * 2, False)
                goal2 = generateGoalState(randomBoard, lobby.minMarbles, lobby.maxMarbles, lobby.turnLimit, 42,
                                          lobby.width * 2, False)
                goal_board = merge(goal1, goal2, lobby.width, lobby.height)
                lobby.currentBoard = start_board
                lobby.goalBoard = goal_board
                await manager.broadcast(lobby)
            elif message.type == MessageTypes.CHANGESETTINGS:
                lobby = lobbies[message.data["code"]]
                lobby.width = message.data["width"]
                lobby.height = message.data["height"]
                lobby.minMarbles = message.data["minMarbles"]
                lobby.maxMarbles = message.data["maxMarbles"]
                lobby.turnLimit = message.data["turnLimit"]
                lobby.availableMarbles = message.data["availableMarbles"]
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        lobby.player2_name = ""
        lobby.player2_wins = 0
        start_board = generate_random_board(lobby.width, lobby.height)
        goal1 = generateGoalState(randomBoard, lobby.minMarbles, lobby.maxMarbles, lobby.turnLimit, 42,
                                  lobby.width * 2, False)
        goal2 = generateGoalState(randomBoard, lobby.minMarbles, lobby.maxMarbles, lobby.turnLimit, 42,
                                  lobby.width * 2, False)
        goal_board = merge(goal1, goal2, lobby.width, lobby.height)
        lobby.currentBoard = start_board
        lobby.goalBoard = goal_board
        await manager.broadcast(lobby)


@app.post("/checkCode", tags=["checkCode"])
async def checkCode(code: int):
    return False

@app.websocket("/lobbies/{code:int}")
async def join(websocket: WebSocket, code: int, name: str):
    if lobbies.keys().__contains__(code):
        lobby = lobbies[code]
        if lobby.isFull:
            return "full"
        else:
            lobby.player2_name = name
            # websocket = lobby.socket
            await manager.connect(websocket)
            try:
                while True:
                    message: Message = await websocket.receive_json()
                    if message.type == MessageTypes.MOVE:
                        #lobby = lobbies[message.data["code"]]
                        #run(message.data["move"], lobby.currentBoard, message.data["player"], False)
                        lobby.recentMove = message.data["move"]
                        await manager.broadcast(lobby)
                    elif message.Type == MessageTypes.NEWCHALLENGE:
                        lobby = lobbies[message.data["code"]]
                        start_board = generate_random_board(lobby.width, lobby.height)
                        goal1 = generateGoalState(randomBoard, lobby.minMarbles, lobby.maxMarbles, lobby.turnLimit, 42,
                                                  lobby.width * 2,
                                                  False)
                        goal2 = generateGoalState(randomBoard, lobby.minMarbles, lobby.maxMarbles, lobby.turnLimit, 42,
                                                  lobby.width * 2,
                                                  False)
                        goal_board = merge(goal1, goal2, lobby.width, lobby.height)
                        lobby.currentBoard = start_board
                        lobby.goalBoard = goal_board
                        await manager.broadcast(lobby)
                    elif message.type == MessageTypes.CHANGESETTINGS:
                        lobby = lobbies[message.data["code"]]
                        lobby.width = message.data["width"]
                        lobby.height = message.data["height"]
                        lobby.minMarbles = message.data["minMarbles"]
                        lobby.maxMarbles = message.data["maxMarbles"]
                        lobby.turnLimit = message.data["turnLimit"]
                        lobby.availableMarbles = message.data["availableMarbles"]
            except WebSocketDisconnect:
                manager.disconnect(websocket)
                lobby.player1_name = ""
                lobby.player1_wins = 0
                start_board = generate_random_board(lobby.width, lobby.height)
                goal1 = generateGoalState(randomBoard, lobby.minMarbles, lobby.maxMarbles, lobby.turnLimit, 42,
                                          lobby.width * 2, False)
                goal2 = generateGoalState(randomBoard, lobby.minMarbles, lobby.maxMarbles, lobby.turnLimit, 42,
                                          lobby.width * 2, False)
                goal_board = merge(goal1, goal2, lobby.width, lobby.height)
                lobby.currentBoard = start_board
                lobby.goalBoard = goal_board
                await manager.broadcast(lobby)
    else:
        return "not found"


# request new random board
@app.get("/randomboard", tags=["randomboard"])
async def randomBoard(width: int = default_width, height: int = default_height):
    return generate_random_board(width, height)


@app.post("/updateSettings", tags="changeSettings")
async def update_settings(width: int = default_width, height: int = default_height,
                          minMarbles: int = 2, maxMarbles: int = 2, turnLimit: int = 10, availableMarbles: int = 100, ):
    return


# get some fixed board
@app.get("/staticboard", tags=["staticboard"])
async def staticBoard():
    return [[0, 0, 1, 1, 0, 1, 0, 0],
            [1, 0, 0, 1, 1, 0, 1, 0],
            [0, 1, 0, 0, 1, 0, 1, 0],
            [1, 0, 1, 0, 1, 0, 0, 1]]


@app.post("/challenge", tags=["challenge"])
async def returnChallenge(mode: str = "singlePlayer", width: int = default_width, height: int = default_height,
                          minMarbles: int = 2, maxMarbles: int = 2, turnLimit: int = 10, availableMarbles: int = 100,
                          fallthrough: bool = False):
    start_board = generate_random_board(width, height)
    if mode == "singlePlayer":
        goal_board = generateGoalState(start_board, minMarbles, maxMarbles, turnLimit, availableMarbles, width * 2,
                                       fallthrough)
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
    updatedStates = run(gameBoard.marble_throw, gameBoard.board, player=1, return_intermediate_data=True)
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

        # print(solution)

    return solution
