def curriculum_fn(train_results, task_settable_env, env_ctx):
    current_level = task_settable_env.get_task()

    new_task = 0
    num_levels = len(env_ctx["training_levels"])
    print("NUMBER OF LEVELS", num_levels, "CURRENT LEVEL", current_level)
    print("TRAIN RESULTS", train_results)
    curriculum_threshold = env_ctx["curriculum_threshold"]
    print("REWARD: ", train_results["sampler_results"]["episode_reward_mean"])
    if train_results["sampler_results"]["episode_reward_mean"] >= curriculum_threshold:
        if current_level + 1 < num_levels:
            new_task = current_level + 1
            print("Going up a level from", current_level)
        else:
            print("Already at final level")
    return new_task
