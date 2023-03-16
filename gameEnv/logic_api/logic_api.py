

import sys

from fastapi import FastAPI
from pydantic import BaseModel

sys.path.append('../')
from simulation.simulate import run
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


@app.post("/interpret/")
async def runSimulation(gameBoard: SimulationDTO):
    updatedBoard = run(gameBoard.marble_throw, gameBoard.board)
    return updatedBoard
