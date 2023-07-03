import json
import copy
import mcts
import simple_agent
from SecondHalf.gameVariants.multiplayer.reward import reward
from SecondHalf.gameResources.simulation.simulate import run

with open("../../gameVariants/multiplayer/training/multiplayer_train" + ".json") as json_file:
    challenges = json.load(json_file)
height = challenges['height']
width = challenges['width']

totalwins = 0
levelnumber = 0
for level in challenges['training_levels']:
    startboards = []
    endboards = []
    max_steps = []

    for i in range(len(level)):
        startboards.append(level[i]['start_board'])
        endboards.append(level[i]['goal_board'])
        max_steps.append(level[i]['max_turns'])

    startboard = 0
    endboard = 0
    max_step = 0
    levelwins = 0
    for j in range(len(startboards)):
        player = 1
        startboard = startboards[j]
        endboard = endboards[j]
        max_step = max_steps[j]
        for i in range(max_step):
            # move = mcts(copy.deepcopy(startboard), 1000, math.sqrt(2), endboard, width, height, max_step - i)
            move = mcts.mcts(copy.deepcopy(startboard), 300, 1, endboard, width*2, height*2, max_step, i, player)
            # print("making move", move)
            run(move, startboard, player, False)
            wrapper = mcts.MCTS_Wrapper(max_step, i, player, height, width, endboard, startboard)
            rew, done = reward(wrapper)
            if done:
                # print("Solved in ", i, "steps")
                totalwins += 1
                levelwins += 1
                break
            player *= -1

            move = simple_agent.get_move(width, height, startboard, endboard, player)
            run(move, startboard, player, False)
            player *= -1
        # print("finished challenge", j)
    print("level", levelnumber, ": ", levelwins, "out of", len(level), "=", levelwins / len(level) * 100, "%")
    levelnumber += 1
print('totalwins ', totalwins, 'out of', (j + 1) * len(challenges['training_levels']))
percent = totalwins / ((j + 1) * len(challenges['training_levels'])) * 100
print('percent', percent)