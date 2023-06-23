import json
import time

import sys
sys.path.append('../../')
from gameResources.simulation.simulate import run
import copy
import random
import math


class Node:
    def __init__(self, state, player, parent=None):
        self.player = player
        self.state = state
        self.parent = parent
        self.children = []
        self.visits = 0
        self.wins = 0
        self.move = 0
        self.createdChildren = []
        self.depth = 0

    def select_child(self, exploration_constant):
        log_total = math.log(sum(child.visits for child in self.children))
        best_child = None
        best_score = float('-inf')
        for child in self.children:
            exploit = child.wins / child.visits
            explore = exploration_constant * math.sqrt(log_total / child.visits)
            score = exploit + explore
            if score > best_score:
                best_child = child
                best_score = score
        return best_child

    def expand(self, state):
        child = Node(state, self.player * -1,parent=self)
        child.depth = self.depth + 1
        self.children.append(child)

        return child

    def update(self, result):
        self.visits += 1
        self.wins += result





if __name__ == "__main__":

    with open('../../gameVariants/baseline/training/curriculum2MarblesTest.json') as json_file:
        data = json.load(json_file)
    height = data['height'] * 2
    width = data['width'] * 2
    totalwins = 0
    levelnumber = 0
    for level in data['training_levels']:
        startboards = []
        endboards = []
        max_steps = []


        for i in range(len(level)):
            startboards.append(level[i]['start_board'])
            endboards.append(level[i]['goal_board'])
            max_steps.append(level[i]['max_turns'])

        startboard = 0
        endboard = 0
        max_step = 0

        levelwins = 0
        for j in range(len(startboards)):
            startboard = startboards[j]
            endboard = endboards[j]
            max_step = max_steps[j]
            for i in range(max_step):
                # move = mcts(copy.deepcopy(startboard), 1000, math.sqrt(2), endboard, width, height, max_step - i)
                move = mcts(copy.deepcopy(startboard), 300, 1, endboard, width, height, max_step, i)
                # print("making move", move)
                run(move, startboard, player, False)
                if evaluate(startboard, endboard):
                    #print("Solved in ", i, "steps")
                    totalwins += 1
                    levelwins += 1
                    break
            #print("finished challenge", j)
        print("level", levelnumber, ": ", levelwins, "out of", len(level), "=", levelwins/len(level)*100, "%")
        levelnumber += 1
    print('totalwins ', totalwins, 'out of', (j + 1)*len(data['training_levels']))
    percent = totalwins / ((j + 1)*len(data['training_levels']))*100
    print('percent', percent)
