from fastapi import FastAPI
import sys
sys.path.append('../')

from simulation.simulate import run
from pydantic import BaseModel

app = FastAPI()

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