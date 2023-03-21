def baselineReward(self, inputBoard):
    done = True
    if self.n_steps > self.max_steps:
        return -1, done

    i = 0
    while i < self.height:
        j = 0
        if i % 2 == 0:
            j = 1
        while j < self.width - 1:
            if self.goal_board[i][j] == 2 or self.goal_board[i][j + 1] == 2:
                if inputBoard[i][j] != 2 and inputBoard[i][j + 1] != 2:
                    done = False
                    break
            j += 2
        if not done:
            break
        i += 1

    reward = (1 + self.max_steps - self.n_steps) if done else 0

    return reward, done
    #pass

# Note for new baseline reward:
#   ...IN PROGRESS...
#def baseline_general_reward(startboard, endboard, max_steps, height, width):
#    correctmarbles = 0
#    goalmarbles = 0
#    done = True
#   n_steps = 0
#   reward = 0
    # if a marbles is in the same spot as a marble in the goals borad return 0.5

#    i = 0
#    while i < (height * 2):
#        j = 0
#        test = 1
#        if i % 2 == 0:
#            j = 1
#            test = 0
#        while j < (width * 2) + (1 * test):
#            if j < endboard[i][j] == 2 or endboard[i][j + 1] == 2:
#                pass

#    if 1 == 1:
#        reward = 1
#        return reward
#    else if n_steps > max_steps:
#        return -1, done
    # if game is done and needed steps are less then max step return (1 + self.max_steps - self.n_steps)




#return
