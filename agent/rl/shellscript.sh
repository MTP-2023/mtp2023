#!/bin/sh 
python -u ./train.py --train_on curriculumVer2 --results_folder gpu_testtt --stop_reward 13 --curriculum_threshold 6.5 --num_cpus 0 --num_gpus 2 --log_as gpu_testt --variant baseline --curriculum ray
