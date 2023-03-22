

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


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/randomboard")
async def randomBoard(width: int = 4, height: int = 4):
    return generate_random_board(width, height)

@app.get("/staticboard")
async def staticBoard():
    return [[0,0,1,1,0,1,0,0],
        [1,0,0,1,1,0,1,0],
        [0,1,0,0,1,0,1,0],
        [1,0,1,0,1,0,0,1]]

@app.post("/interpret/")
async def runSimulation(gameBoard: SimulationDTO):
    updatedStates = run(gameBoard.marble_throw, gameBoard.board, return_intermediate_data = True)
    return updatedStates
