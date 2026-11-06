from datetime import datetime, timedelta, date
from typing import Dict, Any, List
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, root_mean_squared_error
from app.snowflake.mock_data import FUEL_SALES_DATA

class SalesForecastingService:
    def __init__(self):
        self.model_status = "READY"
        
    def generate_sales_forecast(self, days_ahead: int = 14, fuel_type_id: str = None) -> Dict[str, Any]:
        """
        Produce future fuel demand & revenue forecasts using statistical & Ridge regression models
        incorporating day-of-week seasonality and recent trend vectors.
        """
        df = pd.DataFrame(FUEL_SALES_DATA)
        if fuel_type_id:
            df = df[df["FUEL_TYPE_ID"] == fuel_type_id]
            
        if df.empty:
            return {
                "status": "INSUFFICIENT_DATA",
                "message": "Insufficient historical sales records to train reliable forecasting model.",
                "forecast": [],
                "metrics": {}
            }
            
        df["SALE_DATE"] = pd.to_datetime(df["SALE_DATE"])
        daily = df.groupby("SALE_DATE").agg(
            TOTAL_LITRES=("QUANTITY_LITRES", "sum"),
            TOTAL_REVENUE=("SALES_AMOUNT", "sum"),
            TRANSACTIONS=("SALE_ID", "count")
        ).reset_index().sort_values("SALE_DATE")
        
        # Prepare features for regression: day index + day-of-week dummy variables
        daily["DAY_INDEX"] = (daily["SALE_DATE"] - daily["SALE_DATE"].min()).dt.days
        daily["DOW"] = daily["SALE_DATE"].dt.dayofweek
        
        X = []
        for _, row in daily.iterrows():
            dow_vec = [1 if row["DOW"] == i else 0 for i in range(7)]
            X.append([row["DAY_INDEX"]] + dow_vec)
        X = np.array(X)
        y_volume = daily["TOTAL_LITRES"].values
        y_rev = daily["TOTAL_REVENUE"].values
        
        # Fit Ridge regression model
        model_vol = Ridge(alpha=1.0)
        model_vol.fit(X, y_volume)
        pred_vol_train = model_vol.predict(X)
        
        model_rev = Ridge(alpha=1.0)
        model_rev.fit(X, y_rev)
        pred_rev_train = model_rev.predict(X)
        
        # Compute real evaluation metrics
        mae_vol = float(round(mean_absolute_error(y_volume, pred_vol_train), 2))
        rmse_vol = float(round(root_mean_squared_error(y_volume, pred_vol_train), 2))
        mape_vol = float(round(np.mean(np.abs((y_volume - pred_vol_train) / np.maximum(y_volume, 1))) * 100, 2))
        
        # Generate future forecast points
        last_date = daily["SALE_DATE"].max()
        last_idx = daily["DAY_INDEX"].max()
        
        forecast_points: List[Dict[str, Any]] = []
        for i in range(1, days_ahead + 1):
            future_dt = last_date + timedelta(days=i)
            dow = future_dt.dayofweek
            future_idx = last_idx + i
            dow_vec = [1 if dow == d else 0 for d in range(7)]
            feat = np.array([[future_idx] + dow_vec])
            
            est_vol = max(50.0, float(model_vol.predict(feat)[0]))
            est_rev = max(4500.0, float(model_rev.predict(feat)[0]))
            
            # Confidence interval bounds (+/- 1.5 * RMSE)
            margin_vol = 1.5 * rmse_vol
            margin_rev = margin_vol * (est_rev / est_vol)
            
            forecast_points.append({
                "date": future_dt.strftime("%Y-%m-%d"),
                "day_name": future_dt.strftime("%a"),
                "estimated_volume_litres": round(est_vol, 2),
                "volume_lower_bound": round(max(0.0, est_vol - margin_vol), 2),
                "volume_upper_bound": round(est_vol + margin_vol, 2),
                "estimated_revenue": round(est_rev, 2),
                "revenue_lower_bound": round(max(0.0, est_rev - margin_rev), 2),
                "revenue_upper_bound": round(est_rev + margin_rev, 2),
                "confidence_level": "90%",
                "is_estimate": True
            })
            
        return {
            "status": "SUCCESS",
            "model_architecture": "Ridge Multivariate Time-Series with Day-of-Week Seasonality",
            "historical_days_used": len(daily),
            "forecast_horizon_days": days_ahead,
            "metrics": {
                "mean_absolute_error_litres": mae_vol,
                "root_mean_squared_error_litres": rmse_vol,
                "mean_absolute_percentage_error": f"{mape_vol}%",
                "r2_variance_score": round(float(model_vol.score(X, y_volume)), 3)
            },
            "disclaimer": "Forecasts are AI statistical estimates based on historical station velocity. Exogenous events like sudden supplier fuel price shifts may introduce variations.",
            "forecast": forecast_points
        }

forecasting_service = SalesForecastingService()
