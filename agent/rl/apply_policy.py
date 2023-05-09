from train_resources.avalancheEnv import GameBoardEnv
from ray.rllib.models import ModelCatalog

def return_move(agent, obs):
    # create "empty" env to obtain preprocessor
    preprocessor = ModelCatalog.get_preprocessor(GameBoardEnv(config={}, example_board=obs["current"]))

    # flatten obs and query results
    flat_obs = preprocessor.transform(obs)
    move = agent.compute_single_action(flat_obs)

    # returns action
    return move[0]