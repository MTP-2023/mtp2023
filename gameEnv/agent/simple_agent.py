import json
from gameEnv.simulation.simulate import run
import copy

class SimpleAgent:

    def __init__(self):
        with open('../challengeGenerator/challenges1.json') as json_file:
            data = json.load(json_file)

        self.startboard = data['start']
        self.endboard = data['goal']
        self.height = data['height']
        self.width = data['width']


    def heuristic(self, board):
        pass
    def step(self, board):

        for i in range(self.width*2):
            result = run(i, copy.deepcopy(board), True)
            #heuristic(self,result)


        pass


    if __name__ == "__main__":
        pass
    