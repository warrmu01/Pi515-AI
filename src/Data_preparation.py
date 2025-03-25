import pandas as pd
import numpy as np

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.impute import KNNImputer

def load_fish_data():
    """
    Loads fish data from a specified local Excel file and performs feature engineering.

    Returns:
        pd.DataFrame: Preprocessed DataFrame.
    """

    def get_season(month):
        if month in [12, 1, 2]:
            return "Winter"
        elif month in [3, 4, 5]:
            return "Spring"
        elif month in [6, 7, 8]:
            return "Summer"
        else:
            return "Fall"

    df = pd.read_excel("../Data/Raw/Main_Data_edited.xlsx")

    # ✅ Convert dates and sort
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values("Date")  # required for lag and rolling

    # ✅ Feature Engineering
    df["Season"] = df["Month"].apply(get_season)
    df["Temp x Rain"] = df["Spring Temp (F)"] * df["Dec Rain"]
    df["Max Air Temp x Calmar Rain"] = df["Max air temp"] * df["Calmar Rain"]
    # df["Max Air Temp x Dec Rain"] = df["Max air temp"] * df["Dec Rain"]
    # df["Total Rain"] = df["Dec Rain"] + df["Calmar Rain"]

    df["Day of Year"] = df["Date"].dt.dayofyear

    # ✅ Convert to numeric
    df["Year class"] = pd.to_numeric(df["Year class"], errors="coerce")
    df["Year"] = pd.to_numeric(df["Year"], errors="coerce")
    df["Fish Age"] = df["Year"] - df["Year class"]

    # ✅ Lag Features (1, 3, 7 days)
    lag_features = [
        "Spring Temp (F)", "AM Transparency", "PM Transparency", "Dec Rain", "Calmar Rain"
    ]
    for col in lag_features:
        for lag in [3]:
            df[f"{col} (Lag {lag})"] = df[col].shift(lag)

    # ✅ 7-day Rolling Averages
    for col in ["Spring Temp (F)", "AM Transparency", "PM Transparency", "Dec Rain", "Calmar Rain"]:
        df[f"{col} 7-day avg"] = df[col].rolling(window=10, min_periods=1).mean()


    return df


def create_fish_pipeline():
    """
    Creates a preprocessing pipeline for fish hatchery data.
    """
    # Numerical features including lag and rolling averages
    numerical_features = [
        "Spring Temp (F)", "Max air temp", "Min air temp", "Dec Rain", "Calmar Rain",
        "# fish", "Temp x Rain", "Max Air Temp x Calmar Rain", 
        "Day of Year", "Fish Age",
        # Lag features
        "Spring Temp (F) (Lag 3)",
        "AM Transparency (Lag 3)", 
        "PM Transparency (Lag 3)", 
        "Dec Rain (Lag 3)", 
        "Calmar Rain (Lag 3)", 
        # 7-day rolling averages
        "Spring Temp (F) 7-day avg", "AM Transparency 7-day avg", "PM Transparency 7-day avg",
        "Dec Rain 7-day avg", "Calmar Rain 7-day avg"
    ]

    transparency_features = ["AM Transparency", "PM Transparency"]

    categorical_features = ["AM Feed", "PM Feed", "Season"]

    # Numeric transformer
    num_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    # KNN imputation for transparency columns
    transparency_transformer = Pipeline(steps=[
        ("imputer", KNNImputer(n_neighbors=5))
    ])

    # Categorical transformer
    cat_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore"))
    ])

    preprocessor = ColumnTransformer(transformers=[
        ("num", num_transformer, numerical_features),
        ("transparency", transparency_transformer, transparency_features),
        ("cat", cat_transformer, categorical_features),
    ])

    pipeline = Pipeline(steps=[("preprocessor", preprocessor)])
    return pipeline

def split_fish_data(df, ratios):
    """
    Splits fish data into training, dev, and test sets.
    Assumes engineered features like 'Season', 'Temp x Rain' already exist in the DataFrame.
    """
    df = df.sample(frac=1, random_state=42)


    selected_features = [
        "AM Feed", "AM Transparency", "PM Feed", "PM Transparency",
        "Spring Temp (F)", "# fish", "Dec Rain", "Max air temp", "Min air temp", "Calmar Rain",
        "Season", "Temp x Rain", "Max Air Temp x Calmar Rain",
        "Day of Year", "Fish Age",
        # Lag features
        "Spring Temp (F) (Lag 3)",
        "AM Transparency (Lag 3)", 
        "PM Transparency (Lag 3)", 
        "Dec Rain (Lag 3)", 
        "Calmar Rain (Lag 3)", 
        # Rolling averages
        "Spring Temp (F) 7-day avg", "AM Transparency 7-day avg", "PM Transparency 7-day avg",
        "Dec Rain 7-day avg", "Calmar Rain 7-day avg"
    ]

    # Drop early rows with NaNs from lag/rolling
    df = df.dropna(subset=selected_features + ["Fish survival rate"])

    X = df[selected_features]
    y = df["Fish survival rate"]

    dev_ratio, test_ratio = ratios
    dev_size = int(dev_ratio * len(X))
    test_size = int(test_ratio * len(X))

    X_train = X[:-(dev_size + test_size)]
    y_train = y[:-(dev_size + test_size)]

    X_dev = X[-(dev_size + test_size):-test_size]
    y_dev = y[-(dev_size + test_size):-test_size]

    X_test = X[-test_size:]
    y_test = y[-test_size:]

    return X_train, X_dev, X_test, y_train, y_dev, y_test

def prepare_fish_data(ratios):
    fish_data = load_fish_data()
    return split_fish_data(fish_data, ratios)