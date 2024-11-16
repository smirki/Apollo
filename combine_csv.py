import os
import pandas as pd

def combine_csv_files(folder_path, output_file):
    # Create a list to store the dataframes
    all_dataframes = []
    
    # Iterate through all files in the folder
    for filename in os.listdir(folder_path):
        if filename.endswith('.csv'):
            file_path = os.path.join(folder_path, filename)
            # Read the CSV file
            df = pd.read_csv(file_path)
            all_dataframes.append(df)
    
    # Concatenate all dataframes into one
    combined_df = pd.concat(all_dataframes, ignore_index=True)
    
    # Write the combined dataframe to a new CSV file
    combined_df.to_csv(output_file, index=False)
    print(f"Combined {len(all_dataframes)} CSV files into '{output_file}'.")

# Example usage
folder_path = 'input'  # Change this to your folder path
output_file = 'combined_output.csv'       # Name of the output file
combine_csv_files(folder_path, output_file)
