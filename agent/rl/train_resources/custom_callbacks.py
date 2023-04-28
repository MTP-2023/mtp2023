from ray.rllib.algorithms.callbacks import DefaultCallbacks
from ray.rllib.algorithms.alpha_zero.alpha_zero import AlphaZeroDefaultCallbacks
from ray.rllib.algorithms import Algorithm

class CustomCallbacks(AlphaZeroDefaultCallbacks):

    def __init__(self, env_setup, alphazero, curriculum):
        self.current_level = env_setup["start_level"]
        self.num_levels = len(env_setup["training_levels"])
        self.curriculum_threshold = env_setup["curriculum_threshold"]
        self.alphazero = alphazero
        self.curriculum = curriculum

    def on_episode_start(self, *, worker, base_env, policies, episode, env_index, **kwargs):
        if self.alphazero:
            super().on_episode_start(worker, base_env, policies, episode, **kwargs)

    def on_episode_step(self, *, worker, base_env, policies, episode, env_index, **kwargs) -> None:
        print("HERE")
        return super().on_episode_step(worker=worker, base_env=base_env, policies=policies, episode=episode, env_index=env_index, **kwargs)

    def on_episode_end(self, *, worker, base_env, policies, episode, env_index, **kwargs) -> None:
        print("DONE")
        return super().on_episode_end(worker=worker, base_env=base_env, policies=policies, episode=episode, env_index=env_index, **kwargs)

    def on_train_result(self, *, algorithm: "Algorithm", result: dict, **kwargs) -> None:
        print("RESULT", result)

        if self.curriculum:
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