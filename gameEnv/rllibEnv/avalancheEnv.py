import gymnasium as gym
from ray.rllib.env.env_context import EnvContext
from gym.spaces import Discrete, Box, Dict
import random
import numpy as np
import json
import sys
sys.path.append('../')
from simulation.simulate import run

"""
class GameBoardObj():
    def __init__(self, width = 3, height = 2, marbles_num = 10, marbles_refill = False) -> None:

        default_board = np.zeros((width*2+2, height*2))
        default_board = [[0,1,0,1,0,1,0,0],
                         [1,0,1,0,1,0,1,0],
                         [0,1,0,1,0,1,0,0],
                         [1,0,1,0,1,0,1,0]]

        self = Dict({
                "marbles_left": marbles_num,
                "marbles_refill": marbles_refill,
                # later on, think about randomizing or adding a custom
                "board_status": default_board
        })
"""

class GameBoardEnv(gym.Env):
    """Example of a custom env in which you have to walk down a corridor.
    You can configure the length of the corridor via the env config."""

    def __init__(self, config: EnvContext):
        #self.observation_space = Dict(GameBoardObj())
        self.width = config["width"]*2+2
        self.height = config["height"]*2
        self.marbles_left = config["marbles_left"]
        self.refill = config["refill"]

        self.observation_space = Dict({
            "game_board": Box(low=0, high=2, shape=(self.width, self.height), dtype=np.int8),
            "marbles_left": Discrete(config["marbles_left"])
        })

        self.n_choices = 2*self.width
        self.action_space = Discrete(self.n_choices)

        if config["board"]:
            self.game_board = config["board"]
        else:
            self.game_board = [[0,1,0,1,0,1,0,0],
                         [1,0,1,0,1,0,1,0],
                         [0,1,0,1,0,1,0,0],
                         [1,0,1,0,1,0,1,0]]
        
        #self.observation_space["game_board"] = default_board
        # define custom observation space structure
        
        # Set the seed. This is only used for the final (reach goal) reward.
        #self.reset(default=True)

    # implement how the game board initialization should work
    def reset(self, seed=None, default = False, preset = None):
        #random.seed(seed)
        #self.cur_pos = 0
        #return [self.cur_pos], {}
        if default:
            #default_board = GameBoardObj()
            #return default_board
            pass
        elif preset:
            # do something here, define interface
            return preset
        else:
            # return randomized example, to be implemented
            pass


    def step(self, action):
        assert action in range(self.n_choices), action

        # iterate over each row and recalculate game board status
        
        input_board = self.game_board
        self.marbles_left -= 1

        # test print
        print("INPUT", input_board)

        input_board = run(action, input_board)

        # test print
        print("FINAL", input_board)

        result = {
            "game_board": input_board,
            "marbles_left": self.marbles_left
        }

        # to be changed for actual agent training
        return result, 0, False, False, None



f = open('default_config.json')

default_config = json.load(f)

# TESTING
test = GameBoardEnv(default_config)
# config throws
throws = [1,2,3,5,5,5]
# perform simulation
for throw in throws:
    print("NEXT STEP, THROW", throw)
    test.step(throw)

f.close()
