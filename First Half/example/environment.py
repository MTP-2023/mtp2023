import argparse
import gym
from gym.core import ActType, ObsType
from gym.spaces import Discrete, Box, MultiDiscrete
import numpy as np
import os
import random

from ray.rllib.env import EnvContext
import ray
from ray import air, tune
from ray.rllib.env.env_context import EnvContext
from ray.rllib.models import ModelCatalog
from ray.rllib.models.tf.tf_modelv2 import TFModelV2
from ray.rllib.models.tf.fcnet import FullyConnectedNetwork
from ray.rllib.models.torch.torch_modelv2 import TorchModelV2
from ray.rllib.models.torch.fcnet import FullyConnectedNetwork as TorchFC
from ray.rllib.utils.framework import try_import_tf, try_import_torch
from ray.rllib.utils.test_utils import check_learning_achieved
from ray.tune.logger import pretty_print
from ray.tune.registry import get_trainable_cls

tf1, tf, tfv = try_import_tf()
torch, nn = try_import_torch()

class AvalancheEnv(gym.Env):
    def __init__(self, config: EnvContext):
        self.action_space = Discrete(2)
        self.state = 0
        self.flips = 0
        self.num_steps = 0
        self.needed_flips = config["needed_flips"]
        self.observation_space = Discrete(2)

    def step(self, action):
        self.num_steps += 1
        done = False
        reward = 0
        if action == 0:
            if self.state == 0:
                self.state = 1
                self.flips += 1
        else:
            if self.state == 1:
                self.state = 0
                self.flips += 1
        #print("flips:", self.flips)
        if self.flips >= self.needed_flips:
            done = True
        if done:
            reward = (self.needed_flips+1)-self.num_steps
        #print("reward", reward)
        return self.state, reward, done, {}

    def reset(self):
        self.state = 0
        self.flips = 0
        self.num_steps = 0
        return self.state