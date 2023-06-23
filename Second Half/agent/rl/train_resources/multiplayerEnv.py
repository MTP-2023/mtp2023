from avalancheEnv import GameBoardEnv
rom ray.rllib.env.env_context import EnvContext
from gymnasium.spaces import Discrete, Box, Dict
sys.path.append("../../")
from gameResources.simulation.simulate import run
from baseline.mcts_agent import mcts

class MultiplayerEnv(GameBoardEnv):

    def __init__(self,  config: EnvContext, level = 0, challenge_idx = 0, train = True):
        super.__init__(self, config, level, challenge_idx, train)
        self.observation_space = Dict({
            "current": Box(low=-2, high=2, shape=(self.height, self.width), dtype=int),
            "goal": Box(low=-2, high=2, shape=(self.height, self.width), dtype=int)
        })

    def step(self, action):
        assert action in range(self.n_choices), action

        self.current_board = run(action, self.current_board)
        self.n_steps += 1

        reward, done = self.reward_module.reward(self)

        if done:
            obs = {
                "current": self.current_board,
                "goal": self.goal_board
            }

            # to be changed for actual agent training
            return obs, reward, done, False, {}
        else:
            enemyAction = mcts(self.current_board, self.max_steps, 1, goalstate, width, height, max_steps):

