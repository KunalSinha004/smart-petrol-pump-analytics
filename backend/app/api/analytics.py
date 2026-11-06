from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.analytics.forecasting import forecasting_service
from app.analytics.anomalies import anomaly_service
from app.security.auth import get_current_user, User

router = APIRouter(prefix="/analytics", tags=["Analytics & Forecasting"])

@router.get("/forecast")
def get_sales_forecast(
    days: int = Query(14, ge=7, le=30),
    fuel_type_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    return forecasting_service.generate_sales_forecast(days_ahead=days, fuel_type_id=fuel_type_id)

@router.get("/anomalies")
def get_detected_anomalies(current_user: User = Depends(get_current_user)):
    return anomaly_service.detect_anomalies()
