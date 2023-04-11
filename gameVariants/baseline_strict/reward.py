def reward(env):
        done = True 

        if env.n_steps > env.max_steps:
            return -1, done
        
        for i, row in enumerate(env.goal_board):
            for j, item in enumerate(row):
                if item == 2 and env.current_board[i][j] != 2:
                     done = False
                     break
            if not done:
                 break

        reward = (1 + env.max_steps - env.n_steps) if done else 0

        return reward, done