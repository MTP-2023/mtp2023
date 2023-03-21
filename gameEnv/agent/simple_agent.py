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
        i = 0
        while i < self.height * 2:
            j = 0
            test = 1
            if i % 2 == 0:
                j = 1
                test = 0
            while j < (self.width * 2) + (1 * test):
                if self.endboard[i][j] == 2 or self.endboard[i][j + 1] == 2:
                    goalmarbles += 1

                    if board[i][j] == 2 or board[i][j + 1] == 2:
                        correctmarbles += 1

                j += 2

            i += 1


        winpercentage = correctmarbles / goalmarbles

        dictA = {'correctmarbles': correctmarbles, 'goalmarbles': goalmarbles, 'winpercentage': winpercentage}
        return dictA

    def step(self, board):
        simple = self
        maxreward = 0
        bestmove = 0
        for i in range(self.width * 2):
            result = run(i, copy.deepcopy(board), True)["boards"][-1]
            current = simple.heuristic_simple(result)["correctmarbles"]

            if current > maxreward:
                maxreward = current
                bestmove = i

        return bestmove


if __name__ == "__main__":

    agent = SimpleAgent()
    for i in range(30):
        move = agent.step(agent.startboard)
        run(move, agent.startboard, False)
        if agent.heuristic_simple(agent.startboard)['winpercentage'] == 1.0:
            print(i)
            break

    print(agent.heuristic_simple(agent.startboard)['winpercentage'])
