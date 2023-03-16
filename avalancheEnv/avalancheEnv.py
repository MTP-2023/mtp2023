import gymnasium as gym
from ray.rllib.env.env_context import EnvContext
from gym.spaces import Discrete, Box, Dict
import random
import numpy as np

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
        
        start_col = action + 1
        input_board = self.game_board
        self.marbles_left -= 1

        # test print
        print("INPUT", input_board)

        # format: list of items where [current_row, col_idx] of a marble rolling down
        active_marbles = [[0, start_col]]

        while len(active_marbles) > 0:
            print(active_marbles)
            marble_update_queue = sorted(active_marbles, key=lambda element: (element[0], element[1]))
            #print(marble_update_queue)
            # iterate over each active (= falling) marble
            for marble in marble_update_queue:
                # get variales for currently updating marble
                row_idx, col_idx = marble
                row = input_board[row_idx]

                # check if switch position saves the marble
                if row[col_idx]  == 1:
                    # save marble in position
                    row[col_idx] += 1
                    active_marbles.remove(marble)

                # check if marble causes a switch toggle
                elif row[col_idx] == 0:
                    switch_col = col_idx + 1
                    # identify field which is impacted by input
                    if row_idx % 2 == 0:
                        sum_l = col_idx * 2 - 1
                        if sum_l % 4 == 3:
                            switch_col = col_idx - 1
                    else:
                        sum_l = col_idx * 2 - 1
                        if sum_l % 4 == 1:
                            switch_col = col_idx - 1
                    # update board status
                    row[col_idx] = 1

                    # check if another marble is activated by the switch toggle
                    if row[switch_col] == 2:
                        activated_marble = [row_idx, switch_col]
                        active_marbles.append(activated_marble)

                    # set value of the switch's second part to 0
                    row[switch_col] = 0

                    # update marble status
                    active_marbles[active_marbles.index(marble)][0] = row_idx + 1

                # check if marble hits another marble
                else: # = row[col_idx] == 2
                    new_col = col_idx + 1
                    if row_idx % 2 == 0:
                        sum_l = col_idx*2 - 1
                        if sum_l % 4 == 3:
                            new_col = col_idx - 1
                    else:
                        sum_l = col_idx * 2 - 1
                        if sum_l % 4 == 1:
                            new_col = col_idx - 1

                    # add the other marble to active marbles
                    activated_marble = [row_idx, col_idx]
                    active_marbles.append(activated_marble)

                    # update switch status
                    row[col_idx] = 0
                    row[new_col] = 1

                    # update marble position
                    active_marbles[active_marbles.index(marble)] = [row_idx + 1, new_col]

                # remove active marbles if they reach the bottom
                active_marbles = [marble for marble in active_marbles if marble[0] < self.height]
                # check if marble should be added to available marbles
                if self.refill:
                    self.marbles_left += 1

        # test print
        print("FINAL", input_board)

        result = {
            "game_board": input_board,
            "marbles_left": self.marbles_left
        }

        # to be changed for actual agent training
        return result, 0, False, False, None
    
default_config = {
    "width": 3, 
    "height": 2,
    "marbles_left": 10,
    "refill": False,
    # remove to use default board
    "board": [[0,1,0,0,1,1,0,0],
            [0,1,0,1,1,0,0,1],
            [0,1,0,1,0,1,0,0],
            [1,0,1,0,1,0,1,0]]
}
test = GameBoardEnv(default_config)
# config throws
throws = [1,2,3,5,5,5]
# perform simulation
for throw in throws:
    print("NEXT STEP, THROW", throw)
    test.step(throw)

   