import random
from gameEnv.simulation.simulate import run


# board = start board
# marbleCount = marbles that should stay in the board
# turnlimit = how many turns in one game can be played
# availableMarbels = how many marbles are there in total
# width = width of the board

def generateGoalStatesWithFallthrough(board, marbleCount, turnlimit, availableMarbles, width):
    while True:
        board = generateBoard(board, marbleCount, turnlimit, availableMarbles, width)
        if board is not None:
            break

    return board


def generateBoard(board, marbleCount, turnlimit, availableMarbles, width):
    for i in turnlimit:
        move = random.randint(0, width)
        board = run(move, board, False)
        if isValid(board, marbleCount):
            lastValid = board

    return lastValid


def isValid(board, marbleCount):
    count = 0
    for i in board[0].length:
        if board[0][i] not in range(0, 1):
            return False
    for i in board.length:
        for j in board[0].length:
            if board[0][i] not in range(0, 1):
                count += 1
    if count is not marbleCount:
        return False
    return True
