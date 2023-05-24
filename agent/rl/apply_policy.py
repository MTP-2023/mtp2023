from train_resources.avalancheEnv import SingleChallengeTestEnv
from train_resources.envWrapperAlphaZero import WrappedGameBoardEnv
from ray.rllib.models import ModelCatalog
from gameResources.simulation.simulate import run
from gameVariants.baseline.reward import reward

from ray.rllib.evaluation.episode import Episode
from ray.rllib.policy.policy_map import PolicyMap
from ray.rllib.policy.sample_batch import DEFAULT_POLICY_ID

# object representing the envronment that can be used for simulting steps without having an actual env
class ShallowEnv:
    def __init__(self, current_board, goal_board, n_steps, max_steps, width, height):
        self.current_board = current_board
        self.goal_board = goal_board
        self.n_steps = n_steps
        self.max_steps = max_steps
        self.width = width
        self.height = height
        self.variant = "baseline"

def return_move(agent, shallowEnv, obs, az):
    if not az:
        # create "empty" env to obtain preprocessor
        preprocessor = ModelCatalog.get_preprocessor(SingleChallengeTestEnv(shallowEnv))

        # flatten obs and query results
        flat_obs = preprocessor.transform(obs)
        move = agent.compute_single_action(flat_obs)
    else:
        # alphazero stuff
        # create "empty" env to obtain preprocessor
        env = WrappedGameBoardEnv({}, shallowEnv)
        agent.env = env
        preprocessor = ModelCatalog.get_preprocessor(SingleChallengeTestEnv(shallowEnv))

        # flatten obs and query results
        flat_obs = preprocessor.transform(obs)

        dummy_episode = Episode(
            PolicyMap(),
            lambda _, __: DEFAULT_POLICY_ID,
            lambda: None,
            lambda _: None,
            0,
        )

        dummy_episode.user_data['initial_state'] = agent.env.get_state()

        move = agent.compute_single_action(flat_obs, episode=dummy_episode)

    # returns action
    return move[0]

# solve a challenge with a given limit of maximum steps
def solve_challenge(agent, obs, max_steps, az = False):
    action_sequence = []
    current_board = obs["current"]
    solved = False
    for n_steps in range(max_steps):
        # update obs
        obs["current"] = current_board
        # calculate next action
        paramEnv = ShallowEnv(current_board, obs["goal"], n_steps, max_steps, len(current_board[0]), len(current_board))
        action = return_move(agent, paramEnv, obs, az)
        action_sequence.append(int(action))
        # simulate game
        current_board = run(action, current_board)
        solveEnv = ShallowEnv(current_board, obs["goal"], n_steps+1, max_steps, len(current_board[0]), len(current_board))
        # determine if goal is fulfilled
        _, done = reward(solveEnv)
        if done: 
            solved = True
            print("ACTIONS", action_sequence)
            break

    # return results dict
    return {
        "action_sequence": action_sequence,
        "actions_required": len(action_sequence),
        "solved": solved
    }