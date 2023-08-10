import json
import random

import numpy as np
from ray.rllib.policy.policy import Policy
import sys
from ray.air.integrations.wandb import setup_wandb

sys.path.append("../../")
from gameResources.boardGenerator.generate import generate_random_board
from gameResources.boardGenerator.print_board import print_board
from gameResources.challengeGenerator.generateGoal import generateGoalState
from gameResources.challengeGenerator.generateChallenges import merge
from agent.rl.train_resources.multiplayerEnv import SingleChallengeTestEnvMultiplayer
from ray.rllib.models import ModelCatalog
from agent.rl.train_resources.flip_board import flip_board
from collections import OrderedDict
#from apply_policy import return_move
from gameResources.simulation.simulate import run
from gameVariants.multiplayer.reward import reward
from agent.baseline.mcts import mcts
from agent.rl.multiplayer_utils import flip_board, ShallowEnv, return_move, check_win
import argparse
from copy import deepcopy
import math
import pandas as pd
import os

run_wandb = setup_wandb(api_key_file="wandb_api_key.txt")
agents = json.load(open("agents.json"))["agents"]
for agent_name in agents:
    for agent_ver in range(0, 100):
        try:
            if not os.path.exists("artifacts/checkpoint_"+agent_name+ "-v" + str(agent_ver)):
                print(agent_name+ "-v" + str(agent_ver))
                artifact = run_wandb.use_artifact(agent_name+str(agent_ver), type='model')
                artifact_dir = artifact.download()
        except Exception as e:
            print(e)

run_wandb.finish()

