def curriculum_fn(train_results, task_settable_env, env_ctx):
    current_level = task_settable_env.get_task()

    new_task = 0
    num_levels = len(env_ctx["training_levels"])
    print("NUMBER OF LEVELS", num_levels)
    curriculum_threshold = env_ctx["curriculum_threshold"]
    if train_results["sampler_results"]["episode_reward_mean"] >= curriculum_threshold:
        if current_level + 1 < num_levels:
            new_task = current_level + 1
            print("Going up a level")
        else:
            print("Already at final level")
    return new_task
