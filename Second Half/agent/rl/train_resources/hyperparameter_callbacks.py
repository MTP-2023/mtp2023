from ray.air.integrations.wandb import WandbLoggerCallback
from typing import Optional, List

class CustomWandbLoggerCallback(WandbLoggerCallback):
    def __init__(
        self,
        project: Optional[str] = None,
        group: Optional[str] = None,
        api_key_file: Optional[str] = None,
        api_key: Optional[str] = None,
        excludes: Optional[List[str]] = None,
        log_config: bool = False,
        upload_checkpoints: bool = False,
        save_checkpoints: bool = False,
        **kwargs,
    ):
        super().__init__(project, group, api_key_file, api_key, excludes, log_config, upload_checkpoints, save_checkpoints)
        self.run_name_prefix = "trial"

    def on_trial_start(self, iteration, trials, trial):
        # Append the trial ID and hyperparameters to the run name prefix
        trial_name = f"{self.run_name_prefix}_{trial.trial_id}"
        
        # Get the hyperparameters for the current trial
        hyperparameters = trial.config
        
        # Add hyperparameters to the trial name
        for param, value in hyperparameters.items():
            trial_name += f"_{param}={value}"
        
        # Set the run name in the WandbLoggerCallback
        CustomWandbLoggerCallback.run_name_prefix = trial_name