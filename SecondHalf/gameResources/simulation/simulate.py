import copy

def run(start_col: int, input_board: list, player, return_intermediate_data = False):
    start_col += 1
    if start_col >= len(input_board[0])-1 or start_col < 1:
        print("ILLEGAL MOVE", start_col)
    # format: list of items where [current_row, col_idx] represents a marble rolling down
    active_marbles = [[0, start_col, player]]

    board_states = []
    marble_positions = []
    marbles_dropped = 0

    # update board as long as there are marbles falling down
    while len(active_marbles) > 0:
        # use deepcopy because changing marble representations also caused the status lists to change
        marble_positions.append(copy.deepcopy(active_marbles))
        board_states.append(copy.deepcopy(input_board))

        # update marble "steps" from top to bottom and left to right
        marble_update_queue = sorted(active_marbles, key=lambda element: (element[0], element[1]))

        # iterate over each active (= falling) marble
        for marble in marble_update_queue:
            # get variales for currently updating marble
            row_idx, col_idx, player = marble
            row = input_board[row_idx]

            # check if switch position saves the marble
            if row[col_idx] == 1:
                # save marble in position
                row[col_idx] += 1
                row[col_idx] *= player
                active_marbles.remove(marble)

            # check if marble causes a switch toggle
            elif row[col_idx] == 0:
                # if the column is on the left or right border of the board, don't do anything
                # note: only applies for even columns, as in uneven columns a marble can only fall that way after "bouncing" off another marble and this scenario is handled down below
                if col_idx in [0, len(input_board[0])-1]:
                    pass
                else:
                    # by default, the right value of the array is affected
                    switch_col = col_idx + 1

                    # identify field which is impacted by input
                    # if identified otherwise, set the affected array filed to the left one
                    sum_l = col_idx * 2 - 1
                    if row_idx % 2 == 0:
                        if sum_l % 4 == 3:
                            switch_col = col_idx - 1
                    else:
                        if sum_l % 4 == 1:
                            switch_col = col_idx - 1

                    # update board status
                    row[col_idx] = 1

                    # check if another marble is activated by the switch toggle
                    if row[switch_col] == 2:
                        ## if this is the case, add the active marble to the active marbles list
                        activated_marble = [row_idx, switch_col, 1]
                        active_marbles.append(activated_marble)
                    elif row[switch_col] == -2:
                        ## if this is the case, add the active marble to the active marbles list
                        activated_marble = [row_idx, switch_col, -1]
                        active_marbles.append(activated_marble)

                    # set value of the switch's second part to 0
                    row[switch_col] = 0

                # update marble status
                active_marbles[active_marbles.index(marble)][0] = row_idx + 1

            # check if marble hits another marble
            else: # = row[col_idx] == 2
                new_col = col_idx + 1
                sum_l = col_idx * 2 - 1
                if row_idx % 2 == 0:
                    if sum_l % 4 == 3:
                        new_col = col_idx - 1
                else:
                    if sum_l % 4 == 1:
                        new_col = col_idx - 1

                # add the other marble to active marbles
                if input_board[row_idx][col_idx] == 2:
                    activated_marble = [row_idx, col_idx, 1]
                if input_board[row_idx][col_idx] == -2:
                    activated_marble = [row_idx, col_idx, -1]
                active_marbles.append(activated_marble)

                # update switch status
                row[col_idx] = 0
                row[new_col] = 1

                # update marble position
                active_marbles[active_marbles.index(marble)][0] = row_idx + 1
                active_marbles[active_marbles.index(marble)][1] = new_col

            # remove active marbles if they reach the bottom
            marbles_dropped += len([marble for marble in active_marbles if marble[0] == len(input_board)])
            active_marbles = [marble for marble in active_marbles if marble[0] < len(input_board)]

    # save all intermediate board states
    board_states.append(input_board.copy())

    if return_intermediate_data: 
        return {"boards": board_states, "marbles": marble_positions, "marbles_dropped": marbles_dropped}
    else:
        return board_states[-1]