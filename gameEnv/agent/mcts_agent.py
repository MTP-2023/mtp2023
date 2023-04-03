import json
import time

from gameEnv.simulation.simulate import run
import copy
import random
import math


class Node:
    def __init__(self, state, parent=None):
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
        child = Node(state, parent=self)
        child.depth = self.depth + 1
        self.children.append(child)

        return child

    def update(self, result):
        self.visits += 1
        self.wins += result


def propagate(node, result):
    while (node.parent):
        node.update(result)
        node = node.parent


def mcts(root_state, max_iterations, exploration_constant, goalstate, width, height, max_steps):
    root_node = Node(root_state)
    startTime = time.time_ns()
    # while time.time_ns - startTime < maxTime / 1000000000:
    for i in range(max_iterations):
        node = root_node
        state = root_state
        while len(node.children) == width:
            node = node.select_child(exploration_constant)
            state = node.state
        if evaluate(node.state, goalstate) == 1:
            # print("found a winner")
            propagate(node, 100)
            continue
        child = createChild(node)
        result = simulate(copy.deepcopy(child.state), width, height, max_steps, node.depth, goalstate)
        propagate(child, result)
    # print(len(root_node.children))
    # for child in root_node.children:
    # print("child visists", child.visits)
    best_child = max(root_node.children, key=lambda child: child.visits)
    return best_child.move


def createChild(root):
    move = random.randint(0, width)
    while move in root.createdChildren:
        move = random.randint(0, width)
    root.createdChildren.append(move)
    newState = run(move, copy.deepcopy(root.state), False)
    child = Node(newState, root)
    child.move = move
    child.depth = root.depth + 1
    root.children.append(child)
    return child


def simulate(state, width, height, max_steps, i, goalstate):
    # Play out a random game from the given state and return the result
    # For example, if it's a game, make random moves until the game is over and return the winner
    while not is_terminal(state, width, height, goalstate, i + 1, max_steps) and i < max_steps:
        run(random.randint(0, width), copy.deepcopy(state), False)
        i += 1

    result = evaluate(state, goalstate)
    # if result == 1:
    # print("simulated win")
    return result


def is_terminal(state, width, height, goal_board, stepsTaken, maxSteps):
    # Return True if the given state is terminal (i.e., the game is over), False otherwise
    done = True
    # print(stepsTaken)
    # print(maxSteps)
    if stepsTaken == maxSteps:
        return True

    i = 0
    # print(state)
    while i < height:
        j = 0
        test = 1
        if i % 2 == 0:
            j = 1
            test = 0
        while j < width + (2 * test):
            if goal_board[i][j] == 2 or goal_board[i][j + 1] == 2:
                if state[i][j] != 2 and state[i][j + 1] != 2:
                    done = False
                    break
            j += 2
        if not done:
            break
        i += 1
    return done


def evaluate(state, goal_board):
    # Evaluate the given state and return a score between 0 and 1 that represents the player's chance of winning
    i = 0
    requiredMarbles = 0
    correctMarbles = 0
    done = True
    while i < height:
        j = 0
        test = 1
        if i % 2 == 0:
            j = 1
            test = 0
        while j < width + (1 * test):
            if goal_board[i][j] == 2 or goal_board[i][j + 1] == 2:
                requiredMarbles += 1
                if state[i][j] != 2 and state[i][j + 1] != 2:
                    done = False
                    break
                else:
                    correctMarbles += 1
            j += 2
        if not done:
            break
        i += 1
    # result = correctMarbles / requiredMarbles
    # return result
    return 1 if done else 0


def generate_child_state(state, width):
    # Generate a child state by making a random move from the given state
    # Return None if there are no legal moves

    return run(random.randint(0, width), copy.deepcopy(state), False)


if __name__ == "__main__":
    with open('../../gameVariants/baseline/training/generationTest.json') as json_file:
        data = json.load(json_file)
    arraydata = data['training_states']
    startboards = []
    endboards = []
    max_steps = []
    height = data['height'] * 2
    width = data['width'] * 2

    for i in range(len(arraydata)):
        startboards.append(arraydata[i]['start_board'])
        endboards.append(arraydata[i]['goal_board'])
        max_steps.append(arraydata[i]['max_turns'])

    startboard = 0
    endboard = 0
    max_step = 0

    totalwins = 0
    for j in range(len(startboards)):
        startboard = startboards[j]
        endboard = endboards[j]
        max_step = max_steps[j]
        for i in range(max_step):
            # move = mcts(copy.deepcopy(startboard), 1000, math.sqrt(2), endboard, width, height, max_step - i)
            move = mcts(copy.deepcopy(startboard), 1000, 1, endboard, width, height, max_step - i)
            # print("making move", move)
            run(move, startboard, False)
            if evaluate(startboard, endboard):
                print("Solved in ", i, "steps")
                totalwins += 1
                break
        print("finished challenge", j)
    print('totalwins ', totalwins, 'out of', j + 1)
    percent = totalwins / (j + 1)
    print('percent', percent)
