import random
import sys
sys.path.append('../')
from gameEnv.simulation.simulate import run

def generateGoalStatesWithFallthrough(board, marbleCount, turnlimit, availableMarbles, width):
    while True:
        board = generateBoard(board, marbleCount, turnlimit, availableMarbles, width)
        if board is not None:
            break

    return board

def generateBoard(board, marbleCount, turnlimit, availableMarbles, width):
    lastValid = board
    for i in range(turnlimit):
        move = random.randint(0, width)
        board = run(move, board, False)
        if isValid(board, marbleCount):
            lastValid = board

    return lastValid

def isValid(board, marbleCount):
    count = 0
    for i in range(len(board[0])):
        if board[0][i] not in range(0, 1):
            return False
    for i in range(len(board)):
        for j in range(board[0].length):
            if board[0][i] not in range(0, 1):
                count += 1
    if count is not marbleCount:
        return False
    return True

start_board = [[0,1,0,0,1,1,0,0],
            [0,1,0,1,1,0,0,1],
            [0,1,0,1,0,1,0,0],
            [1,0,1,0,1,0,1,0]]


goal_board = generateGoalStatesWithFallthrough(start_board, 3, 4, 0, 6)
print(goal_board)