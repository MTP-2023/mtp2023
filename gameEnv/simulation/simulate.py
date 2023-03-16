def run(start_col: int, input_board: list):  
    start_col += 1 
    # format: list of items where [current_row, col_idx] of a marble rolling down
    active_marbles = [[0, start_col]]

    while len(active_marbles) > 0:
        print(active_marbles)
        marble_update_queue = sorted(active_marbles, key=lambda element: (element[0], element[1]))
        #print(marble_update_queue)
        # iterate over each active (= falling) marble
        for marble in marble_update_queue:
            # get variales for currently updating marble
            row_idx, col_idx = marble
            row = input_board[row_idx]

            # check if switch position saves the marble
            if row[col_idx]  == 1:
                # save marble in position
                row[col_idx] += 1
                active_marbles.remove(marble)

            # check if marble causes a switch toggle
            elif row[col_idx] == 0:
                switch_col = col_idx + 1
                # identify field which is impacted by input
                if row_idx % 2 == 0:
                    sum_l = col_idx * 2 - 1
                    if sum_l % 4 == 3:
                        switch_col = col_idx - 1
                else:
                    sum_l = col_idx * 2 - 1
                    if sum_l % 4 == 1:
                        switch_col = col_idx - 1
                # update board status
                row[col_idx] = 1

                # check if another marble is activated by the switch toggle
                if row[switch_col] == 2:
                    activated_marble = [row_idx, switch_col]
                    active_marbles.append(activated_marble)

                # set value of the switch's second part to 0
                row[switch_col] = 0

                # update marble status
                active_marbles[active_marbles.index(marble)][0] = row_idx + 1

            # check if marble hits another marble
            else: # = row[col_idx] == 2
                new_col = col_idx + 1
                if row_idx % 2 == 0:
                    sum_l = col_idx*2 - 1
                    if sum_l % 4 == 3:
                        new_col = col_idx - 1
                else:
                    sum_l = col_idx * 2 - 1
                    if sum_l % 4 == 1:
                        new_col = col_idx - 1

                # add the other marble to active marbles
                activated_marble = [row_idx, col_idx]
                active_marbles.append(activated_marble)

                # update switch status
                row[col_idx] = 0
                row[new_col] = 1

                # update marble position
                active_marbles[active_marbles.index(marble)] = [row_idx + 1, new_col]

            # remove active marbles if they reach the bottom
            active_marbles = [marble for marble in active_marbles if marble[0] < len(input_board)]
            # check if marble should be added to available marbles
            #if self.refill:
                #self.marbles_left += 1

    return input_board