# Pi515-AI

## 📁 Project Structure

```
PI515-AI/
├── Data/
│   ├── Prepared/
│   │   ├── preprocessed_test_data.xlsx
│   │   └── preprocessed_train_data.xlsx
│   └── Raw/
│       ├── Harvest_Summary.xlsx
│       ├── Main_Data.xlsx
│       └── Main_Data_edited.xlsx
│
├── Output/
├── Plots/
│
├── src/
│   ├── __pycache__/
│   │
│   ├── Data_Preparation/
│   │   ├── fish_survival_data_preparation.ipynb
│   │   ├── fish_survival_data_preparation.py
│   │   ├── Spring_temp_data_preparation.py
│   │   ├── Transparency_data_preparation.ipynb
│   │   └── Transparency_data_preparation.py
│   │
│   ├── models/
│   │   └── (trained .joblib model files go here)
│   │
│   ├── notebooks/
│   │   ├── fish_survival_model.ipynb
│   │   ├── spring_temp_model.ipynb
│   │   └── transparency_model.ipynb
│   │
│   ├── py/
│   │   ├── fish_survival_model.py
│   │   ├── spring_temp_model.py
│   │   └── transparency_model.py
│   │
│   ├── chained_model.ipynb
│   ├── DNN.ipynb
│   └── EDA.ipynb
│
├── README.md
```


## 📊 Model Performance Summary

### 🌤️ Spring Temp (F) Prediction Model (XGBoost)
- **Best Parameters**: `learning_rate=0.1`, `max_depth=4`, `n_estimators=1000`, `subsample=0.8`
- **Train Set**:
  - RMSE: **0.2974**
  - MAPE: **0.0041**
  - R²: **0.9924**
- **Dev Set**:
  - RMSE: **0.3500**
  - MAPE: **0.0047**
  - R²: **0.9896**
- **Test Set**:
  - RMSE: **0.3607**
  - MAPE: **0.0048**
  - R²: **0.9886**

---

### 🌫️ AM Transparency Prediction Model (XGBoost)
- **Best Parameters**: `learning_rate=0.1`, `max_depth=4`, `n_estimators=1000`, `subsample=0.8`
- **Train Set**:
  - RMSE: **2.0794**
  - MAPE: **0.1079**
  - R²: **0.9992**
- **Dev Set**:
  - RMSE: **5.5312**
  - MAPE: **0.1333**
  - R²: **0.9955**
- **Test Set**:
  - RMSE: **6.6780**
  - MAPE: **0.1466**
  - R²: **0.9915**

---

### 🌫️ PM Transparency Prediction Model (XGBoost)
- **Best Parameters**: `learning_rate=0.1`, `max_depth=4`, `n_estimators=1000`, `subsample=1.0`
- **Train Set**:
  - RMSE: **1.6149**
  - MAPE: **0.0869**
  - R²: **0.9994**
- **Dev Set**:
  - RMSE: **9.7851**
  - MAPE: **0.1048**
  - R²: **0.9766**
- **Test Set**:
  - RMSE: **3.8432**
  - MAPE: **0.1167**
  - R²: **0.9949**

---

### 🐟 Fish Survival Rate Prediction Model (XGBoost)
- **Best Parameters**: `learning_rate=0.1`, `max_depth=2`, `n_estimators=1000`, `subsample=1.0`
- **Train Set**:
  - RMSE: **0.2166**
  - MAPE: **0.0004**
  - R²: **0.3048**
- **Dev Set**:
  - RMSE: **0.6415**
  - MAPE: **0.0006**
  - R²: **0.0210**
- **Test Set**:
  - RMSE: **0.1934**
  - MAPE: **0.0004**
  - R²: **-0.1350**

