import argparse
import gym
from gym.core import ActType, ObsType
from gym.spaces import Discrete, Box
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
from ray.rllib.models.tf.misc import normc_initializer
from ray.rllib.algorithms import ppo
from ray.rllib.algorithms.ppo import PPOConfig
from ray.rllib.algorithms.algorithm import Algorithm

tf1, tf, tfv = try_import_tf()
torch, nn = try_import_torch()


from avalancheEnv import GameBoardEnv
import json
import jsonschema

parser = argparse.ArgumentParser()

parser.add_argument(
    "--variant",
    default="baseline",
    help="The name of the variant has to match the respective folder name."
)

parser.add_argument(
    "--train_on",
    default="test",
    help="The name of the json file which contains training scenarios."
)

args = parser.parse_args()
path = "../../gameVariants/" + args.variant
training_path = path + "/training/" + args.train_on

schema = json.load(open(path+"/env_schema.json"))

# load all train examples into a list
env_setup = json.load(open(training_path + ".json"))
try:
    jsonschema.validate(env_setup, schema)
except Exception as e:
    print(e)

env_setup["variant"] = args.variant

#print(env_setup)

ray.init()

config = PPOConfig()
config.rollouts(num_rollout_workers=4)
config = config.environment(GameBoardEnv, env_config=env_setup)

algo = config.build()
for i in range(50):
    train = algo.train()
    print("BEGIN", train, i)