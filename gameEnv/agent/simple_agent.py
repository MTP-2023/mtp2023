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

    def heuristic_simple(self, board):
        correctmarbles = 0
        goalmarbles = 0
        winpercentage = 0.0
        i = 0
        while i < self.height:
            j = 0
            if i % 2 == 0:
                j = 1
                while j < self.width - 1:
                    if self.endboard[i][j] == 2 or self.endboard[i][j + 1] == 2:
                        goalmarbles += 1
                        if self.startboard[i][j] == 2 or self.startboard[i][j + 1] == 2:
                            correctmarbles += 1

                    j += 2

            i += 1

        winpercentage = correctmarbles / goalmarbles

        dictA = {'correctmarbles': correctmarbles, 'goalmarbles': goalmarbles, 'winpercentage': winpercentage}
        return dictA

    def step(self, board):
        maxreward = 0
        bestmove = 0
        for i in range(self.width * 2):
            result = run(i, copy.deepcopy(board), True)
            current = self.heuristic_simple(self, result)["correctmarbles"]

            if current > maxreward:
                maxreward = current
                bestmove = i

        return bestmove

    if __name__ == "__main__":

        pass
