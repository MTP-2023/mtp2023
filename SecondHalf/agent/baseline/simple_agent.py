import json
import copy

import sys
from SecondHalf.gameResources.simulation.simulate import run


def get_move(width, height, current_board, goal_board, player):
    maxreward = 0
    bestmove = 0
    for i in range(width * 2):
        next_board = run(i, copy.deepcopy(current_board), False)
        current = simple_agent_metrics_multiplayer(width, height, next_board, goal_board, player)["reward"]

        # maxreward = baselineReward(self, board)
        if current > maxreward:
            maxreward = current
            bestmove = i

    return bestmove


def simple_agent_metrics_multiplayer(width, height, current_board, goal_board, player):
    correct_marbles = 0
    goal_marbles = 0
    reward = 0
    i = 0
    target = 2 * player
    while i < height * 2:
        j = 0
        test = 1
        if i % 2 == 0:
            j = 1
            test = 0
        while j < (width * 2) + (1 * test):
            if current_board[i][j] == target or current_board[i][j + 1] == target \
                    or current_board[i][j] == 3 or current_board[i][j + 1] == 3:
                for k in range(i, height * 2):
                    if goal_board[i][j] == 2 or goal_board[i][j + 1] == 2:
                        reward += 0.1
            if goal_board[i][j] == target or goal_board[i][j + 1] == target \
                    or current_board[i][j] == 3 or current_board[i][j + 1] == 3:
                goal_marbles += 1

                if current_board[i][j] == target or current_board[i][j + 1] == target \
                        or current_board[i][j] == 3 or current_board[i][j + 1] == 3:
                    correct_marbles += 1
                    reward += (i * 2)
                    # reward = baselineReward(self, board)
                # else:
                #    reward -= 0.1

            j += 2

        i += 1

    #fulfilled = correct_marbles / goal_marbles
    fulfilled = 0
    dictA = {'fulfilled': fulfilled,
             'reward': reward}
    return dictA


class SimpleAgent:

    def __init__(self, level):
        with open('../../gameVariants/baseline/training/curriculumVer2Test.json') as json_file:
            data = json.load(json_file)
            arraydata = data['training_levels'][level]
        self.start_boards = []
        self.goal_boards = []
        self.max_steps = []
        self.height = data['height']
        self.width = data['width']

        for i in range(len(arraydata)):
            self.start_boards.append(arraydata[i]['start_board'])
            self.goal_boards.append(arraydata[i]['goal_board'])
            self.max_steps.append(arraydata[i]['max_turns'])

        self.current_board = 0
        self.goal_board = 0
        self.max_step = 0

    def heuristic_simple(self, board, target):
        correctmarbles = 0
        goalmarbles = 0
        reward = 0
        i = 0
        while i < self.height * 2:
            j = 0
            test = 1
            if i % 2 == 0:
                j = 1
                test = 0
            while j < (self.width * 2) + (1 * test):
                if board[i][j] == 2 or board[i][j + 1] == 2:
                    for k in range(i, self.height * 2):
                        if self.endboard[i][j] == 2 or self.endboard[i][j + 1] == 2:
                            reward += 0.1
                if self.endboard[i][j] == 2 or self.endboard[i][j + 1] == 2:
                    goalmarbles += 1

                    if board[i][j] == 2 or board[i][j + 1] == 2:
                        correctmarbles += 1
                        reward += (i * 2)
                        # reward = baselineReward(self, board)
                    else:
                        reward -= 0.1

                j += 2

            i += 1

        winpercentage = correctmarbles / goalmarbles

        dictA = {'correctmarbles': correctmarbles, 'goalmarbles': goalmarbles, 'winpercentage': winpercentage,
                 'reward': reward}
        return dictA

    def simple_agent_metrics(self, target):
        correct_marbles = 0
        goal_marbles = 0
        reward = 0
        i = 0
        while i < self.height * 2:
            j = 0
            test = 1
            if i % 2 == 0:
                j = 1
                test = 0
            while j < (self.width * 2) + (1 * test):
                if self.current_board[i][j] == target or self.current_board[i][j + 1] == target \
                        or self.current_board[i][j] == 3 or self.current_board[i][j + 1] == 3:
                    for k in range(i, self.height * 2):
                        if self.goal_board[i][j] == 2 or self.goal_board[i][j + 1] == 2:
                            reward += 0.1
                if self.goal_board[i][j] == target or self.goal_board[i][j + 1] == target \
                        or self.current_board[i][j] == 3 or self.current_board[i][j + 1] == 3:
                    goal_marbles += 1

                    if self.current_board[i][j] == target or self.current_board[i][j + 1] == target \
                            or self.current_board[i][j] == 3 or self.current_board[i][j + 1] == 3:
                        correct_marbles += 1
                        reward += (i * 2)
                        # reward = baselineReward(self, board)
                    # else:
                    #    reward -= 0.1

                j += 2

            i += 1

        fulfilled = correct_marbles / goal_marbles

        dictA = {'fulfilled': fulfilled,
                 'reward': reward}
        return dictA

    def step(self, board, player):
        target = 2 * player
        maxreward = 0
        bestmove = 0
        for i in range(self.width * 2):
            self.current_board = run(i, copy.deepcopy(board), True)["boards"][-1]
            # print('result ', result)
            # current = simple.heuristic_simple(result)["reward"]
            current = self.simple_agent_metrics(target)["reward"]
            # print('current', current)

            # maxreward = baselineReward(self, board)
            if current > maxreward:
                maxreward = current
                bestmove = i

        return bestmove


if __name__ == "__main__":
    totalwins = 0
    for k in range(7):
        agent = SimpleAgent(k)
        levelwins = 0
        for j in range(len(agent.start_boards)):
            agent.current_board = agent.start_boards[j]
            agent.goal_board = agent.goal_boards[j]
            agent.max_step = agent.max_steps[j]
            for i in range(agent.max_step):
                # agent.max_step
                move = agent.step(agent.current_board)
                run(move, agent.current_board, False)
                # if agent.heuristic_simple(agent.startboard)['winpercentage'] == 1.0:
                if agent.simple_agent_metrics(agent)['fulfilled'] == 1.0:
                    # print(i, " steps")
                    totalwins += 1
                    levelwins += 1
                    break

            # print(agent.heuristic_simple(agent.startboard)['winpercentage'])
            # print(simple_agent_metrics(agent)['fulfilled'])
        print("level", k, ": ", levelwins, "out of 500")
        print("percentage", levelwins / 500)
    print('totalwins ', totalwins, 'out of', j + 1)
    percent = totalwins / 3500
    print('percent', percent)
