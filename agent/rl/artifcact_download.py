from ray.air.integrations.wandb import setup_wandb
from collections import OrderedDict

dl=False

if dl:
    run_wandb = setup_wandb(api_key_file="wandb_api_key.txt")
    artifact = run_wandb.use_artifact('mtp2023_avalanche/CurriculumLearning/checkpoint_stop125_thresh65_new_set_ray_curr:v130', type='model')
    artifact_dir = artifact.download()
    #agent = Algorithm.from_checkpoint(artifact_dir)
else:
    challenge = {
    "current": [
        [
            0,
            0,
            1,
            1,
            0,
            1,
            0,
            0
        ],
        [
            0,
            1,
            1,
            0,
            0,
            1,
            1,
            0
        ],
        [
            0,
            0,
            1,
            0,
            1,
            1,
            0,
            0
        ],
        [
            1,
            0,
            0,
            1,
            1,
            0,
            1,
            0
        ]
    ],
    "goal": [
        [
            0,
            0,
            1,
            1,
            0,
            1,
            0,
            0
        ],
        [
            0,
            1,
            0,
            1,
            0,
            1,
            2,
            0
        ],
        [
            0,
            0,
            2,
            1,
            0,
            1,
            0,
            0
        ],
        [
            0,
            2,
            0,
            1,
            0,
            1,
            1,
            0
        ]
    ]
}
    from ray.rllib.policy.policy import Policy


    # Use the `from_checkpoint` utility of the Policy class:
    #artifact_dir ='./policies/PPO_test'
    artifact_dir = "../../gameResources/trainedAgents/test/policies/default_policy"
    agent = Policy.from_checkpoint(artifact_dir)
    
    #agent = Algorithm.from_checkpoint(artifact_dir)
    #agent = torch.load(artifact_dir)
    #from gymnasium.wrappers.flatten_observation import FlattenObservation
    import numpy as np
    obs = OrderedDict()
    obs["current"] = np.array(challenge["current"])
    obs["goal"] = np.array(challenge["goal"])
    from apply_policy import return_move
    action = return_move(artifact_dir, obs)
    print(action)