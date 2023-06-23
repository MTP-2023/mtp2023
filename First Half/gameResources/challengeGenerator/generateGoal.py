import random
import sys
#sys.path.append("../")
sys.path.append("../../../")
from gameResources.simulation.simulate import run
import copy

# board = start board produced by generator
# marbleCount = marbles that should stay in the board
# turnlimit = how many turns in one game can be played
# availableMarbles = how many marbles are there in total
# width = width of the input space
# fallthrough = when true, no marbles are allowed to fall through the board

def generateGoalState(startBoard, minMarbles, maxMarbles, turnlimit, availableMarbles, width, fallthrough):
    #print("WIDTH", width)
    board = copy.deepcopy(startBoard)
    #print("GenerateGoalState", width)
    while True:
        goalBoard = generateBoard(board, minMarbles, maxMarbles, turnlimit, availableMarbles, width, fallthrough)
        if goalBoard is not None:
            break
    #print("Generated board!")
    return goalBoard

def generateBoard(board, minMarbles, maxMarbles, turnlimit, availableMarbles, width, fallthrough):
    lastValid = None
    #print("trying to generate with maxTurns", maxTurns)
    for _ in range(turnlimit):
        move = random.randint(0, width)
        #print("WIDTH", width)
        #print("MOVE", move)
        result = run(move, board, True)
        if fallthrough and result["marbles_dropped"] > 0:
            return lastValid
        board = run(move, board, True)["boards"][-1]
        if isValid(board, minMarbles, maxMarbles):
            lastValid = copy.deepcopy(board)
    return lastValid

def isValid(board, minMarbles, maxMarbles):
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
    if count > maxMarbles or count < minMarbles:
        return False
    #print("ValidState with " + str(count) + " marbles")
    #print(board)
    return True
