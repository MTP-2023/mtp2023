import json
import numpy as np
from ray.rllib.policy.policy import Policy
import sys
from ray.air.integrations.wandb import setup_wandb

sys.path.append("../../")
from gameVariants.baseline.reward import reward
from gameResources.simulation.simulate import run
from collections import OrderedDict
from apply_policy import solve_challenge

run_wandb = setup_wandb(api_key_file="wandb_api_key.txt")
artifact = run_wandb.use_artifact('mtp2023_avalanche/CurriculumLearning/checkpoint_gpu_14_65:v171', type='model')
artifact_dir = artifact.download()

agent = Policy.from_checkpoint(artifact_dir+'/policies/default_policy')



challenges = json.load(open("../../gameVariants/baseline/training/curriculumVer2Test.json"))
height = challenges["height"] * 2
width = challenges["width"] * 2 + 2
noOfLevels = len(challenges["training_levels"])
print(noOfLevels)
solvedChallenges = 0
totalTurns = 0
noOfChallenges = 0


for k in range(noOfLevels):
    noOfChallengesLvl = len(challenges["training_levels"][k])
    noOfChallenges += noOfChallengesLvl
    print("LEVEL", k)
    for j in range(noOfChallengesLvl):
        print("ATTEMPTING CHALLENGE", j)
        challenge = challenges["training_levels"][k][j]
        current_board = np.array(challenge["start_board"])
        goal_board = np.array(challenge["goal_board"])
        max_steps = challenge["max_turns"]
        print("START BOARD\n", current_board)
        print("GOAL BOARD\n", goal_board)
        done = False
        obs = OrderedDict()
        obs["current"] = current_board
        obs["goal"] = goal_board
        results = solve_challenge(agent, obs, max_steps)
        if results["solved"]:
            print("FINISHED CHALLENGE IN", results["actions_required"], "TURNS\n")
            solvedChallenges += 1
            totalTurns += results["actions_required"]
        else:
            #totalTurns += max_steps+1
            print("FAILED CHALLENGE :((((\n")
solvedPercent = float(solvedChallenges)/float(noOfChallenges)
print("SOLVE RATE:", solvedPercent)
avgTurns = float(totalTurns)/float(solvedChallenges)
print("AVERAGE TURNS:", avgTurns)

run_wandb.finish()