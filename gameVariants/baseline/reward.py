def baselineReward(self, inputBoard):
        done = True
        if self.n_steps > self.max_steps:
            return -1, done

        i = 0
        while i < self.height:
            j = 0
            if i%2 == 0:
                j = 1
            while j < self.width - 1:
                if self.goal_board[i][j] == 2 or self.goal_board[i][j+1] == 2:
                    if inputBoard[i][j] != 2 and inputBoard[i][j+1] != 2:
                        done = False
                        break
                j+=2
            if not done:
                break
            i += 1

        reward = 1 if done else 0

        return reward, done