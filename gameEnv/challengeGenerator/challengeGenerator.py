import random
from gameEnv.simulation.simulate import run


# board = start board produced by generator
# marbleCount = marbles that should stay in the board
# turnlimit = how many turns in one game can be played
# availableMarbels = how many marbles are there in total
# width = width of the board

def generateGoalStates(board, marbleCount, turnlimit, availableMarbles, width, fallthrough):
    while True:
        board = generateBoard(board, marbleCount, turnlimit, availableMarbles, width, fallthrough)
        if board is not None:
            break

    return board
def generateBoard(board, marbleCount, turnlimit, availableMarbles, width, fallthrough):

    for i in turnlimit:
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
    for i in range(board[0].len):
        if board[0][i] not in range(0, 1):
            return False
    for i in range(board.len):
        for j in range(board[0].len):
            if board[0][i] not in range(0, 1):
                count += 1
    if count is not marbleCount:
        return False
    return True
