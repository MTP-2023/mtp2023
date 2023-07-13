def reward(env):
    """print("CHECKING REWARD")
    print(env.current_board)
    print(env.goal_board)
    print("PLAYER", env.current_player)"""
    player = env.current_player
    agent_player = env.agent_player
    done = True
    if env.n_steps > env.max_steps:
        #print("MAX STEPS")
        if player == 1:
            return 0, done
        if player == -1:
            return 0, done

    i = 0
    while i < env.height:
        j = 0
        if i%2 == 0:
            j = 1
        while j < env.width - 1:
            if env.goal_board[i][j] == 2*player or env.goal_board[i][j+1] == 2*player or env.goal_board[i][j] == 3 or env.goal_board[i][j+1] == 3:
                if env.current_board[i][j] != 2*player and env.current_board[i][j+1] != 2*player:
                    done = False
                    break
            j+=2
        if not done:
            break
        i += 1
        #print("CHECKED FIRST PLAYER", done)

    reward = 0
    if done:
        if player == agent_player:
            reward = 1
    #print("REWARD", reward)

    return reward, done
     

def simple_agent_metrics(self):
    correct_marbles = 0
    goal_marbles = 0
    reward = 0
    i = 0
    while i < self.height * 2:
        j = 0
        test = 1
        if i % 2 == 0:
            j = 1
            test = 0
        while j < (self.width * 2) + (1 * test):
            if self.current_board[i][j] == 2 or self.current_board[i][j + 1] == 2:
                for k in range(i, self.height * 2):
                    if self.goal_board[i][j] == 2 or self.goal_board[i][j + 1] == 2:
                        reward += 0.1
            if self.goal_board[i][j] == 2 or self.goal_board[i][j + 1] == 2:
                goal_marbles += 1

                if self.current_board[i][j] == 2 or self.current_board[i][j + 1] == 2:
                    correct_marbles += 1
                    reward += (i * 2)
                    # reward = baselineReward(self, board)
                # else:
                #    reward -= 0.1

            j += 2

        i += 1

    fulfilled = correct_marbles / goal_marbles

    dictA = {'fulfilled': fulfilled,
             'reward': reward}
    return dictA

# Note for new baseline reward:
#   ...IN PROGRESS...
# def baseline_general_reward(startboard, endboard, max_steps, height, width):
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
# return