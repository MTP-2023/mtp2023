import generateRandom
import generateGoal
import json

if __name__ == "__main__":
    #for i in range(1):
        #width and height
        randomBoard = generateRandom.generate_random_board(3, 2)
        goal = generateGoal.generateGoalState(randomBoard, 3, 10, 42, 6, False)

        dict = {
            "start": randomBoard,
            "goal": goal
        }
        json_object = json.dumps(dict, indent=4)

        with open("challenges/ex.json", "w") as outfile:
            outfile.write(json_object)
