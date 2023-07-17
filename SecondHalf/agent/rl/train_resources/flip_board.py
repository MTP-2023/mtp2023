from copy import deepcopy

def flip_board(board):
    flipped_board = deepcopy(board)
    for i in range(len(board)):
        for j in range(len(board[i])):
            if board[i][j]==2:
                flipped_board[i][j]=-2
            elif board[i][j]==-2:
                flipped_board[i][j]=2
    return flipped_board