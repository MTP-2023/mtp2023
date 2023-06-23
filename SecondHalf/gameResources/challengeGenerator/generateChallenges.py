import copy
import sys
sys.path.append('../')
from SecondHalf.gameResources.boardGenerator.generate import generate_random_board
from generateGoal import generateGoalState
import json

def check_existing(states, start, goal):
    for j in range(len(states)):
        if states[j]["start_board"] == start and states[j]["goal_board"] == goal:
            return True
    return False
def check_train(train_set, start, goal):
    for level in train_set["training_levels"]:
        for challenge in level:
            if challenge["start_board"] == start:
                if challenge["goal_board"] == goal:
                    return True
    return False


def merge(goal, goal2, width, height):
    result = copy.deepcopy(goal)
    for i in range(height * 2):
        uneven = 0
        if i % 2 != 0:
            uneven = 1
        j = 0
        while j < (width - uneven) * 2:
            if goal2[i][j] == 2 or goal2[i][j+1] == 2:
                if goal[i][j] == 2 or goal[i][j + 1] == 2:
                    result[i][j] = 3
                else:
                    result[i][j] = -2
            j += 2
    return result




if __name__ == "__main__":
    width = 3
    height = 2
    minMarbles = 2
    maxMarbles = 2
    train_set = []
    #train_set = json.load(open("../../gameVariants/baseline/training/curriculum2Marbles" + ".json"))
    train_set = {}
    dict = {
        "width": width,
        "height": height,
        "training_levels": []
    }

    turns = [16, 14, 12, 10, 8, 6, 4]
    for max_turns in turns:
        starts = []
        goals = []
        training_states = []
        for i in range(500):
            randomBoard = generate_random_board(width, height)
            print("Generating boards with max_turns ", max_turns)
            goal = generateGoalState(randomBoard, minMarbles, maxMarbles, max_turns, 42, width*2, False)
            goal2 = generateGoalState(randomBoard, minMarbles, maxMarbles, max_turns, 42, width*2, False)
            print(randomBoard)
            print(goal)
            print(goal2)
            merged_goal = merge(goal, goal2, width, height)
            while check_existing(training_states, randomBoard, merged_goal):
                #or check_train(train_set, randomBoard, merged_goal):
                randomBoard = generate_random_board(width, height)
                print("Generating boards with max_turns ", max_turns)
                goal = generateGoalState(randomBoard, minMarbles, maxMarbles, max_turns, 42, width * 2, False)
                goal2 = generateGoalState(randomBoard, minMarbles, maxMarbles, max_turns, 42, width * 2, False)
                print(randomBoard)
                print(goal)
                print(goal2)
                merged_goal = merge(goal, goal2, width, height)
            print(merged_goal)
            goals.append(merged_goal)
            starts.append(randomBoard)
            training_states.append({"start_board": randomBoard, "goal_board": goal, "max_turns": max_turns})
        dict["training_levels"].append(training_states)
    json_object = json.dumps(dict, indent=4)

    with open("../../gameVariants/baseline/training/multiplayertest1" + ".json", "w") as outfile:
        outfile.write(json_object)

