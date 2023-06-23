from copy import deepcopy
from torch import tensor
import gymnasium as gym
import numpy as np
from gymnasium.spaces import Dict, Box, flatten_space
from gymnasium.wrappers.flatten_observation import FlattenObservation
from ray.rllib.env.env_context import EnvContext
from .avalancheEnv import GameBoardEnv, SingleChallengeTestEnv, OnlineLearningEnv

class WrappedGameBoardEnv(gym.Env):
    """Wrapper for the GameBoardEnv where reward is accumulated to the end."""

    def __init__(self, config: EnvContext, shallowEnv = None):
        if config["online"]:
            self.env = OnlineLearningEnv(config)
        elif not shallowEnv:
            self.env = GameBoardEnv(config)
        else:
            self.env = SingleChallengeTestEnv(shallowEnv)  
        self.action_space = self.env.action_space
        self.observation_space = Dict(
            {
                "obs": flatten_space(self.env.observation_space), #Box(low=0, high=2, shape=(self.env.height * self.env.width * 2,), dtype=int),
                "action_mask": Box(low=0, high=1, shape=(self.action_space.n,))
            }
        )
        #print("FLATTEN", self.observation_space)
        #print("COMPARE",Box(low=0, high=2, shape=(self.env.height * self.env.width * 2,), dtype=int), flatten_space(self.env.observation_space))
        self.running_reward = 0

    def reset(self, *, seed=None, options=None):
        self.running_reward = 0
        obs, infos = self.env.reset()
        return {
            "obs": self.flatten_original_obs(obs),
            "action_mask": np.ones((self.env.n_choices,), dtype=int)
        }, infos

    def step(self, action):
        obs, reward, terminated, truncated, info = self.env.step(action)
        self.running_reward += reward
        score = reward if terminated else 0
        return (
            {
                "obs": self.flatten_original_obs(obs), 
                "action_mask": np.ones((self.env.n_choices,), dtype=int)
             },
            score,
            terminated,
            truncated,
            info,
        )

    def set_state(self, state):
        #print("SET_STATE")
        self.running_reward = state[1]
        self.env = deepcopy(state[0])
        obs = {
            "current": self.env.current_board,
            "goal": self.env.goal_board
        }
        return {"obs": self.flatten_original_obs(obs), "action_mask": np.ones((self.env.n_choices,), dtype=int)}

    def get_state(self):
        #print("GET STATE", self.env)
        return deepcopy(self.env), self.running_reward
    
    def flatten_original_obs(self, obs):
        return FlattenObservation(self.env).observation(obs)

    def set_task(self, task):
        self.env.set_task(task)

    def get_task(self):
        return self.env.get_task()