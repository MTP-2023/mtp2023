def print_board(board):
    height = len(board)
    width = len(board[0])
    str_board = "   |"
    for j in range(1, width-1):
        if j % 2 != 0:
            str_board += str(j)+" |"
        else:
            str_board += str(j)+"|"
    str_board += "\n"
    for i in range(height):
        if i % 2 == 0:
            j = 1
            line = "   |"
        else:
            line = "|"
            j = 0
        while j < width-1:
            if board[i][j] != 0:
                if board[i][j] == 1:
                    line+= "__  |"
                elif board[i][j] == 2:
                    line += "rr  |"
                elif board[i][j] == -2:
                    line += "bb  |"
                elif board[i][j] == 3:
                    line += "OO  |"
            else:
                if board[i][j+1] == 1:
                    line += "  __|"
                elif board[i][j+1] == 2:
                    line += "  rr|"
                elif board[i][j+1] == -2:
                    line += "  bb|"
                elif board[i][j+1] == 3:
                    line += "  OO|"
            j+=2
        line += "\n"
        if i % 2 == 0:
            j = 1
            line += "   |"
        else:
            line += "|"
            j = 0
        while j < width - 1:
            if board[i][j] != 0:
                line += " \\  |"
            else:
                line += "  / |"
            j+=2
        line += "\n"
        str_board += line
    print(str_board)

print_board([[0,1,0,1,0,1,0,0],[0,2,1,0,1,0,2,0],[0,0,-2,1,0,-2,0,0],[0,1,1,0,0,1,1,0]])


