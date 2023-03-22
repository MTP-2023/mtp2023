import json
import numpy as np
from ray.rllib.policy.policy import Policy
from ray.rllib.algorithms.algorithm import Algorithm
import tensorflow as tf
from ray.rllib.algorithms.ppo import PPOConfig
import sys

sys.path.append("../../")
from gameVariants.baseline.reward import baselineReward
from gameEnv.simulation.simulate import run
from gameEnv.rllibEnv import avalancheEnv
from collections import OrderedDict

# policy = Policy.from_checkpoint(
#     "C:/Users/thoma/PycharmProjects/mtp2023/gameEnv/rllibEnv/results/PPO_no_model_gen_test2_new_rewards_big_grid_search/PPO_GameBoardEnv_fc999_00006_6_clip_param=0.3000,lr=0.0002_2023-03-21_19-07-29/checkpoint_000300/policies/default_policy")

agent = Algorithm.from_checkpoint("C:/Users/thoma/PycharmProjects/mtp2023/gameEnv/rllibEnv/results/PPO_no_model_gen_test2_new_rewards_big_grid_search/PPO_GameBoardEnv_fc999_00006_6_clip_param=0.3000,lr=0.0002_2023-03-21_19-07-29/checkpoint_000300")


challenges = json.load(open("../../gameVariants/baseline/training/generationTest2.json"))
height = challenges["height"] * 2
width = challenges["width"] * 2 + 2
noOfChallenges = len(challenges["training_states"])
print(noOfChallenges)
solvedChallenges = 0
totalTurns = 0

for j in range(noOfChallenges):
    print("ATTEMPTING CHALLENGE", j)
    challenge = challenges["training_states"][j]
    current_board = np.array(challenge["start_board"])
    goal_board = np.array(challenge["goal_board"])
    max_steps = challenge["max_turns"]

    print("START BOARD\n", current_board)
    print("GOAL BOARD\n", goal_board)
    done = False
    for i in range(max_steps):
        obs = OrderedDict()
        obs["current"] = current_board
        obs["goal"] = goal_board
        move = agent.compute_single_action(obs)
        print("TURN", i, "SELECTED MOVE:", move)
        run(move, current_board)
        print("UPDATED BOARD\n", current_board)
        reward, done = baselineReward(i, max_steps, height, width, goal_board, current_board)
        if done:
            print("FINISHED CHALLENGE IN", i, "TURNS\n")
            solvedChallenges += 1
            totalTurns += i
            break
    if not done:
        #totalTurns += max_steps+1
        print("FAILED CHALLENGE :((((\n")

solvedPercent = float(solvedChallenges)/float(noOfChallenges)
print("SOLVE RATE:", solvedPercent)
avgTurns = float(totalTurns)/float(solvedChallenges)
print("AVERAGE TURNS:", avgTurns)
