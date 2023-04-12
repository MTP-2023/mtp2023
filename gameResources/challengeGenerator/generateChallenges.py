import sys
sys.path.append('../')
from boardGenerator.generate import generate_random_board
from generateGoal import generateGoalState
import json

if __name__ == "__main__":
    width = 3
    height = 2
    minMarbles = 0
    maxMarbles = 100
    dict = {
        "width": width,
        "height": height,
        "training_levels": []
    }
    turns = [16, 14, 12, 10, 8, 6, 4]
    for max_turns in turns:
        training_states = []
        for i in range(100):
            randomBoard = generate_random_board(width, height)
            print("Generating boards with max_turns ", max_turns)
            goal = generateGoalState(randomBoard, minMarbles, maxMarbles, max_turns, 42, width*2, False)
            print(randomBoard)
            print(goal)
            training_states.append({"start_board": randomBoard, "goal_board": goal, "max_turns": max_turns})
        dict["training_levels"].append(training_states)
    json_object = json.dumps(dict, indent=4)

    with open("../../gameVariants/baseline/training/curriculumVer1" + ".json", "w") as outfile:
        outfile.write(json_object)