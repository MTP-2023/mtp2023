from agent.rl.train_resources.avalancheEnv import GameBoardEnv
from ray.rllib.models import ModelCatalog
from ray.rllib.policy.policy import Policy

def return_move(artifact_dir, obs):
    # load policy
    #agent = Policy.from_checkpoint(artifact_dir)

    # create "empty" env to obtain preprocessor
    preprocessor = ModelCatalog.get_preprocessor(GameBoardEnv(config={}, example_board=obs["current"]))

    # flatten obs and query results
    flat_obs = preprocessor.transform(obs)
    move = agent.compute_single_action(flat_obs)

    # returns action
    return move[0]