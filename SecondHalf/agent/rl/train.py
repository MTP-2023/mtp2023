import ray
from ray import air, tune
from ray.rllib.models import ModelCatalog
from ray.rllib.utils.framework import try_import_tf, try_import_torch
from ray.rllib.algorithms.ppo import PPOConfig
from ray.rllib.algorithms.alpha_zero import AlphaZeroConfig
from ray.air.integrations.wandb import WandbLoggerCallback
from train_resources.custom_callbacks import CustomCallbacks
from train_resources.curriculum_function import curriculum_fn
from train_resources.avalancheEnv import GameBoardEnv, OnlineLearningEnv
from train_resources.multiplayerEnv import MultiplayerEnv
from train_resources.envWrapperAlphaZero import WrappedGameBoardEnv
from train_resources.hyperparameter_callbacks import CustomWandbLoggerCallback
import functools
import dill

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
    "--stop_iter",
    default=10000,
    help="The # of iterations we stop training at."
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
    "--log_group",
    help="Define the name of the group the run will be associated with in WandB."
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

parser.add_argument(
    "--single_train",
    default=True,
    action=argparse.BooleanOptionalAction,
    help="Define if this is a simple training run with fixed hyperparameter settings or a hyperparameter tuning run."
)

parser.add_argument(
    "--num_gpus",
    default=0,
    help="Number of GPUs to use (important for cluster)."
)

parser.add_argument(
    "--online",
    default=False,
    action=argparse.BooleanOptionalAction,
    help="Online learning toggle."
)

parser.add_argument(
    "--multiplayer",
    default=True,
    action=argparse.BooleanOptionalAction,
    help="multiplayer toggle"
)

parser.add_argument(
    "--vs",
    default="random",
    help="Agent to train against"
)

args = parser.parse_args()

# set value of log group, if not given
if args.log_group is None:
    log_group = args.algo
else:
    log_group = args.log_group

# quick and dirty addition for baseline_strict (TO BE CHANGED)
# list of variants that use the same json format as the baseline variant and, thus, do not have dedicated training folders 
baseline_adapted_variants = ['baseline_strict', 'baseline_solverate']

if args.variant in baseline_adapted_variants:
    path = "../../gameVariants/baseline"
else:
    path = "../../gameVariants/" + args.variant

training_path = path + "/training/" + args.train_on

#we use a json schema to check if all the training scenarios are formatted correctly
if not args.online:
    schema = json.load(open(path+"/env_schema.json"))

    # load all train examples into a list and validate them
    env_setup = json.load(open(training_path + ".json"))
    try:
        jsonschema.validate(env_setup, schema)
    except Exception as e:
        print(e)
else:
    env_setup = json.load(open(training_path + ".json"))

#we use this to pass the game variant selection to the environment
env_setup["variant"] = args.variant
env_setup["curriculum_threshold"] = float(args.curriculum_threshold)
env_setup["start_level"] = 0


#initialize ray
ray.init(num_cpus=int(args.num_cpus), num_gpus=int(args.num_gpus))

alphazero_cb = False
#initialize our optimization algorithm
if args.algo == "PPO":
    config = PPOConfig()
    if args.online:
        env_class = OnlineLearningEnv
    elif args.multiplayer:
        env_class = MultiplayerEnv
        env_setup["vs"] = args.vs
    else:
        env_class = GameBoardEnv
elif args.algo == "AlphaZero":
    config = AlphaZeroConfig()
    env_setup["online"] = args.online
    env_class = WrappedGameBoardEnv
    alphazero_cb = True
    #register custom models from model.py
    from train_resources.azModel import DefaultModel, SimplerModel, ComplexModel
    ModelCatalog.register_custom_model("default_alphazero_model", DefaultModel)
    ModelCatalog.register_custom_model("simpler_alphazero_model", SimplerModel)
    ModelCatalog.register_custom_model("complex_alphazero_model", ComplexModel)

config_path = "./train_resources/configs/" + args.algo + "/" + args.config
pre_config = json.load(open(config_path + ".json"))
config.update_from_dict(pre_config)

#stopping conditions, these are assumed to be increasing by ray tune (meaning we can't use metrics we want to decrease, e.g. episode length, as stopping criteria)
stop = {
        "training_iteration": int(args.stop_iter),
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

if int(args.num_gpus)>0:
    config = config.resources(num_gpus=int(args.num_gpus))

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
            project="CurriculumVer2Fix",
            group=log_group,
            name=args.log_as,
            log_config=True,
            save_checkpoints=True
        )
    )

if args.single_train:
    tune.Tuner(
        args.algo,
        run_config=air.RunConfig(
            stop=stop,
            name=args.results_folder,
            checkpoint_config=air.CheckpointConfig(num_to_keep=4, checkpoint_frequency=100),
            local_dir=args.results_folder,
            callbacks=cb
            ),
        param_space=config.to_dict()
    ).fit()
else:
    
    hp_config = {
        "model": {
            "custom_model": tune.grid_search(["default_alphazero_model", "complex_alphazero_model"])
        },
        "lr": tune.grid_search([1e-2, 1e-4, 5e-5]),
        "mcts_config": {
            "puct_coefficient": tune.grid_search([0.5, 1.0, 2.0]),
            "num_simulations": tune.grid_search([50, 100, 200]),
            "temperature": tune.grid_search([0.5, 1.5, 3.0]),
            "dirichlet_epsilon": 0.25,
            "dirichlet_noise": 0.03,
            "argmax_tree_policy": False,
            "add_dirichlet_noise": True
        }
    }
    """
    hp_config = {
        "model": {
            "custom_model": "default_alphazero_model",
        },
        "lr": 5e-5,
        "mcts_config": {
            "puct_coefficient": tune.grid_search([0.5, 1.0]),
            "num_simulations": 50,
            "temperature": tune.grid_search([0.5, 1.5]),
            "dirichlet_epsilon": 0.25,
            "dirichlet_noise": 0.03,
            "argmax_tree_policy": False,
            "add_dirichlet_noise": True
        }
    }#"""

    config.update_from_dict(hp_config)

    import re

    def custom_trial_name_creator(trial):
        # Generate a custom trial name with trial ID and hyperparameter config
        trial_name = f"Trial-{trial.trial_id}"

        # Access the hyperparameter config
        hyperparameters = trial.evaluated_params

        # Remove "mcts_config" prefix from parameter names
        hyperparameters = {
            re.sub(r"mcts_config", "", param): value
            for param, value in hyperparameters.items()
        }

        # Remove "custom_ model" info from parameter names
        hyperparameters = {
            re.sub(r"custom_model", "", param): value
            for param, value in hyperparameters.items()
        }

        # Convert the hyperparameters to a string representation
        hyperparameters_str = "_".join([f"{param}-{value}" for param, value in hyperparameters.items()])

        # Remove forbidden characters from the trial name
        forbidden_chars = r"[<>:\"/\\|?*]"
        trial_name = re.sub(forbidden_chars, "", trial_name)
        hyperparameters_str = re.sub(forbidden_chars, "", hyperparameters_str)

        # Append the hyperparameter config to the trial name
        trial_name += f"__{hyperparameters_str}"

        return trial_name


    cb = []
    if args.wandb:
        cb.append(
          CustomWandbLoggerCallback(
                api_key_file="wandb_api_key.txt",
                entity="mtp2023_avalanche",
                project="CurriculumLearning",
                group=log_group,
                name=args.log_as,
                log_config=True,
                save_checkpoints=True
            )
        )


    results = tune.Tuner(
        args.algo,
        run_config=air.RunConfig(
            stop=stop,
            checkpoint_config=air.CheckpointConfig(num_to_keep=4, checkpoint_frequency=3, checkpoint_at_end=True),
            local_dir=args.results_folder,
            callbacks=cb
            ),
        tune_config=tune.TuneConfig(
            mode="max",
            metric="episode_reward_mean",
            num_samples=1,
            trial_name_creator=custom_trial_name_creator
            ),
        param_space=config.to_dict()
    ).fit()

    with open("./result_eval/hp_tune_results/"+args.log_group+".pkl", "wb") as res_file:
        dill.dump(results, res_file)
        res_file.close()
