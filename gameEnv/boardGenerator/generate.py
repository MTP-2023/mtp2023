import random

def add_random_switch():
    switch = [0, 0]
    r = random.randint(0,1)
    switch[r] = 1
    return switch

def generate_random_board(width, height):
    board = []
    for i in range(height):
        row = []
        if i%2 == 0:
            row.append(0)
            row.append([add_random_switch() for _ in range(width-1)])
            row.append(0)
        else:
            row = [add_random_switch() for _ in range(width)]
        board.append(row)
   
    return board