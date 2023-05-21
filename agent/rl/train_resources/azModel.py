from ray.rllib.models.torch.torch_modelv2 import TorchModelV2
import torch.nn as nn
from ray.rllib.algorithms.alpha_zero.models.custom_torch_models import ActorCriticModel


# Currently, this is a copy of ray.rllib.algorithms.alpha_zero.models.custom_torch_models.DenseModel that is used for debugging
# Later, this code might be adapted to implement custom models

class DefaultModel(ActorCriticModel):
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
        
        log = False
        # Print out the input tensor
        if log:
            print("CHECK Input tensor:", x)
        
        # Pass the input tensor through the shared layers
        x = self.shared_layers(x)
        
        # Print out the output of the shared layers
        if log:
            print("CHECK Shared layers output:", x)
        
        # Pass the output of the shared layers through the actor layers
        logits = self.actor_layers(x)
        
        # Print out the logits
        if log:
            print("CHECK Logits:", logits)
        
        # Pass the output of the shared layers through the critic layers
        value_out = self.critic_layers(x)
        
        # Print out the value output
        if log:
            print("CHECK Value out:", value_out)
        
        self._value_out = value_out.squeeze(1)
        return logits, state



# This is an adapted version of the above, default model class
# It reduces the amount of units per shared layer to 128

class SimplerModel(ActorCriticModel):
    def __init__(self, obs_space, action_space, num_outputs, model_config, name):
        ActorCriticModel.__init__(
            self, obs_space, action_space, num_outputs, model_config, name
        )

        self.shared_layers = nn.Sequential(
            nn.Linear(obs_space.original_space["obs"].shape[0], 128),
            nn.Linear(128, 128)
        )
        self.actor_layers = nn.Sequential(
            nn.Linear(128, action_space.n)
        )
        self.critic_layers = nn.Sequential(
            nn.Linear(128, 1)
        )
        self._value_out = None

    def forward(self, input_dict, state, seq_lens):
        x = input_dict["obs"].float()
        x = self.shared_layers(x)
        logits = self.actor_layers(x)
        value_out = self.critic_layers(x)
        self._value_out = value_out.squeeze(1)
        return logits, state
    

# This is an adapted version of the default model class
# It adds complexity by adding more layers and units to the model's architecture
class ComplexModel(ActorCriticModel):
    def __init__(self, obs_space, action_space, num_outputs, model_config, name):
        super(ComplexModel, self).__init__(obs_space, action_space, num_outputs, model_config, name)

        num_rows, num_cols = obs_space.shape

        self.shared_layers = nn.Sequential(
            nn.Linear(num_rows * num_cols, 256),
            nn.ReLU(),
            nn.Linear(256, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU()
        )
        self.actor_layers = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, num_outputs)
        )
        self.critic_layers = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1)
        )

        self._value_out = None
        self._initialize()

    def _initialize(self):
        for layer in self.shared_layers:
            if isinstance(layer, nn.Linear):
                nn.init.xavier_uniform_(layer.weight, gain=nn.init.calculate_gain("relu"))
                nn.init.constant_(layer.bias, 0.0)
        for layer in self.actor_layers:
            if isinstance(layer, nn.Linear):
                nn.init.xavier_uniform_(layer.weight)
                nn.init.constant_(layer.bias, 0.0)
        for layer in self.critic_layers:
            if isinstance(layer, nn.Linear):
                nn.init.xavier_uniform_(layer.weight)
                nn.init.constant_(layer.bias, 0.0)

    def forward(self, input_dict, state, seq_lens):
        x = input_dict["obs"].float()
        batch_size = x.size(0)
        x = x.view(batch_size, -1)
        
        shared_out = self.shared_layers(x)
        logits = self.actor_layers(shared_out)
        values = self.critic_layers(shared_out).squeeze(1)
        
        return logits, state, values