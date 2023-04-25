from ray.rllib.models.torch.torch_modelv2 import TorchModelV2
import torch.nn as nn
from ray.rllib.algorithms.alpha_zero.models.custom_torch_models import ActorCriticModel


# Currently, this is a copy of ray.rllib.algorithms.alpha_zero.models.custom_torch_models.DenseModel that is used for debugging
# Later, this code might be adapted to implement custom models

class AlphaZeroModel(ActorCriticModel):
    def __init__(self, obs_space, action_space, num_outputs, model_config, name):
        ActorCriticModel.__init__(
            self, obs_space, action_space, num_outputs, model_config, name
        )

        #print("MODEL", obs_space, action_space, num_outputs, name)

        self.shared_layers = nn.Sequential(
            nn.Linear(
                in_features=obs_space.original_space["obs"].shape[0], out_features=256
            ),
            nn.Linear(in_features=256, out_features=256),
        )
        self.actor_layers = nn.Sequential(
            nn.Linear(in_features=256, out_features=action_space.n)
        )
        self.critic_layers = nn.Sequential(nn.Linear(in_features=256, out_features=1))
        self._value_out = None

    """
    def forward(self, input_dict, state, seq_lens):
        print("CHECK Input tensor:", input_dict["obs"])
        return super().forward(input_dict, state, seq_lens)"""
    
    def forward(self, input_dict, state, seq_lens):
        x = input_dict["obs"].float()
        
        # Print out the input tensor
        print("CHECK Input tensor:", x)
        
        # Pass the input tensor through the shared layers
        x = self.shared_layers(x)
        
        # Print out the output of the shared layers
        print("CHECK Shared layers output:", x)
        
        # Pass the output of the shared layers through the actor layers
        logits = self.actor_layers(x)
        
        # Print out the logits
        print("CHECK Logits:", logits)
        
        # Pass the output of the shared layers through the critic layers
        value_out = self.critic_layers(x)
        
        # Print out the value output
        print("CHECK Value out:", value_out)
        
        self._value_out = value_out.squeeze(1)
        return logits, state
