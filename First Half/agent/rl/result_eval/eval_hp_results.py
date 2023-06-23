import dill
import sys
from ray.tune.analysis import ExperimentAnalysis
from ray.tune import ResultGrid

sys.path.append("../")
sys.path.append("../../../..")

filename = "localHPtune.pkl"
thresh = 6.5
total_levels = 7

with open("./hp_tune_results/"+filename, "rb") as f:
    results: ResultGrid = dill.load(f)

    df = results.get_dataframe()
    """
    best_result_df = results.get_dataframe(
        filter_metric="episode_reward_mean", filter_mode="max"
    )
    print([el for el in best_result_df.columns if "iter" in el])
    print(best_result_df[["training_iteration", "episode_reward_mean"]])"""

    print(type(results._experiment_analysis), results._experiment_analysis.trials)
    data: ExperimentAnalysis = results._experiment_analysis._trial_dataframes

    # Iterate over results
    for i, result in enumerate(results):
        if result.error:
            print(f"Trial #{i} had an error:", result.error)
            continue
        
        #print(result)
        
        key = list(data.keys())[i]
        trial_data = data[key]
        levels_passed = 0
        for ind, row in trial_data.iterrows():
            #print(type(trial_data), type(data), type(row))
            #print(row["episode_reward_mean"])
            if row["episode_reward_mean"]>thresh:
                levels_passed += 1

        if levels_passed > total_levels:
            levels_passed = total_levels - 1

        print(
            f"Trial #{i} finished successfully at level {levels_passed+1} with a mean accuracy metric of:",
            result.metrics["episode_reward_mean"]
        )

    