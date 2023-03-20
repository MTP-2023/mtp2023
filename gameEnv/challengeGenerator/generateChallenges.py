import copy

import generateRandom
import generateGoal
import json

if __name__ == "__main__":
    for i in range(5):
        #width and height
        randomBoard = generateRandom.generate_random_board(3, 2)
        goal = generateGoal.generateGoalState(copy.deepcopy(randomBoard), 3, 10, 42, 6, False)

        dict = {
            "start": randomBoard,
            "goal": goal
        }
        print(randomBoard)
        print(goal)
        json_object = json.dumps(dict, indent=4)

        with open("challenges/challenge" + str(i+1) + ".json", "w") as outfile:
            outfile.write(json_object)
