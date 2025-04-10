import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_percentage_error
from xgboost import XGBRegressor
from sklearn.model_selection import GridSearchCV
import numpy as np

from Data_Preparation.Transparency_data_preparation import create_transparency_pipeline, prepare_am_transparency_data, prepare_pm_transparency_data

def evaluate_xgb(X_train, y_train, X_dev, y_dev):
    print("Evaluating XGBoost Regressor...")

    # Define the hyperparameter grid search to try combinations of these hyperparameters.
    param_grid = {
        'algo__n_estimators': [1000],
        'algo__max_depth': [2, 3, 4],
        'algo__learning_rate': [0.01, 0.05, 0.1], # smaller learning rate is possibly better as training consisitency increasees.
        'algo__subsample': [0.8, 1.0],
        # 'algo__reg_alpha': [0, 0.1, 1],               # L1 regularization (sparsity)
        # 'algo__reg_lambda': [1, 2, 5]                 # L2 regularization (shrinkage)
    }

    # This here uses the pipeline to handle missing values, scaling, encoding, etc for teh dataset.
    pipeline = create_transparency_pipeline()

    # This combines the preprocessing and XGBoost model into one clean pipeline.
    pipeline_with_algo = Pipeline(steps=[
        ('preprocessor', pipeline),
        ('algo', XGBRegressor(
            objective='reg:squarederror',
            random_state=42
        ))
    ])

    grid_search = GridSearchCV(
        pipeline_with_algo, param_grid,
        cv=5,  # 5-fold cross-validation
        scoring='neg_mean_squared_error',  
        verbose=1  # Show progress in terminal
    )
    grid_search.fit(X_train, y_train)

    # This shows us our best model based on cross-validation R² score.
    best_estimator = grid_search.best_estimator_

    # 📊 FEATURE IMPORTANCE SECTION
    try:
        model = best_estimator.named_steps["algo"]
        preprocessor = best_estimator.named_steps["preprocessor"]
        feature_names = preprocessor.get_feature_names_out()
        importances = model.feature_importances_

        feature_df = pd.DataFrame({
            "Feature": feature_names,
            "Importance": importances
        }).sort_values(by="Importance", ascending=False)

        print("\nTop 10 Most Important Features:")
        print(feature_df.head(10))
    except Exception as e:
        print("Could not extract feature importances:", e)

    # We are making predicitons on the dev set here
    y_pred = best_estimator.predict(X_dev)

    # Here we are calculating the following values
    # Calculate evaluation metrics
    rmse = np.sqrt(mean_squared_error(y_dev, y_pred))
    mape = mean_absolute_percentage_error(y_dev, y_pred)
    r2 = r2_score(y_dev, y_pred)

    # Shows you the best performance from the training phase and the hyperparameters that gave it.
    print("Grid searching is done!")
    print("Best score (neg MSE):", grid_search.best_score_)
    print("Best hyperparameters:")
    print(grid_search.best_params_)

    return best_estimator, rmse, mape, r2
# 📦 Choose either "AM Transparency" or "PM Transparency"
for target in ["AM Transparency", "PM Transparency"]:
    print(f"\n🚀 Evaluating model for: {target}")

    # Step 1: Prepare fish data for current target
    if target == "AM Transparency":
        X_train, X_dev, X_test, y_train, y_dev, y_test = prepare_am_transparency_data()
    else:
        X_train, X_dev, X_test, y_train, y_dev, y_test = prepare_pm_transparency_data()

    # Step 2: Run hyperparameter tuning
    best_model, dev_rmse, dev_mape, dev_r2 = evaluate_xgb(X_train, y_train, X_dev, y_dev)

    # 🔍 Show split sizes
    print("✅ Data Split Shapes:")
    print("  X_train:", X_train.shape)
    print("  X_dev:", X_dev.shape)
    print("  X_test:", X_test.shape)
    print("  y_train:", y_train.shape)
    print("  y_dev:", y_dev.shape)
    print("  y_test:", y_test.shape)

    # Step 3: Predict on all sets
    y_train_pred = best_model.predict(X_train)
    y_dev_pred = best_model.predict(X_dev)
    y_test_pred = best_model.predict(X_test)

    # Step 4: Metric evaluation function
    def evaluate_metrics(y_true, y_pred, label):
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        mape = mean_absolute_percentage_error(y_true, y_pred)
        r2 = r2_score(y_true, y_pred)
        mean_target = np.mean(y_true)
        print(f"\n📊 {label} Set Performance for {target}:")
        print(f"Mean of y_{label.lower()}: {mean_target:.4f}")
        print(f"RMSE: {rmse:.4f}")
        print(f"MAPE: {mape:.4f}")
        print(f"R²: {r2:.4f}")
        return rmse, mape, r2

    # Step 5: Print results for all sets
    train_rmse, train_mape, train_r2 = evaluate_metrics(y_train, y_train_pred, "Train")
    dev_rmse, dev_mape, dev_r2 = evaluate_metrics(y_dev, y_dev_pred, "Dev")
    test_rmse, test_mape, test_r2 = evaluate_metrics(y_test, y_test_pred, "Test")