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
from agent.rl.multiplayer_utils import flip_board, ShallowEnv, return_move
import argparse
from copy import deepcopy
import math
import pandas as pd
import os

parser = argparse.ArgumentParser()

parser.add_argument(
    "--player1",
    default="agent",
    help="Type of player one"
)

parser.add_argument(
    "--player2",
    default="human",
    help="Type of player two"
)

parser.add_argument(
    "--mcts_depth",
    default="10"
)

parser.add_argument(
    "--challenges",
    default="random"
)

parser.add_argument(
    "--last_agent",
    default=100
)

parser.add_argument(
    "--first_agent",
    default=0
)

parser.add_argument(
    "--agent_name",
    default="doubletrain_fixed"
)

args = parser.parse_args()



agent_stats = {}

for agent_ver in range(int(args.first_agent), int(args.last_agent)):
    print(args.agent_name + "v:" + str(agent_ver))
    try:
        artifact_dir = "artifacts/checkpoint_" + args.agent_name + "-v" + str(agent_ver)
        if not os.path.exists(artifact_dir):
            run_wandb = setup_wandb(api_key_file="wandb_api_key.txt")
            artifact = run_wandb.use_artifact("mtp2023_avalanche/CurriculumVer2Fix/checkpoint_" + args.agent_name + ":v" + str(agent_ver), type='model')
            artifact_dir = artifact.download()
            run_wandb.finish()

        agent = Policy.from_checkpoint(artifact_dir+'/policies/default_policy')

        if args.challenges == "random":
            width = 3
            height = 2
            minMarbles = 1
            maxMarbles = 1
            max_turns = 16
            noOfLevels = 1
            current_board = generate_random_board(width, height)
            goal = generateGoalState(current_board, minMarbles, maxMarbles, max_turns, 42, width*2, False)
            goal2 = generateGoalState(current_board, minMarbles, maxMarbles, max_turns, 42, width*2, False)
            goal_board = merge(goal, goal2, width, height)
            training_levels = []
            training_levels.append([{"start_board": current_board, "goal_board": goal_board, "max_turns": max_turns}])

        else:
            challenges = json.load(open("../../gameVariants/multiplayer/training/" + args.challenges + ".json"))
            height = challenges["height"]
            width = challenges["width"]
            training_levels = challenges["training_levels"]
            noOfLevels = len(training_levels)

        wonChallenges = 0
        totalTurns = 0
        noOfChallenges = 0
        levelStats = []
        winrates = []

        for leveli in range(noOfLevels):
            level = training_levels[leveli]
            noOfChallengesLvl = len(level)
            noOfChallenges += noOfChallengesLvl
            wonChallengesLvl = 0
            totalTurnsLvl = 0
            for challengei in range(noOfChallengesLvl):
                challenge = level[challengei]

                current_board = challenge["start_board"]
                goal_board = challenge["goal_board"]
                max_turns = challenge["max_turns"]
                obs = OrderedDict()
                obs["current"] = current_board
                obs["goal"] = goal_board

                done = False
                step = 0
                #print("      GOAL BOARD")
                #print_board(goal_board)
                #print("      START BOARD")
                #print_board(current_board)
                while step < max_turns:
                    #print("      STEP", step+1)
                    player = 1
                    solveEnv = ShallowEnv(current_board, obs["goal"], step + 1, max_turns, len(current_board[0]), len(current_board),
                                          player)
                    # determine if goal is fulfilled
                    _, done = reward(solveEnv)
                    if done:
                        if _ > 0:
                            wonChallengesLvl += 1
                            wonChallenges += 1
                            #print("     ", args.player1, "WON")
                        #else:
                            #print("     ", args.player2, " WON")
                        #print("      GOAL BOARD")
                        #print_board(goal_board)
                        break
                    if args.player1 == "agent":
                        obs["current"] = current_board
                        paramEnv = ShallowEnv(current_board, obs["goal"], step, max_turns, len(current_board[0]), len(current_board), player)
                        action = return_move(agent, paramEnv, obs)
                    elif args.player1 == "mcts":
                        action = mcts(current_board, int(args.mcts_depth), math.sqrt(2), goal_board, width * 2, height, max_turns, step, player)
                    elif args.player1 == "random":
                        action = random.randint(0, 2 * width-1)
                    elif args.player1 == "human":
                        print("      CURRENT BOARD")
                        print_board(current_board)
                        print("      GOAL BOARD")
                        print_board(goal_board)
                        print("Input move")
                        action = int(input()) - 1
                    #print("      ", args.player1, " MOVE", action+1)
                    current_board = run(action, current_board, player=player)
                    #print("      CURRENT BOARD")
                    #print_board(current_board)
                    solveEnv = ShallowEnv(current_board, obs["goal"], step + 1, max_turns, len(current_board[0]), len(current_board), player)
                    # determine if goal is fulfilled
                    _, done = reward(solveEnv)
                    if done:
                        if _ > 0:
                            wonChallengesLvl += 1
                            wonChallenges += 1
                            #print("     ", args.player1, "WON")
                        #else:
                            #print("     ", args.player2, " WON")
                        #print("      GOAL BOARD")
                        #print_board(goal_board)
                        break
                    player = -1
                    if args.player2 == "agent":
                        flipped_board = flip_board(deepcopy(current_board))
                        flipped_goal = flip_board(deepcopy(goal_board))
                        flipped_obs = OrderedDict()
                        flipped_obs["current"] = flipped_board
                        flipped_obs["goal"] = flipped_goal
                        paramEnv = ShallowEnv(flipped_board, flipped_goal, step, max_turns, len(current_board[0]), len(current_board), 1)
                        action = return_move(agent, paramEnv, flipped_obs)
                    elif args.player2 == "mcts":
                        action = mcts(current_board, int(args.mcts_depth), math.sqrt(2), goal_board, width*2, height, max_turns, step, player)
                    elif args.player2 == "random":
                        action = random.randint(0, 2*width-1)
                    elif args.player2 == "human":
                        print("      CURRENT BOARD")
                        print_board(current_board)
                        print("      GOAL BOARD")
                        print_board(goal_board)
                        print("Input move")
                        action = int(input())-1
                    #print("      ", args.player2, " MOVE", action + 1)
                    current_board = run(action, current_board, player=player)
                    #print("      CURRENT BOARD")
                    #print_board(current_board)
                    solveEnv = ShallowEnv(current_board, obs["goal"], step + 1, max_turns, len(current_board[0]), len(current_board), player)
                    # determine if goal is fulfilled
                    _, done = reward(solveEnv)
                    if done:
                        #print("     ", args.player2, " WON")
                        #print("      GOAL BOARD")
                        #print_board(goal_board)
                        break
                    step+=1
                totalTurns += step
                totalTurnsLvl += step
                #print("    ", step+1, "MOVES")
            winrateLvl = float(wonChallengesLvl) / float(noOfChallengesLvl)
            if args.player2 == "agent":
                winrateLvl = 1- winrateLvl
            winrates.append(winrateLvl)
            levelStats.append({"name": args.agent_name + ":v" + str(agent_ver), "winrate": winrateLvl, "challenges": noOfChallengesLvl, "wonChallenges": wonChallengesLvl})

        print("\n\n----RESULTS----")
        for i in range(len(levelStats)):
            print("LEVEL", i)
            winrate = float(levelStats[i]["wonChallenges"])/float(levelStats[i]["challenges"])
            if args.player2 =="agent":
                winrate = 1 - winrate
            #avg_turns = float(levelStats[i]["turns"])/float(levelStats[i]["challenges"])
            print("WINRATE:", winrate)
            #print("AVG TURNS:", avg_turns)
        print("TOTAL")
        winrate = float(wonChallenges)/float(noOfChallenges)
        if args.player2 == "agent":
            winrate = 1 - winrate
        #avg_turns = float(totalTurns)/float(noOfChallenges)
        print("WINRATE:", winrate)
        print("CHALLENGES", noOfChallenges)
        #print("AVG TURNS:", avg_turns)

        agent_stats[args.agent_name + ":v" + str(agent_ver)] = winrates
    except Exception as e:
        print("Agent ver", agent_ver, "not available")
        print(e)
stats_df = pd.DataFrame(data=agent_stats)
file_name = args.agent_name + "_" + args.challenges
if args.player2 == "agent":
    file_name += "_side-1"
else:
    file_name += "_side1"

stats_df.to_csv(file_name+".csv")


