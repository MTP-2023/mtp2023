def baselineReward(n_steps, max_steps, height, width, goal_board, inputBoard):
        done = True
        if n_steps > max_steps:
            return -1, done

        i = 0
        while i < height:
            j = 0
            if i%2 == 0:
                j = 1
            while j < width - 1:
                if goal_board[i][j] == 2 or goal_board[i][j+1] == 2:
                    if inputBoard[i][j] != 2 and inputBoard[i][j+1] != 2:
                        done = False
                        break
                j+=2
            if not done:
                break
            i += 1

        reward = (1 + max_steps - n_steps) if done else 0

        return reward, done