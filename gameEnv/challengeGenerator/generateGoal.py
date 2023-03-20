import random
from gameEnv.simulation.simulate import run


# board = start board
# marbleCount = marbles that should stay in the board
# turnlimit = how many turns in one game can be played
# availableMarbels = how many marbles are there in total
# width = width of the input space

def generateGoalState(board, marbleCount, turnlimit, availableMarbles, width, fallthrough):
    while True:
        goalBoard = generateBoard(board, marbleCount, turnlimit, availableMarbles, width, fallthrough)
        if goalBoard is not None:
            break
        print("making new board")

    return goalBoard
def generateBoard(board, marbleCount, turnlimit, availableMarbles, width, fallthrough):
    lastValid = None
    for i in range(turnlimit):
        move = random.randint(0, width)
        result = run(move, board, True)
        if fallthrough and result["marbles_dropped"] > 0:
            return lastValid

        board = run(move, board, True)["boards"][-1]
    if isValid(board, marbleCount):
        lastValid = board

    return lastValid

def isValid(board, marbleCount):
    count = 0
    for i in range(len(board[0])):
        if board[0][i] not in range(0, 1):
            return False
    for i in range(len(board)):
        for j in range(len(board[0])):
            if board[i][j] not in range(0, 1):
                count += 1
    if count is not marbleCount:
        return False
    return True
