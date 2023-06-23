import pickle
import argparse
import pandas as pd

parser = argparse.ArgumentParser()

parser.add_argument(
    "--file",
    help="The pickle file that should be converted to an excel."
)

args = parser.parse_args()

load_file = open("./result_files/"+args.file+".pkl", "rb")
data: pd.DataFrame  = pickle.load(load_file)
load_file.close()

# remove prefix URL from col names
remove_before = "checkpoint_"
data.columns = data.columns.str.replace(r".*?" + remove_before, "")

# Split the DataFrame based on the postfix
solverate_cols = [col for col in data.columns if col.endswith('_solverate')]
average_turns_cols = [col for col in data.columns if col.endswith('_average_turns')]

# Create separate DataFrames for solverate and average_turns
df_solverate = data[solverate_cols]
df_average_turns = data[average_turns_cols]

# Remove the postfix from column names
df_solverate.columns = df_solverate.columns.str.split(':').str[0]
df_average_turns.columns = df_average_turns.columns.str.split(':').str[0]

# Create an Excel file with two sheets
with pd.ExcelWriter("./result_files/"+args.file+'.xlsx') as writer:
    df_solverate.to_excel(writer, sheet_name='solverate', index=False)
    df_average_turns.to_excel(writer, sheet_name='average_turns', index=False)