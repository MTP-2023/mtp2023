import argparse
import gym
from gym.core import ActType, ObsType
from gym.spaces import Discrete, Box
import numpy as np
import os
import random

from ray.rllib.env import EnvContext
import ray
from ray import air, tune
from ray.rllib.env.env_context import EnvContext
from ray.rllib.models import ModelCatalog
from ray.rllib.models.tf.tf_modelv2 import TFModelV2
from ray.rllib.models.tf.fcnet import FullyConnectedNetwork
from ray.rllib.models.torch.torch_modelv2 import TorchModelV2
from ray.rllib.models.torch.fcnet import FullyConnectedNetwork as TorchFC
from ray.rllib.utils.framework import try_import_tf, try_import_torch
from ray.rllib.utils.test_utils import check_learning_achieved
from ray.tune.logger import pretty_print
from ray.tune.registry import get_trainable_cls
from ray.rllib.algorithms.ppo import PPOConfig
import warnings


tf1, tf, tfv = try_import_tf()
torch, nn = try_import_torch()

from environment import AvalancheEnv
from model import TorchCustomModel, CustomModel

class Arguments():
    # default values
    def __init__(self) -> None:
        self.run = "PPO"
        self.framework = "tf"
        self.as_test = "store_true"
        self.stop_iters = 50
        self.stop_timesteps = 100000
        self.stop_reward = 200
        self.no_tune = "store_true"
        self.local_mode = "store_true"

args = Arguments()
warnings.filterwarnings("ignore", category=DeprecationWarning)

if __name__ == "__main__":
    #args = parser.parse_args()

    print(f"Running with following CLI options: {args}")

    ray.init(local_mode=args.local_mode, num_gpus=1)

    # Can also register the env creator function explicitly with:
    # register_env("corridor", lambda config: AvalancheEnv(config))
    ModelCatalog.register_custom_model(
        "my_model", TorchCustomModel if args.framework == "torch" else CustomModel
    )

    config = (
        get_trainable_cls(args.run)
            .get_default_config()
            # or "corridor" if registered above
            .environment(env="CartPole-v1")#, render_env=True)
            .framework(args.framework)
            .rollouts(num_rollout_workers=1)
            .training(
                model={
                    "custom_model": "my_model",
                    "vf_share_layers": True,
                }
            )
            .evaluation(
            # Evaluate once per training iteration.
            evaluation_interval=1,
            # Run evaluation on (at least) two episodes
            evaluation_duration=2,
            # ... using one evaluation worker (setting this to 0 will cause
            # evaluation to run on the local evaluation worker, blocking
            # training until evaluation is done).
            evaluation_num_workers=1,
            # Special evaluation config. Keys specified here will override
            # the same keys in the main config, but only for evaluation.
            evaluation_config={
                # Render the env while evaluating.
                # Note that this will always only render the 1st RolloutWorker's
                # env and only the 1st sub-env in a vectorized env.
                "render_env": True,
            },
        )
            # Use GPUs iff `RLLIB_NUM_GPUS` env var set to > 0.
            .resources(num_gpus=int(os.environ.get("RLLIB_NUM_GPUS", "0")))
    )

    stop = {
        "training_iteration": args.stop_iters,
        "timesteps_total": args.stop_timesteps,
        "episode_reward_mean": args.stop_reward,
    }

    if args.no_tune:
        # manual training with train loop using PPO and fixed learning rate
        if args.run != "PPO":
            raise ValueError("Only support --run PPO with --no-tune.")
        print("Running manual train loop without Ray Tune.")
        # use fixed learning rate instead of grid search (needs tune)
        config.lr = 1e-3
        algo = config.build()
        # run manual training loop and print results after each iteration
        for _ in range(args.stop_iters):
            result = algo.train()
            print(pretty_print(result))
            # stop training of the target train steps or reward are reached
            if (
                    result["timesteps_total"] >= args.stop_timesteps
                    or result["episode_reward_mean"] >= args.stop_reward
            ):
                break
        algo.stop()
    else:
        # automated run with Tune and grid search and TensorBoard
        print("Training automatically with Ray Tune")
        tuner = tune.Tuner(
            args.run,
            param_space=config.to_dict(),
            run_config=air.RunConfig(stop=stop, local_dir="./results", name="test_experiment"),
        )
        results = tuner.fit()

        if args.as_test:
            print("Checking if learning goals were achieved")
            check_learning_achieved(results, args.stop_reward)

    ray.shutdown()
