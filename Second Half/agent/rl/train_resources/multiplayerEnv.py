import sys
sys.path.append("../../")
sys.path.append("../")
from rl.train_resources.avalancheEnv import GameBoardEnv
from ray.rllib.env.env_context import EnvContext
from gymnasium.spaces import Discrete, Box, Dict
from gameResources.simulation.simulate import run
from agent.baseline.mcts import mcts

class MultiplayerEnv(GameBoardEnv):

    def __init__(self,  config: EnvContext, level = 0, challenge_idx = 0, train = True):
        super().__init__(config, level, challenge_idx, train)
        self.observation_space = Dict({
            "current": Box(low=-2, high=2, shape=(self.height, self.width), dtype=int),
            "goal": Box(low=-2, high=2, shape=(self.height, self.width), dtype=int)
        })
        self.current_player = 1

    def step(self, action):
        assert action in range(self.n_choices), action

        self.current_board = run(action, self.current_board, self.current_player)
        self.n_steps += 1

        reward, done = self.reward_module.reward(self)

        if done:
            obs = {
                "current": self.current_board,
                "goal": self.goal_board
            }

            # to be changed for actual agent training
            #print("EPISODE END")
            return obs, reward, done, False, {}
        else:
            self.current_player = -1
            enemyAction = mcts(self.current_board, 100, 1, self.goal_board, self.width-2, self.height, self.max_steps, self.n_steps, self.current_player)
            #print("MCTS ACTION", enemyAction)
            self.current_board = run(enemyAction, self.current_board, self.current_player)

            reward, done = self.reward_module.reward(self)
            self.current_player = 1
            obs = {
                "current": self.current_board,
                "goal": self.goal_board
            }

            # to be changed for actual agent training
            if done:
                print("EPISODE END on MCTS turn")
            return obs, reward, done, False, {}

