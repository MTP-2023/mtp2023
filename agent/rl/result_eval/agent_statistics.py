import json
import numpy as np
from ray.rllib.policy.policy import Policy
import sys
from ray.air.integrations.wandb import setup_wandb
import argparse
import pandas as pd
import pickle

sys.path.append("../../..")
sys.path.append("../")
from gameVariants.baseline.reward import reward
from gameResources.simulation.simulate import run
from collections import OrderedDict
from apply_policy import solve_challenge

parser = argparse.ArgumentParser()

parser.add_argument(
    "--agent_links",
    default="agent_links",
    help="json containing links to the wandb artifacts we want to test."
)
parser.add_argument(
    "--challenges",
    default="curriculumVer2Test",
    help=""
)
parser.add_argument(
    "--local_run",
    default=True,
    action=argparse.BooleanOptionalAction,
    help="store data in pickle if run on server"
)

parser.add_argument(
    "--AlphaZero",
    default=False,
    action=argparse.BooleanOptionalAction,
    help="indicate if run uses alphazero models or not"
)

parser.add_argument(
    "--out"
)

from ray.rllib.models import ModelCatalog
from train_resources.azModel import DefaultModel, SimplerModel, ComplexModel
ModelCatalog.register_custom_model("default_alphazero_model", DefaultModel)
ModelCatalog.register_custom_model("simpler_alphazero_model", SimplerModel)
ModelCatalog.register_custom_model("complex_alphazero_model", ComplexModel)

args = parser.parse_args()

run_wandb = setup_wandb(api_key_file="../wandb_api_key.txt")
agent_links = json.load(open("agent_test_lists/" + args.agent_links + ".json"))["agents"]

challenges = json.load(open("../../../gameVariants/baseline/training/" + args.challenges + ".json"))
noOfLevels = len(challenges["training_levels"])

print("test on", args.challenges)

stats_dict = {}

for agent_link in agent_links:
    print("started", agent_link)
    agent_solverates = []
    agent_turns = []

    artifact = run_wandb.use_artifact(agent_link, type='model')
    artifact_dir = artifact.download()
    agent = Policy.from_checkpoint(artifact_dir + '/policies/default_policy')

    noOfChallenges = 0
    solvedChallenges = 0
    noOfTurns = 0
    for level in range(noOfLevels):
        print("level", level)
        noOfChallengesLvl = len(challenges["training_levels"][level])
        solvedChallengesLvl = 0
        noOfTurnsLvl = 0
        noOfChallenges += noOfChallengesLvl
        for challengeNo in range(noOfChallengesLvl):
            challenge = challenges["training_levels"][level][challengeNo]
            current_board = np.array(challenge["start_board"])
            goal_board = np.array(challenge["goal_board"])
            max_steps = challenge["max_turns"]
            done = False
            obs = OrderedDict()
            obs["current"] = current_board
            obs["goal"] = goal_board
            results = solve_challenge(agent, obs, max_steps, az=args.AlphaZero)
            if results["solved"]:
                #print("FINISHED CHALLENGE IN", results["actions_required"], "TURNS\n")
                solvedChallengesLvl += 1
                noOfTurnsLvl += results["actions_required"]
        solvedChallenges += solvedChallengesLvl
        noOfTurns += noOfTurnsLvl
        solverateLvl = solvedChallengesLvl/noOfChallengesLvl
        avgTurnsLvl = noOfTurnsLvl/solvedChallengesLvl
        agent_solverates.append(solverateLvl)
        agent_turns.append(avgTurnsLvl)
    solverate = solvedChallenges/noOfChallenges
    avgTurns = noOfTurns/solvedChallenges
    agent_solverates.append(solverate)
    agent_turns.append(avgTurns)
    stats_dict[agent_link + "_solverate"] = agent_solverates
    stats_dict[agent_link + "_average_turns"] = agent_turns

    print("agent tested")


stats_df = pd.DataFrame(data=stats_dict)

if not args.local_run:
    file = open(args.out+".pkl", "wb")
    pickle.dump(stats_df, file)
    file.close()
else:
    stats_df.to_excel(args.out + ".xlsx")

run_wandb.finish()
