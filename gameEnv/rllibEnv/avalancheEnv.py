import gymnasium as gym
from ray.rllib.env.env_context import EnvContext
from gymnasium.spaces import Discrete, Box, Dict
import random
import numpy as np
import json
import sys
sys.path.append('../')
sys.path.append('../../')
from gameEnv.simulation.simulate import run
# maybe change this import to be based on received game variant name later
from gameVariants.baseline.reward import baselineReward

class GameBoardEnv(gym.Env):
    """Example of a custom env in which you have to walk down a corridor.
    You can configure the length of the corridor via the env config."""

    def __init__(self, config: EnvContext):
        self.variant = config["variant"]
        self.n_steps = 0
        self.training_index = 0
        self.width = config["width"]*2+2
        self.height = config["height"]*2
        self.training_states = config["training_states"]
        
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
        #print(self.current_board, type(self.current_board))
        #print(self.goal_board, type(self.current_board))
        
        # Set the seed. This is only used for the final (reach goal) reward.
        #self.reset(default=True)

    # implement how the game board initialization should work
    def reset(self, seed=None, options=None):
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
        #print("step")
        assert action in range(self.n_choices), action

        # iterate over each row and recalculate game board status
        
        input_board = self.current_board

        # test print
        #print("INPUT", input_board)
        #print("ACTION", action)
        input_board = run(action, input_board)
        self.n_steps += 1

        # test print
        #print("FINAL", input_board)

        # game variant dependencies:
        # final states
        # rewards

        if self.variant == "baseline":
            reward, done = baselineReward(self.n_steps, self.max_steps, self.height, self.width, self.goal_board, input_board)

        obs = {
            "current": input_board,
            "goal": self.goal_board
        }

        # to be changed for actual agent training
        return obs, reward, done, False, {}

