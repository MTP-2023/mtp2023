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