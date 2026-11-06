from typing import List
from fastapi import APIRouter, Depends, HTTPException
import pandas as pd
from app.snowflake.mock_data import PUMPS_DATA, FUEL_SALES_DATA
from app.security.auth import get_current_user, User
from app.schemas.all_schemas import PumpStatusUpdate

router = APIRouter(prefix="/pumps", tags=["Pumps"])

@router.get("/")
def list_pumps(current_user: User = Depends(get_current_user)):
    df_sales = pd.DataFrame(FUEL_SALES_DATA)
    pump_stats = {}
    if not df_sales.empty:
        grouped = df_sales.groupby("PUMP_ID").agg(
            total_txns=("SALE_ID", "count"),
            total_revenue=("SALES_AMOUNT", "sum"),
            total_litres=("QUANTITY_LITRES", "sum")
        ).reset_index()
        for _, r in grouped.iterrows():
            pump_stats[r["PUMP_ID"]] = {
                "total_txns": int(r["total_txns"]),
                "total_revenue": float(round(r["total_revenue"], 2)),
                "total_litres": float(round(r["total_litres"], 2))
            }

    results = []
    for p in PUMPS_DATA:
        pid = p["PUMP_ID"]
        st = pump_stats.get(pid, {"total_txns": 0, "total_revenue": 0.0, "total_litres": 0.0})
        results.append({**p, **st})
    return results

@router.patch("/{pump_id}/status")
def update_pump_status(
    pump_id: str,
    update: PumpStatusUpdate,
    current_user: User = Depends(get_current_user)
):
    pump = next((p for p in PUMPS_DATA if p["PUMP_ID"] == pump_id), None)
    if not pump:
        raise HTTPException(status_code=404, detail="Pump not found")
    
    status_upper = update.status.upper()
    if status_upper not in ["ACTIVE", "MAINTENANCE", "OFFLINE"]:
        raise HTTPException(status_code=400, detail="Invalid status value")
    
    pump["STATUS"] = status_upper
    return pump
