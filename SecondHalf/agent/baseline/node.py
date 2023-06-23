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
        #print("CHILDREN")
        #for child in self.children:
        #    print(child.visits)
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

