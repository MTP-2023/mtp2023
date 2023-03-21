import copy

import generateRandom
import generateGoal
import json

if __name__ == "__main__":
    width = 3
    height = 2
    marbleCount = 3
    for i in range(5):

        #width and height
        randomBoard = generateRandom.generate_random_board(width, height)
        goal = generateGoal.generateGoalState(copy.deepcopy(randomBoard), marbleCount, 10, 42, width*2, False)

        dict = {
            "width": width,
            "height": height,
            "marbles_left": 10,
            "start": randomBoard,
            "goal": goal

        }
        print(randomBoard)
        print(goal)
        json_object = json.dumps(dict, indent=4)

        with open("challenges" + str(i+1) + ".json", "w") as outfile:
            outfile.write(json_object)
