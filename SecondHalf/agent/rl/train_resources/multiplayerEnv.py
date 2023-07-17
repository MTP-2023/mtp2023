import random
import sys
sys.path.append("../../")
sys.path.append("../")
from rl.train_resources.avalancheEnv import GameBoardEnv, SingleChallengeTestEnv
from agent.rl.train_resources.flip_board import flip_board
from ray.rllib.env.env_context import EnvContext
from gymnasium.spaces import Discrete, Box, Dict
from gameResources.simulation.simulate import run
from agent.baseline.mcts import mcts
from copy import deepcopy
import numpy as np

class MultiplayerEnv(GameBoardEnv):

    def __init__(self,  config: EnvContext, level = 0, challenge_idx = 0, train = True):
        super().__init__(config, level, challenge_idx, train)
        self.observation_space = Dict({
            "current": Box(low=-2, high=2, shape=(self.height, self.width), dtype=int),
            "goal": Box(low=-2, high=3, shape=(self.height, self.width), dtype=int)
        })
        self.current_player = 1
        self.agent_player = config.get("agent_player", 1)
        self.vs = config.get("vs", "random")
        self.mcts_depth = config.get("mcts_depth", 100)
        self.challenge_side = 0

    def getEnemyAction(self):
        if self.vs == "mcts":
            enemyAction = mcts(deepcopy(self.current_board), self.mcts_depth, 1, self.goal_board, self.width - 2, self.height,
                               self.max_steps, self.n_steps, self.current_player)
        else:
            enemyAction = random.randint(0, self.n_choices - 1)
        return enemyAction

    def step(self, action):
        assert action in range(self.n_choices), action

        #print("STEP", self.n_steps)
        #print(self.current_board)
        #if self.n_steps == 0:
        #    print("GOAL\n", self.goal_board)
        #print("ACTION", action)

        #check if last move of other player won the game for current player
        reward, done = self.reward_module.reward(self)

        if not done:
            self.current_board = run(action, self.current_board, self.current_player)
            #print(self.current_board)
            self.n_steps += 1

            reward, done = self.reward_module.reward(self)

        if done:
            obs = {
                "current": self.current_board,
                "goal": self.goal_board
            }

            """print("DONE ON AGENT TURN")
            print(self.n_steps)
            print(self.current_board)
            print(self.goal_board)
            print(reward)"""
            return obs, reward, done, False, {}
        else:
            self.current_player *= -1
            reward, done = self.reward_module.reward(self)
            if not done:
                enemyAction = self.getEnemyAction()
                #print("ENEMY ACTION", enemyAction)
                self.current_board = run(enemyAction, self.current_board, self.current_player)
                #print("ENEMY ACTION", enemyAction)
                #print(self.current_board)

                reward, done = self.reward_module.reward(self)
            self.current_player *= -1
            obs = {
                "current": self.current_board,
                "goal": self.goal_board
            }

            if done:
                """print("DONE ON ENEMY TURN")
                print(self.n_steps)
                print(self.current_board)
                print(self.goal_board)
                print(reward)"""
            return obs, reward, done, False, {}

    def reset(self, *, seed=None, options=None):
        # print("reset")
        # random.seed(seed)
        # self.cur_pos = 0
        # return [self.cur_pos], {}

        self.n_steps = 0
        self.current_player = 1

        if self.challenge_side == 1:
            self.challenge_side = 0
            self.agent_player = 1
            # iterate over challenges
            # if not self.online:
            if self.training_index < len(self.training_states) - 1:
                self.training_index += 1
            else:
                # print("RESET: All challenges played.")
                self.training_index = 0
            self.current_board = np.array(self.training_states[self.training_index]["start_board"])
            self.goal_board = np.array(self.training_states[self.training_index]["goal_board"])
            self.max_steps = self.training_states[self.training_index]["max_turns"]

        elif self.challenge_side == 0:
            self.challenge_side = 1
            self.agent_player = -1
            self.current_board = np.array(flip_board(self.training_states[self.training_index]["start_board"]))
            self.goal_board = np.array(flip_board(self.training_states[self.training_index]["goal_board"]))

            # reset env to next challenge


        if self.agent_player == -1:
            enemyAction = self.getEnemyAction()
            self.current_board = run(enemyAction, self.current_board, self.current_player)
            self.current_player *= -1

        obs = {
            "current": self.current_board,
            "goal": self.goal_board
        }

        return obs, {}

class SingleChallengeTestEnvMultiplayer(SingleChallengeTestEnv):
    def __init__(self, shallowEnv):
        super().__init__(shallowEnv)
        self.observation_space = Dict({
            "current": Box(low=-2, high=2, shape=(self.height, self.width), dtype=int),
            "goal": Box(low=-2, high=3, shape=(self.height, self.width), dtype=int)
        })
        self.current_player = shallowEnv.current_player

    def reset(self, *, seed=None, options=None):
        self.n_steps = 0
        obs = {
            "current": self.current_board,
            "goal": self.goal_board
        }
        return obs, {}

    def __deepcopy__(self, memo):
        # Create a new instance of the class with the same configuration
        new_env = SingleChallengeTestEnvMultiplayer(self.shallowEnv)

        # Copy all attributes of the environment
        new_env.n_steps = deepcopy(self.n_steps, memo)
        new_env.current_board = deepcopy(self.current_board, memo)
        new_env.goal_board = deepcopy(self.goal_board, memo)

        return new_env

