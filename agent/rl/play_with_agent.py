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

from train_resources.azModel import DefaultModel, SimplerModel, ComplexModel
from ray.rllib.models import ModelCatalog
ModelCatalog.register_custom_model("simpler_alphazero_model", SimplerModel)

download = False
is_alphazero = True

if download:
    run_wandb = setup_wandb(api_key_file="wandb_api_key.txt")
    artifact = run_wandb.use_artifact('mtp2023_avalanche/CurriculumLearning/checkpoint_SmallTrainLocalSolverate:v0', type='model')
    artifact_dir = artifact.download()
else:
    artifact_dir = './artifacts/checkpoint_SmallTrainLocalRay-v0'

agent = Policy.from_checkpoint(artifact_dir+'/policies/default_policy')

challenges = json.load(open("../../gameVariants/baseline/training/curriculumVer2.json"))
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
        results = solve_challenge(agent, obs, max_steps, is_aphazero)
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

if download:
    run_wandb.finish()