import copy

import generateRandom
import generateGoal
import json

if __name__ == "__main__":
    width = 3
    height = 2
    marbleCount = 3
    dict = {
        "width": width,
        "height": height,
        "training_states": []
    }
    for i in range(50):

        max_turns = 10
        randomBoard = generateRandom.generate_random_board(width, height)
        print("Generating boards with max_turns ", max_turns)
        goal = generateGoal.generateGoalState(copy.deepcopy(randomBoard), marbleCount, max_turns, 42, width*2, False)

        print(randomBoard)
        print(goal)
        dict["training_states"].append({"start_board": randomBoard, "goal_board": goal, "max_turns": max_turns})
    json_object = json.dumps(dict, indent=4)

    with open("../../gameVariants/baseline/training/generationTest3" + ".json", "w") as outfile:
        outfile.write(json_object)
