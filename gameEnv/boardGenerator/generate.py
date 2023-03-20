import random


def generate_random_board(width,heigth):

    board = []
    for i in range(heigth):
        row = []
        if i%2 == 0:
            row.append(0)
            for j in range(width-1):
                r = random.randint(0,1)
                if r == 0:
                    row.append(0)
                    row.append(1)
                else:
                    row.append(1)
                    row.append(0)
            row.append(0)
        else:
            for j in range(width):
                r = random.randint(0,1)
                if r == 0:
                    row.append(0)
                    row.append(1)
                else:
                    row.append(1)
                    row.append(0)
        board.append(row)
   
    return board
