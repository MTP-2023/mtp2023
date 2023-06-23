# select existing training set and reduce the # of challenges to a given size (relevant for AlphaZero adaptation)

import json
from copy import deepcopy

# specify which challenge set should be reduced
path = "../../gameVariants/baseline/training/curriculumVer2.json"

# take first x challenges of each stage
size = 200

train_dict = json.load(open(path))
challenges = train_dict["training_levels"]

less_challenges = deepcopy(train_dict)

# control prints
for i, level in enumerate(challenges):
    print(i, len(challenges[i]))
    less_challenges["training_levels"][i] = level[:size]

for i, level in enumerate(less_challenges["training_levels"]):
    print(i, len(less_challenges["training_levels"][i]))

json_object = json.dumps(less_challenges, indent=4)
# specify output name
with open('../../gameVariants/baseline/training/curriculumVer2_200.json', 'w') as f:
  f.write(json_object)