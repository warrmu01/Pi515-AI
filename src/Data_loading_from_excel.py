import pandas as pd



def load_fish_data(file_path, sheet_name=0):
    """
    Loads fish data from a specified local Excel or CSV file.

    Parameters:
    file_path (str): Path to the local file (Excel or CSV).
    sheet_name (str or int, optional): Name or index of the sheet in an Excel file. Defaults to the first sheet.

    Returns:
    pd.DataFrame: DataFrame containing the fish data.
    """
    # Determine file type and read accordingly
    if file_path.endswith(".xlsx"):
        df = pd.read_excel(file_path, sheet_name=sheet_name)  # Specify the sheet
    elif file_path.endswith(".csv"):
        df = pd.read_csv(file_path)
    else:
        raise ValueError("We don't support this format. Please use a .csv or .xlsx file.")

    return df