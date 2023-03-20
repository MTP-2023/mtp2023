import gymnasium as gym
from ray.rllib.env.env_context import EnvContext
from gym.spaces import Discrete, Box, Dict
import random
import numpy as np
import json
import sys
sys.path.append('../')
from simulation.simulate import run

class GameBoardEnv(gym.Env):
    """Example of a custom env in which you have to walk down a corridor.
    You can configure the length of the corridor via the env config."""

    def __init__(self, config: EnvContext):
        self.variant = config["variant"]
        self.n_steps = 0
        self.training_index = 0
        self.width = config["width"]*2+2
        self.height = config["height"]*2
        self.training_states = config["training_states"]

        self.observation_space = Dict({
            "game_board": Box(low=0, high=2, shape=(self.width, self.height), dtype=np.int8)
        })

        self.n_choices = 2*self.width
        self.action_space = Discrete(self.n_choices)

        self.current_board = self.training_states[self.training_index]["start_board"]
        self.goal_board = self.training_states[self.training_index]["goal_board"]

        """
        if config["board"]:
            self.game_board = config["board"]
        else:
            self.game_board = [[0,1,0,1,0,1,0,0],
                         [1,0,1,0,1,0,1,0],
                         [0,1,0,1,0,1,0,0],
                         [1,0,1,0,1,0,1,0]]"""
        
        # Set the seed. This is only used for the final (reach goal) reward.
        #self.reset(default=True)

    # implement how the game board initialization should work
    def reset(self, seed=None, default = False, preset = None):
        #random.seed(seed)
        #self.cur_pos = 0
        #return [self.cur_pos], {}
        
        self.n_steps = 0

        # iterate over challenges
        if self.training_index < len(self.training_states) - 1:
            self.training_index += 1
        else:
            self.training_index = 0

        # reset env to next challenge
        self.current_board = self.training_states[self.training_index]["start_board"]
        self.goal_board = self.training_states[self.training_index]["goal_board"]

    def step(self, action):
        assert action in range(self.n_choices), action

        # iterate over each row and recalculate game board status
        
        input_board = self.game_board

        # test print
        print("INPUT", input_board)

        input_board = run(action, input_board)
        self.n_steps += 1

        # test print
        print("FINAL", input_board)

        # game variant dependencies:
        # final states
        # rewards

        if self.variant == "baseline":
            reward, done = baselineReward(input_board, self.n_steps)


        result = {
            "game_board": input_board
        }

        # to be changed for actual agent training
        return result, reward, done, False, None

    def baselineReward(inputBoard, n_steps):
        done = True
        reward = 0
        for i in range(self.goal_board.shape[0]):
            for j in range(self.goal_board.shape[1]):
                if self.goal_board[i][j] == 2 or self.goal_board[i][j+1] == 2:
                    if inputBoard[i][j] != 2 and inputBoard[i][j+1] != 2:
                        done = False
                        break
            if not done:
                break
        if done:
            reward = -self.n_steps
        return reward, done


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
