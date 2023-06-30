import copy
import sys
sys.path.append('../../')
from gameResources.boardGenerator.generate import generate_random_board
from gameResources.challengeGenerator.generateGoal import generateGoalState
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
    #print(goal)
    #print(goal2)
    width = width*2+2
    result = copy.deepcopy(goal)
    for i in range(height * 2):
        #print("i",i)
        j = 0
        if i % 2 == 0:
            j = 1
        while j < width - 1:
            #print("j",j)
            if goal2[i][j] == 2:
                if goal[i][j] == 2:
                    result[i][j] = 3
                elif goal[i][j+1] == 2:
                    result[i][j+1] = 3
                elif goal[i][j] == 1:
                    result[i][j] = -2
                elif goal[i][j+1] == 1:
                    result[i][j+1] = -2
            elif goal2[i][j+1] == 2:
                if goal[i][j] == 2:
                    result[i][j] = 3
                elif goal[i][j+1] == 2:
                    result[i][j+1] = 3
                elif goal[i][j] == 1:
                    result[i][j] = -2
                elif goal[i][j+1] == 1:
                    result[i][j+1] = -2
            j += 2
    #(result)
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
        training_states = []
        for i in range(500):
            randomBoard = generate_random_board(width, height)
            print("Generating boards with max_turns ", max_turns)
            goal = generateGoalState(randomBoard, minMarbles, maxMarbles, max_turns, 42, width*2, False)
            goal2 = generateGoalState(randomBoard, minMarbles, maxMarbles, max_turns, 42, width*2, False)
            #print(randomBoard)
            #print("GOAL  ", goal)
            #print("GOAL2 ", goal2)
            merged_goal = merge(goal, goal2, width, height)
            #print("MERGED", merged_goal)
            while check_existing(training_states, randomBoard, merged_goal):
                #or check_train(train_set, randomBoard, merged_goal):
                randomBoard = generate_random_board(width, height)
                print("Generating boards with max_turns ", max_turns)
                goal = generateGoalState(randomBoard, minMarbles, maxMarbles, max_turns, 42, width * 2, False)
                goal2 = generateGoalState(randomBoard, minMarbles, maxMarbles, max_turns, 42, width * 2, False)
                #print(randomBoard)
                #print(goal)
                #print(goal2)
                merged_goal = merge(goal, goal2, width, height)
            #print(merged_goal)
            training_states.append({"start_board": randomBoard, "goal_board": merged_goal, "max_turns": max_turns})
        dict["training_levels"].append(training_states)
        #print()
        #print(dict)
    json_object = json.dumps(dict, indent=4)

    with open("../../gameVariants/multiplayer/training/multiplayer_train" + ".json", "w") as outfile:
        outfile.write(json_object)

