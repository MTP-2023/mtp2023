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
from ray.rllib.algorithms.dqn import DQNConfig
from ray.rllib.algorithms.algorithm import Algorithm

tf1, tf, tfv = try_import_tf()
torch, nn = try_import_torch()

import json
import jsonschema
from model import CustomModel

from avalancheEnv import GameBoardEnv


#we use argparse so you can configure the training settings from the command line call of the script like so:
#python train.py --variant baseline --train_on generationTest2
parser = argparse.ArgumentParser()

#argument to set which game variant/rules you want to train an agent for
parser.add_argument(
    "--variant",
    default="baseline",
    help="The name of the variant has to match the respective folder name."
)

#argument to set the training scenarios for the agent
parser.add_argument(
    "--train_on",
    default="test",
    help="The name of the json file which contains training scenarios."
)

args = parser.parse_args()
path = "../../gameVariants/" + args.variant
training_path = path + "/training/" + args.train_on

#we use a json schema to check if all the training scenarios are formatted correctly
schema = json.load(open(path+"/env_schema.json"))

# load all train examples into a list and validate them
env_setup = json.load(open(training_path + ".json"))
try:
    jsonschema.validate(env_setup, schema)
except Exception as e:
    print(e)

#we use this to pass the game variant selection to the environment
env_setup["variant"] = args.variant

#print(env_setup)

#register custom model from model.py
ModelCatalog.register_custom_model(
    "my_model", CustomModel
)

#initialize ray
ray.init()

#initialize our optimization algorithm (PPO in this case)
config = PPOConfig()
#configure the algorithm's settings
config.rollouts(num_rollout_workers=4)
#uncomment to use the custom model
#config = config.training(model={"custom_model": "my_model"})
#this shows how to define a grid search over various parameters
#config.training(lr=tune.grid_search([0.0001, 0.0002, 0.00001]), clip_param=tune.grid_search([0.1, 0.2, 0.3, 0.4]))
config = config.training(lr=0.0002, clip_param=0.3)
#configuring the game environment
config = config.environment(GameBoardEnv, env_config=env_setup)

#stopping conditions, these are assumed to be increasing by ray tune (meaning we can't use metrics we want to decrease, e.g. episode length, as stopping criteria)
stop = {
        #"training_iteration": 500,
        "episode_reward_mean": 2,
    }

#start a training run, make sure you indicate the correct optimization algorithm
#local dir and name define where training results and checkpoints are saved to
#checkpoint config defines if and when checkpoints are saved
tune.Tuner(
    "PPO",
    run_config=air.RunConfig(stop=stop, local_dir="./results", name="PPO_no_model_gen_test3_newer_rewards",
                             checkpoint_config=air.CheckpointConfig(num_to_keep=1, checkpoint_at_end=True)),
    param_space=config.to_dict(),
).fit()

#algo = config.build()
# for i in range(100):
#     train = algo.train()
#     print(pretty_print("BEGIN", train, i))