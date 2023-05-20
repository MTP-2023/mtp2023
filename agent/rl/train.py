import ray
from ray import air, tune
from ray.rllib.models import ModelCatalog
from ray.rllib.utils.framework import try_import_tf, try_import_torch
from ray.rllib.algorithms.ppo import PPOConfig
from ray.rllib.algorithms.alpha_zero import AlphaZeroConfig
from ray.air.integrations.wandb import WandbLoggerCallback
from train_resources.custom_callbacks import CustomCallbacks
from train_resources.curriculum_function import curriculum_fn
from train_resources.avalancheEnv import GameBoardEnv
from train_resources.envWrapperAlphaZero import WrappedGameBoardEnv
import functools

import argparse
import json
import jsonschema
#from model import CustomModel

tf1, tf, tfv = try_import_tf()
torch, nn = try_import_torch()

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
    default="curriculumVer1",
    help="The name of the json file which contains training scenarios."
)

parser.add_argument(
    "--stop_reward",
    default=2,
    help="The reward we stop training at."
)

parser.add_argument(
    "--curriculum_threshold",
    default=-0.3,
    help="The reward we go to the next level at."
)

parser.add_argument(
    "--results_folder",
    help="Folder name which should contain the results of the training run."
)

parser.add_argument(
    "--log_as",
    help="Define the name of the run which will be displayed in WandB."
)

parser.add_argument(
    "--num_cpus",
    default=2,
    help="Number of CPUs available (important for cluster runs)."
)

parser.add_argument(
    "--algo",
    default="PPO",
    help="Sefine which algorrithm should be applied."
)

parser.add_argument(
    "--config",
    default="default_ppo",
    help="Sefine which algorrithm should be applied."
)

parser.add_argument(
    "--curriculum",
    default="manual",
    help="Define if the curriculum learning concept should be applied."
)

# this option can be turned off by providing "--no-wandb"
parser.add_argument(
    "--wandb",
    default=True,
    action=argparse.BooleanOptionalAction,
    help="Define if run should be logged to wandb."
)

args = parser.parse_args()

# quick and dirty addition for baseline_strict (TO BE CHANGED)
# list of variants that use the same json format as the baseline variant and, thus, do not have dedicated training folders 
baseline_adapted_variants = ['baseline_strict', 'baseline_solverate']

if args.variant in "baseline_strict" or args.variant in "baseline_solverate":
    path = "../../gameVariants/baseline"
else:
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
env_setup["curriculum_threshold"] = float(args.curriculum_threshold)
env_setup["start_level"] = 0


#initialize ray
ray.init(num_cpus=int(args.num_cpus))

alphazero_cb = False
#initialize our optimization algorithm
if args.algo == "PPO":
    config = PPOConfig()
    env_class = GameBoardEnv
elif args.algo == "AlphaZero":
    config = AlphaZeroConfig()
    env_class = WrappedGameBoardEnv
    alphazero_cb = True
    #register custom model from model.py
    from train_resources.azModel import AlphaZeroModel
    ModelCatalog.register_custom_model(
        "default_alphazero_model", AlphaZeroModel
    )
    #from ray.rllib.algorithms.alpha_zero.models.custom_torch_models import DenseModel
    #ModelCatalog.register_custom_model(
    #    "default_alphazero_model", DenseModel
    #)

config_path = "./train_resources/configs/" + args.algo + "/" + args.config
pre_config = json.load(open(config_path + ".json"))
config.update_from_dict(pre_config)

#stopping conditions, these are assumed to be increasing by ray tune (meaning we can't use metrics we want to decrease, e.g. episode length, as stopping criteria)
stop = {
        #"training_iteration": 500,
        "episode_reward_mean": float(args.stop_reward),
    }

if args.curriculum == "manual":
    curriculum_cb = True
    config = config.environment(env_class, env_config=env_setup)
elif args.curriculum == "ray":
    curriculum_cb = False
    config = config.environment(env_class, env_config=env_setup, env_task_fn=curriculum_fn)
else:
    curriculum_cb = False
    config = config.environment(env_class, env_config=env_setup)

custom_callback_class = functools.partial(CustomCallbacks, env_setup, alphazero_cb, curriculum_cb)
config = config.callbacks(custom_callback_class)
    

#start a training run, make sure you indicate the correct optimization algorithm
#local dir and name define where training results and checkpoints are saved to
#checkpoint config defines if and when checkpoints are saved

cb = []
if args.wandb:
    cb.append(
        WandbLoggerCallback(
            api_key_file="wandb_api_key.txt",
            entity="mtp2023_avalanche",
            project="CurriculumLearning",
            group=args.algo,
            name=args.log_as,
            save_checkpoints=True
        )
    )

tune.Tuner(
    args.algo,
    run_config=air.RunConfig(
        stop=stop,
        name=args.results_folder,
        local_dir=args.results_folder,
        checkpoint_config=air.CheckpointConfig(num_to_keep=4, checkpoint_frequency=100),
        callbacks=cb
        ),
    param_space=config.to_dict()
).fit()
