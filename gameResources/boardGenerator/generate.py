import random
import itertools

def add_random_switch():
    switch = [0, 0]
    r = random.randint(0,1)
    switch[r] = 1
    return switch

def generate_random_board(switches, row_pairs):
    height = 2 * row_pairs
    board = []
    for i in range(height):
        if i%2 == 0:
            row = []
            row.append(0)
            row += list(itertools.chain(*[add_random_switch() for _ in range(switches)]))
            row.append(0)
           
        else:
            row = list(itertools.chain(*[add_random_switch() for _ in range(switches+1)]))
        
        board.append(row)
   
    return board