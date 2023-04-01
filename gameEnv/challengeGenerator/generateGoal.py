import random
import sys
sys.path.append("../")
from gameEnv.simulation.simulate import run
import copy

# board = start board produced by generator
# marbleCount = marbles that should stay in the board
# turnlimit = how many turns in one game can be played
# availableMarbels = how many marbles are there in total
# width = width of the input space

def generateGoalState(board, marbleCount, turnlimit, availableMarbles, width, fallthrough):
    print("GenerateGoalState")
    while True:
        goalBoard = generateBoard(board, marbleCount, turnlimit, availableMarbles, width, fallthrough)
        if goalBoard is not None:
            break
    print("Generated board!")
    return goalBoard

def generateBoard(board, marbleCount, turnlimit, availableMarbles, width, fallthrough):
    lastValid = None
    #print("trying to generate with maxTurns", maxTurns)
    for i in range(turnlimit):
        move = random.randint(0, width)
        result = run(move, board, True)
        if fallthrough and result["marbles_dropped"] > 0:
            return lastValid
        board = run(move, board, True)["boards"][-1]
    if isValid(board, marbleCount):
         lastValid = copy.deepcopy(board)
    return lastValid

def isValid(board, marbleCount):
    if board is None:
        return False
    count = 0
    for i in range(len(board[0])):
        if board[0][i] > 1:
            return False
    for i in range(len(board)):
        for j in range(len(board[0])):
            if board[i][j] > 1:
                count += 1
    if count is not marbleCount:
        return False
    print("ValidState with " + str(count) + " marbles")
    print(board)
    return True
