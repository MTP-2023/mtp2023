import gymnasium as gym
from ray.rllib.env.env_context import EnvContext
from ray.rllib.env.apis.task_settable_env import TaskSettableEnv, TaskType
from gymnasium.spaces import Discrete, Box, Dict
import random
import numpy as np
import json
import importlib
import sys
#sys.path.append('../')
sys.path.append('../../')
from gameResources.simulation.simulate import run
from copy import deepcopy

# maybe change this import to be based on received game variant name later

#from gameVariants.baseline.reward import baselineReward

class GameBoardEnv(TaskSettableEnv):
    """Example of a custom env in which you have to walk down a corridor.
    You can configure the length of the corridor via the env config."""

    def __init__(self, config: EnvContext, example_board: list = [0]):
        if len(example_board) > 0:
            self.height = len(example_board)
            self.width = len(example_board[0])
            self.observation_space = Dict({
                "current": Box(low=0, high=2, shape=(self.height, self.width), dtype=int),
                "goal": Box(low=0, high=2, shape=(self.height, self.width), dtype=int)
            })
        else:
            self.config = config
            self.task_level = 0
            self.variant = config["variant"]
            self.n_steps = 0
            self.training_index = 0
            self.width = config["width"]*2+2
            self.height = config["height"]*2
            self.training_levels = config["training_levels"]
            self.training_states = self.training_levels[0]

            
            #print(self.training_states)

            # self.observation_space = Dict({
            #     "game_board": Box(low=0, high=2, shape=(self.width, self.height), dtype=np.int8)
            # })
            self.observation_space = Dict({
                "current": Box(low=0, high=2, shape=(self.height, self.width), dtype=int),
                "goal": Box(low=0, high=2, shape=(self.height, self.width), dtype=int)
            })

            self.n_choices = 2*config["width"]
            #print("CHOICES", self.n_choices)
            self.action_space = Discrete(self.n_choices)

            self.current_board = np.array(self.training_states[self.training_index]["start_board"])
            self.goal_board = np.array(self.training_states[self.training_index]["goal_board"])
            self.max_steps = self.training_states[self.training_index]["max_turns"]
            reward_module = "gameVariants." + config["variant"] + ".reward"
            self.reward_module = importlib.import_module(reward_module)
            #print(self.current_board, type(self.current_board))
            #print(self.goal_board, type(self.current_board))
            
            # Set the seed. This is only used for the final (reach goal) reward.
            #self.reset(default=True)

    # implement how the game board initialization should work
    def reset(self, *, seed=None, options=None):
        #print("reset")
        #random.seed(seed)
        #self.cur_pos = 0
        #return [self.cur_pos], {}
        
        self.n_steps = 0

        # iterate over challenges
        if self.training_index < len(self.training_states) - 1:
            self.training_index += 1
        else:
            #print("RESET: All challenges played.")
            self.training_index = 0

        # reset env to next challenge
        self.current_board = np.array(self.training_states[self.training_index]["start_board"])
        self.goal_board = np.array(self.training_states[self.training_index]["goal_board"])
        self.max_steps = self.training_states[self.training_index]["max_turns"]

        obs = {
            "current": self.current_board,
            "goal": self.goal_board
        }

        return obs, {}

    def step(self, action):
        assert action in range(self.n_choices), action

        self.current_board = run(action, self.current_board)
        self.n_steps += 1

        # game variant dependencies:
        # final states
        # rewards

        reward, done = self.reward_module.reward(self)

        obs = {
            "current": self.current_board,
            "goal": self.goal_board
        }

        # to be changed for actual agent training
        return obs, reward, done, False, {}

    def get_task(self):
        return self.task_level

    def set_task(self, task):
        self.task_level = task
        self.training_states = self.training_levels[task]
        self.training_index = 0

    def __deepcopy__(self, memo):
        # Create a new instance of the class with the same configuration
        new_env = GameBoardEnv(config=self.config)

        # Copy all attributes of the environment
        new_env.task_level = deepcopy(self.task_level, memo)
        new_env.variant = deepcopy(self.variant, memo)
        new_env.n_steps = deepcopy(self.n_steps, memo)
        new_env.training_index = deepcopy(self.training_index, memo)
        new_env.width = deepcopy(self.width, memo)
        new_env.height = deepcopy(self.height, memo)
        new_env.training_levels = deepcopy(self.training_levels, memo)
        new_env.training_states = deepcopy(self.training_states, memo)
        new_env.observation_space = deepcopy(self.observation_space, memo)
        new_env.action_space = deepcopy(self.action_space, memo)
        new_env.current_board = deepcopy(self.current_board, memo)
        new_env.goal_board = deepcopy(self.goal_board, memo)
        new_env.max_steps = deepcopy(self.max_steps, memo)

        # Deep copy the reward module
        #new_env.reward_module = deepcopy(self.reward_module, memo)

        return new_env