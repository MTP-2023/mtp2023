import json
import random

import numpy as np
from ray.rllib.policy.policy import Policy
import sys
from ray.air.integrations.wandb import setup_wandb
from ray.rllib.models import ModelCatalog
sys.path.append("../../")
from gameResources.boardGenerator.generate import generate_random_board
from gameResources.boardGenerator.print_board import print_board
from gameResources.challengeGenerator.generateGoal import generateGoalState
from gameResources.challengeGenerator.generateChallenges import merge
from agent.rl.train_resources.multiplayerEnv import SingleChallengeTestEnvMultiplayer
from collections import OrderedDict
#from apply_policy import return_move
from gameResources.simulation.simulate import run
from gameVariants.multiplayer.reward import reward
from agent.baseline.mcts import mcts
import argparse

parser = argparse.ArgumentParser()

parser.add_argument(
    "--vs",
    default="human",
    help="Who to play against"
)

args = parser.parse_args()

class ShallowEnv:
    def __init__(self, current_board, goal_board, n_steps, max_steps, width, height, player):
        self.current_board = current_board
        self.goal_board = goal_board
        self.n_steps = n_steps
        self.max_steps = max_steps
        self.width = width
        self.height = height
        self.variant = "multiplayer"
        self.current_player = player

def return_move(agent, shallowEnv, obs):
    # create "empty" env to obtain preprocessor
    preprocessor = ModelCatalog.get_preprocessor(SingleChallengeTestEnvMultiplayer(shallowEnv))

    # flatten obs and query results
    flat_obs = preprocessor.transform(obs)
    move = agent.compute_single_action(flat_obs)
    return move[0]

#run_wandb = setup_wandb(api_key_file="wandb_api_key.txt")
#artifact = run_wandb.use_artifact('mtp2023_avalanche/CurriculumVer2Fix/checkpoint_multiplayer_fr_vs_mcts100:v3', type='model')
artifact_dir = "./artifacts/checkpoint_multiplayer_fr_vs_mcts100-v3"#artifact.download()

agent = Policy.from_checkpoint(artifact_dir+'/policies/default_policy')

width = 3
height = 2
minMarbles = 2
maxMarbles = 2
max_turns = 16
current_board = generate_random_board(width, height)
goal = generateGoalState(current_board, minMarbles, maxMarbles, max_turns, 42, width*2, False)
goal2 = generateGoalState(current_board, minMarbles, maxMarbles, max_turns, 42, width*2, False)
goal_board = merge(goal, goal2, width, height)

obs = OrderedDict()
obs["current"] = current_board
obs["goal"] = goal_board

done = False
for step in range(max_turns):
    print("      STEP", step)
    print("      GOAL BOARD")
    print_board(goal_board)
    print("      CURRENT BOARD")
    print_board(current_board)
    player = 1
    solveEnv = ShallowEnv(current_board, obs["goal"], step + 1, max_turns, len(current_board[0]), len(current_board),
                          player)
    # determine if goal is fulfilled
    _, done = reward(solveEnv)
    if done:
        if reward > 0:
            print("     AGENT WON")
        else:
            print("     PLAYER WON")
    paramEnv = ShallowEnv(current_board, obs["goal"], step, max_turns, len(current_board[0]), len(current_board), player)
    action = return_move(agent, paramEnv, obs)
    print("      AGENT MOVE", action+1)
    current_board = run(action, current_board, player=player)
    print("      GOAL BOARD")
    print_board(goal_board)
    print("      CURRENT BOARD")
    print_board(current_board)
    solveEnv = ShallowEnv(current_board, obs["goal"], step + 1, max_turns, len(current_board[0]), len(current_board), player)
    # determine if goal is fulfilled
    _, done = reward(solveEnv)
    if done:
        print("      AGENT WON")
        break

    player = -1
    if args.vs == "human":
        print("Input move")
        action = int(input())-1
        print("      PLAYER MOVE", action+1)
    elif args.vs == "mcts":
        action = mcts(current_board, 10, 1, goal_board, width*2, height, max_turns, step, player)
        print("      MCTS MOVE", action+1)
    elif args.vs == "random":
        action = random.randint(2*width)
    current_board = run(action, current_board, player=player)
    print("      GOAL BOARD")
    print_board(goal_board)
    print("      CURRENT BOARD")
    print_board(current_board)
    solveEnv = ShallowEnv(current_board, obs["goal"], step + 1, max_turns, len(current_board[0]), len(current_board), player)
    # determine if goal is fulfilled
    _, done = reward(solveEnv)
    if done:
        print("      PLAYER WON")
        break
if not done:
    print("      DRAW")