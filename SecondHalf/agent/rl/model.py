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
from ray.rllib.models.tf.misc import normc_initializer
from ray.rllib.policy.sample_batch import SampleBatch
from ray.rllib.models.modelv2 import restore_original_dimensions

tf1, tf, tfv = try_import_tf()
torch, nn = try_import_torch()

class CustomModel(TFModelV2):

    def __init__(self, obs_space, action_space, num_outputs, model_config, name):
        #print("Keras model called")
        super(CustomModel, self).__init__(
            obs_space, action_space, num_outputs, model_config, name
        )
        #print("OBSERVATION SPACE", obs_space)
        original_space = obs_space.original_space if hasattr(obs_space, "original_space") else obs_space
        #print("ORIGINAL SPACE", original_space)
        #print("ACTION SPACE", action_space)
        #print("NUM OUTPUTS", num_outputs)
        self.current_board = tf.keras.layers.Input(shape=original_space["current"].shape, name="current_board")
        self.goal_board = tf.keras.layers.Input(shape=original_space["goal"].shape, name="goal_board")
        print("CURRENT BOARD", self.current_board)
        print("GOAL BOARD", self.goal_board)
        #self.input = tf.keras.layers.Input(shape=obs_space.shape, name="input")

        self.concatenated = tf.keras.layers.Concatenate()([self.current_board, self.goal_board])
        self.flatten = tf.keras.layers.Flatten()(self.concatenated)
        #print("FLATTEN", self.flatten)
        #print("CONCATENATED", self.concatenated)
        layer_1 = tf.keras.layers.Dense(
            32,
            name="my_layer1",
            activation=tf.nn.relu,
            kernel_initializer=normc_initializer(0.01),
        )(self.flatten)
        layer_2 = tf.keras.layers.Dense(
            16,
            name="my_layer2",
            activation=tf.nn.relu,
            kernel_initializer=normc_initializer(0.01),
        )(layer_1)
        layer_3 = tf.keras.layers.Dense(
            8,
            name="my_layer3",
            activation=tf.nn.relu,
            kernel_initializer=normc_initializer(0.01),
        )(layer_2)
        layer_out = tf.keras.layers.Dense(
            num_outputs,
            name="my_out",
            activation=None,
            kernel_initializer=normc_initializer(0.01),
        )(layer_3)
        value_out = tf.keras.layers.Dense(
            1,
            name="value_out",
            activation=None,
            kernel_initializer=normc_initializer(0.01),
        )(layer_3)
        #print("LAYER 2", layer_2)
        #layer_out = tf.keras.layers.Flatten()(layer_2)
        print("LAYER OUT", layer_out)
        self.base_model = tf.keras.Model([self.current_board, self.goal_board], [layer_out, value_out])

    def forward(self, input_dict, state, seq_lens):
        if SampleBatch.OBS in input_dict and "obs_flat" in input_dict:
            orig_obs = input_dict[SampleBatch.OBS]
        else:
            orig_obs = restore_original_dimensions(input_dict[SampleBatch.OBS], self.obs_space, "tf")

        inputs = {'current_board': orig_obs["current"], 'goal_board': orig_obs["goal"]}
        model_out, self._value_out = self.base_model(inputs)
        #model_out = tf.keras.layers.Flatten()(model_out)
        print("MODEL OUT", model_out)
        return model_out, state

    def value_function(self):
        return tf.reshape(self._value_out, [-1])