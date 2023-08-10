from ray.rllib.models import ModelCatalog
from copy import deepcopy
from agent.rl.train_resources.multiplayerEnv import SingleChallengeTestEnvMultiplayer

class ShallowEnv:
    def __init__(self, current_board, goal_board, n_steps, max_steps, width, height, player):
        self.current_board = current_board
        self.goal_board = goal_board
        self.n_steps = n_steps
        self.max_steps = max_steps
        self.width = width
        self.height = height
        self.variant = "multiplayer"
        self.current_player = player
        self.agent_player = 1

def return_move(agent, shallowEnv, obs):
    # create "empty" env to obtain preprocessor
    preprocessor = ModelCatalog.get_preprocessor(SingleChallengeTestEnvMultiplayer(shallowEnv))

    # flatten obs and query results
    flat_obs = preprocessor.transform(obs)
    move = agent.compute_single_action(flat_obs)
    return move[0]

def flip_board(board):
    flipped_board = deepcopy(board)
    for i in range(len(board)):
        for j in range(len(board[i])):
            if board[i][j]==2:
                board[i][j]=-2
            elif board[i][j]==-2:
                board[i][j]=2
    return flipped_board

def check_win(current_board, goal_board, current_player, max_steps, n_steps, width, height):
    res = {}
    if n_steps > max_steps:
        print("MAX STEPS")
        if current_player == 1:
            return -1, True
        if current_player == -1:
            return 1, True

    player = 1
    i = 0
    done = True
    while i < height:
        j = 0
        if i % 2 == 0:
            j = 1
        while j < width - 1:
            if goal_board[i][j] == 2 * player or goal_board[i][j + 1] == 2 * player or goal_board[i][
                j] == 3 or goal_board[i][j + 1] == 3:
                if current_board[i][j] != 2 * player and current_board[i][j + 1] != 2 * player:
                    done = False
                    break
            j += 2
        if not done:
            break
        i += 1
    if done:
        return 1, done

    player = -1
    i = 0
    done = True
    while i < height:
        j = 0
        if i % 2 == 0:
            j = 1
        while j < width - 1:
            if goal_board[i][j] == 2 * player or goal_board[i][j + 1] == 2 * player or goal_board[i][
                j] == 3 or goal_board[i][j + 1] == 3:
                if current_board[i][j] != 2 * player and current_board[i][j + 1] != 2 * player:
                    done = False
                    break
            j += 2
        if not done:
            break
        i += 1
    if done:
        return -1, done

    return 0, False