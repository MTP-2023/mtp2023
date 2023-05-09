import json
import numpy as np
from ray.rllib.policy.policy import Policy
import sys
from ray.air.integrations.wandb import setup_wandb

sys.path.append("../../")
from gameVariants.baseline.reward import reward
from gameResources.simulation.simulate import run
from collections import OrderedDict
from apply_policy import return_move

run_wandb = setup_wandb(api_key_file="wandb_api_key.txt")
artifact = run_wandb.use_artifact('mtp2023_avalanche/CurriculumLearning/checkpoint_stop125_thresh65_new_set_ray_curr:v130', type='model')
artifact_dir = artifact.download()

agent = Policy.from_checkpoint(artifact_dir+'/policies/default_policy')

class environment:
    def __init__(self, current_board, goal_board, n_steps, max_steps, width, height):
        self.current_board = current_board
        self.goal_board = goal_board
        self.n_steps = n_steps
        self.max_steps = max_steps
        self.width = width
        self.height = height

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
        for i in range(max_steps):
            obs = OrderedDict()
            obs["current"] = current_board
            obs["goal"] = goal_board
            move = return_move(agent, obs)
            print("TURN", i, "SELECTED MOVE:", move)
            run(move, current_board)
            print("UPDATED BOARD\n", current_board)
            envObj = environment(current_board, goal_board, i, max_steps, width, height)
            x, done = reward(envObj)
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

run_wandb.finish()