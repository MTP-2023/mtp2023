from ray.rllib.algorithms.callbacks import DefaultCallbacks
from ray.rllib.env import BaseEnv
from ray.rllib.env.base_env import BaseEnv
from ray.rllib.policy.policy import Policy
from ray.rllib.algorithms import Algorithm

class CurriculumCallbacks(DefaultCallbacks):

    def __init__(self, env_setup):
        super().__init__()
        self.current_level = env_setup["start_level"]
        self.num_levels = len(env_setup["training_levels"])
        self.curriculum_threshold = env_setup["curriculum_threshold"]

    def on_train_result(
        self,
        *,
        algorithm: "Algorithm",
        result: dict,
        **kwargs,
    ) -> None:
        #print(pretty_print(result))
        if result["episode_reward_mean"] >= self.curriculum_threshold:
            if self.current_level + 1 < self.num_levels:
                task = self.current_level + 1
                print("Going up a level from", self.current_level)
            else:
                task = self.current_level
                print("Already at final level")
        else:
            task = self.current_level
        self.current_level = task
        algorithm.workers.foreach_worker(
            lambda ev: ev.foreach_env(
                lambda env: env.set_task(task)))