from ray.rllib.env.env_context import EnvContext
from ray.rllib.env.apis.task_settable_env import TaskSettableEnv
from gymnasium.spaces import Discrete, Box, Dict
import numpy as np
import importlib
import sys
#sys.path.append('../')
sys.path.append('../../')
from gameResources.simulation.simulate import run
from gameResources.boardGenerator.generate import generate_random_board
from gameResources.challengeGenerator.generateGoal import generateGoalState
from copy import deepcopy

# maybe change this import to be based on received game variant name later

#from gameVariants.baseline.reward import baselineReward

class GameBoardEnv(TaskSettableEnv):
    """Example of a custom env in which you have to walk down a corridor.
    You can configure the length of the corridor via the env config."""

    def __init__(self, config: EnvContext, level = 0, challenge_idx = 0, train = True):
        self.config = config
        self.task_level = level
        self.variant = config["variant"]
        self.n_steps = 0
        self.training_index = challenge_idx
        self.width = config["width"]*2+2
        self.height = config["height"]*2

        # if this instance is the main training object, store all challenges
        if train:
            self.training_levels = config["training_levels"]
            self.training_states = self.training_levels[self.task_level]

        self.set_challenge(config["training_levels"])

        #print(self.training_states)

        # self.observation_space = Dict({
        #     "game_board": Box(low=0, high=2, shape=(self.width, self.height), dtype=np.int8)
        # })
        self.observation_space = Dict({
            "current": Box(low=0, high=2, shape=(self.height, self.width), dtype=int),
            "goal": Box(low=0, high=2, shape=(self.height, self.width), dtype=int)
        })

        self.n_choices = 2*config["width"]
        #print("CHOICES", self.n_choices)
        self.action_space = Discrete(self.n_choices)

        reward_module = "gameVariants." + config["variant"] + ".reward"
        self.reward_module = importlib.import_module(reward_module)
        #print(self.current_board, type(self.current_board))
        #print(self.goal_board, type(self.current_board))

        # Set the seed. This is only used for the final (reach goal) reward.
        #self.reset(default=True)

    # similar to set task, but provide challenge idx as well
    def set_challenge(self, data):
        challenge = data[self.task_level][self.training_index]
        self.current_board = np.array(challenge["start_board"])
        self.goal_board = np.array(challenge["goal_board"])
        self.max_steps = challenge["max_turns"]

    # implement how the game board initialization should work
    def reset(self, *, seed=None, options=None):
        #print("reset")
        #random.seed(seed)
        #self.cur_pos = 0
        #return [self.cur_pos], {}
        
        self.n_steps = 0

        # iterate over challenges
        #if not self.online:
        if self.training_index < len(self.training_states) - 1:
            self.training_index += 1
        else:
            #print("RESET: All challenges played.")
            self.training_index = 0

            # reset env to next challenge
        self.current_board = np.array(self.training_states[self.training_index]["start_board"])
        self.goal_board = np.array(self.training_states[self.training_index]["goal_board"])
        self.max_steps = self.training_states[self.training_index]["max_turns"]

        obs = {
            "current": self.current_board,
            "goal": self.goal_board
        }

        return obs, {}

    def step(self, action):
        assert action in range(self.n_choices), action

        self.current_board = run(action, self.current_board)
        self.n_steps += 1

        # game variant dependencies:
        # final states
        # rewards

        reward, done = self.reward_module.reward(self)

        obs = {
            "current": self.current_board,
            "goal": self.goal_board
        }

        # to be changed for actual agent training
        return obs, reward, done, False, {}

    def get_task(self):
        return self.task_level

    def set_task(self, task):
        self.task_level = task
        self.training_states = self.training_levels[task]
        self.training_index = 0

    def __deepcopy__(self, memo):
        # Create a new instance of the class with the same configuration
        new_env = GameBoardEnv(config=self.config, level = self.task_level, challenge_idx = self.training_index, train=False)
        new_env.n_steps = deepcopy(self.n_steps, memo)
        new_env.current_board = deepcopy(self.current_board, memo)

        return new_env
    
class OnlineLearningEnv(GameBoardEnv):

    def __init__(self, config: EnvContext, level = 0, is_copy=False):
        self.config = config
        self.task_level = level
        self.variant = config["variant"]
        self.n_steps = 0
        self.width = config["width"] * 2 + 2
        self.height = config["height"] * 2
        self.training_levels = config["training_levels"]

        # print(self.training_states)

        # self.observation_space = Dict({
        #     "game_board": Box(low=0, high=2, shape=(self.width, self.height), dtype=np.int8)
        # })
        self.observation_space = Dict({
            "current": Box(low=0, high=2, shape=(self.height, self.width), dtype=int),
            "goal": Box(low=0, high=2, shape=(self.height, self.width), dtype=int)
        })

        self.n_choices = 2 * config["width"]
        # print("CHOICES", self.n_choices)
        self.action_space = Discrete(self.n_choices)

        reward_module = "gameVariants." + config["variant"] + ".reward"
        self.reward_module = importlib.import_module(reward_module)
        # print(self.current_board, type(self.current_board))
        # print(self.goal_board, type(self.current_board))

        # Set the seed. This is only used for the final (reach goal) reward.
        # self.reset(default=True)
        if not is_copy:
            self.generate_board()

    def generate_board(self):
        #print("GENERATING ONLINE LEARNING BOARD")
        width = int((self.width - 2) / 2)
        height = int(self.height / 2)
        # print("WIDTH AND HEIGHT", width, height)
        print(self.training_levels[self.task_level]["turnLimit"])
        start_board = generate_random_board(width, height)
        goal_board = generateGoalState(start_board, self.training_levels[self.task_level]["minMarbles"],
                                       self.training_levels[self.task_level]["maxMarbles"],
                                       self.training_levels[self.task_level]["turnLimit"],
                                       42, width * 2, False)
        self.current_board = start_board
        self.goal_board = goal_board
        self.max_steps = self.training_levels[self.task_level]["turnLimit"]

    def reset(self, *, seed=None, options=None):
        # print("reset")
        # random.seed(seed)
        # self.cur_pos = 0
        # return [self.cur_pos], {}

        self.n_steps = 0

        self.generate_board()

        obs = {
            "current": self.current_board,
            "goal": self.goal_board
        }

        return obs, {}

    def set_task(self, task):
        self.task_level = task

    def __deepcopy__(self, memo):
        # Create a new instance of the class with the same configuration
        new_env = OnlineLearningEnv(config=self.config, level=self.task_level, is_copy=True)
        new_env.n_steps = deepcopy(self.n_steps, memo)
        new_env.current_board = deepcopy(self.current_board, memo)
        new_env.goal_board = self.goal_board
        new_env.max_steps = self.max_steps

        return new_env

class SingleChallengeTestEnv(GameBoardEnv):
    def __init__(self, shallowEnv):
        self.shallowEnv = shallowEnv
        self.current_board = shallowEnv.current_board
        self.goal_board = shallowEnv.goal_board
        self.max_steps = shallowEnv.max_steps
        self.height = shallowEnv.height
        self.width = shallowEnv.width
        self.n_steps = 0
        self.n_choices = self.width-2
        self.observation_space = Dict({
            "current": Box(low=0, high=2, shape=(self.height, self.width), dtype=int),
            "goal": Box(low=0, high=2, shape=(self.height, self.width), dtype=int)
        })
        self.action_space = Discrete(self.n_choices)
        reward_module = "gameVariants." + shallowEnv.variant + ".reward"
        self.reward_module = importlib.import_module(reward_module)

    def reset(self, *, seed=None, options=None):
        self.n_steps = 0
        obs = {
            "current": self.current_board,
            "goal": self.goal_board
        }
        return obs, {}
    
    def __deepcopy__(self, memo):
        # Create a new instance of the class with the same configuration
        new_env = SingleChallengeTestEnv(self.shallowEnv)

        # Copy all attributes of the environment
        new_env.n_steps = deepcopy(self.n_steps, memo)
        new_env.current_board = deepcopy(self.current_board, memo)
        new_env.goal_board = deepcopy(self.goal_board, memo)

        return new_env