import json
import time

import sys

sys.path.append('../../')
sys.path.append("../")
from gameResources.simulation.simulate import run
import copy
import random
from agent.baseline.node import Node
from gameVariants.multiplayer.reward import reward as reward_module


class MCTS_Wrapper:
    def __init__(self, max_steps, n_steps, current_player, height, width, goal_board, current_board, agent_player=1):
        self.max_steps = max_steps
        self.n_steps = n_steps
        self.current_player = current_player
        self.height = height
        self.width = width
        self.goal_board = goal_board
        self.current_board = current_board
        self.agent_player = agent_player


def propagate(node, result):
    # print("TRYING TO PROPAGATE")
    while (node.parent is not None):
        # print("PROPAGATING")
        node.update(result * node.player)
        node = node.parent


def mcts(root_state, max_iterations, exploration_constant, goalstate, width, height, max_steps, n_steps, player):
    # print("WIDTH", width)
    root_node = Node(root_state, player)
    startTime = time.time_ns()
    # while time.time_ns - startTime < maxTime / 1000000000:
    for i in range(max_iterations):
        node = root_node
        state = root_state
        while len(node.children) == width:
            node = node.select_child(exploration_constant)
            state = node.state
        child = createChild(node, width, player)
        result = simulate(copy.deepcopy(child.state), width, height, max_steps, node.depth + n_steps, goalstate, player)
        # print("RESULT", result)
        propagate(child, result[0])
    # print(len(root_node.children))
    # for child in root_node.children:
    # print("child visists", child.visits)
    best_child = max(root_node.children, key=lambda child: child.visits)
    return best_child.move


def createChild(root, width, player):
    # print("CREATING CHILD")
    move = random.randint(0, width - 1)
    while move in root.createdChildren:
        move = random.randint(0, width - 1)
    root.createdChildren.append(move)
    newState = run(move, copy.deepcopy(root.state), player * -1, False)
    child = Node(newState, player, root)
    child.move = move
    child.depth = root.depth + 1
    root.children.append(child)
    return child


def evaluate(max_steps, n_steps, current_player, height, width, goal_board, current_board):
    wrapper = MCTS_Wrapper(max_steps, n_steps, current_player, height, width, goal_board, current_board)
    reward, done = reward_module(wrapper)
    reward *= current_player
    return reward, done


def simulate(state, width, height, max_steps, n_steps, goalstate, current_player):
    # Play out a random game from the given state and return the result
    # For example, if it's a game, make random moves until the game is over and return the winner
    # print("PLAYOUT")
    while not reward_module(MCTS_Wrapper(max_steps, n_steps, current_player, height, width, goalstate, state))[
        1] and n_steps < max_steps:
        current_player *= -1
        run(random.randint(0, width - 1), copy.deepcopy(state), current_player, False)
        n_steps += 1

    result = evaluate(max_steps, n_steps, current_player, height, width, goalstate, state)
    # if result == 1:
    # print("simulated win")
    return result
