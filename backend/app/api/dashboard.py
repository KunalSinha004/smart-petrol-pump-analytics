from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.services.dashboard_service import dashboard_service
from app.security.auth import get_current_user, User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    kpis = dashboard_service.get_kpis(start_date, end_date)
    return kpis

@router.get("/trends")
def get_dashboard_trends(
    days: int = Query(30, ge=7, le=90),
    current_user: User = Depends(get_current_user)
):
    trends = dashboard_service.get_revenue_trends(days)
    return trends

@router.get("/fuel-breakdown")
def get_fuel_breakdown(current_user: User = Depends(get_current_user)):
    return dashboard_service.get_fuel_type_breakdown()

@router.get("/pump-performance")
def get_pump_performance(current_user: User = Depends(get_current_user)):
    return dashboard_service.get_pump_performance()
