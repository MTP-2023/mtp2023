

import sys

from fastapi import FastAPI
from pydantic import BaseModel


sys.path.append('../')
from simulation.simulate import run
from boardGenerator.generate import generate_random_board
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SimulationDTO(BaseModel):
    marble_throw: int
    board: list

# request new random board
@app.get("/randomboard")
async def randomBoard(width: int = 4, height: int = 4):
    return generate_random_board(width, height)

# get some fixed board
@app.get("/staticboard")
async def staticBoard():
    return [[0,0,1,1,0,1,0,0],
        [1,0,0,1,1,0,1,0],
        [0,1,0,0,1,0,1,0],
        [1,0,1,0,1,0,0,1]]

# request to simulate a throw, return game board and marble states
@app.post("/interpret/")
async def runSimulation(gameBoard: SimulationDTO):
    updatedStates = run(gameBoard.marble_throw, gameBoard.board, return_intermediate_data = True)
    return updatedStates
