from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from app.snowflake.mock_data import INVENTORY_DATA, FUEL_TYPES_DATA
from app.security.auth import get_current_user, User
from app.schemas.all_schemas import InventoryEntryCreate

router = APIRouter(prefix="/inventory", tags=["Inventory Control"])

@router.get("/")
def list_inventory(
    fuel_type_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    results = list(INVENTORY_DATA)
    if fuel_type_id:
        results = [i for i in results if i.get("FUEL_TYPE_ID") == fuel_type_id]
    results.sort(key=lambda x: str(x.get("INVENTORY_DATE")), reverse=True)
    return results

@router.get("/theft-alerts")
def get_theft_alerts(current_user: User = Depends(get_current_user)):
    """Corresponds to INVENTORY_CONTROL.VW_FUEL_THEFT_ALERTS"""
    alerts = []
    fuel_lookup = {f["FUEL_TYPE_ID"]: f["FUEL_NAME"] for f in FUEL_TYPES_DATA}
    
    for item in INVENTORY_DATA:
        var = item.get("VARIANCE_LITRES", 0)
        risk = "HIGH_THEFT_RISK" if var < -20 else ("MODERATE_LOSS" if var < -5 else "NORMAL")
        alerts.append({
            "INVENTORY_ID": item["INVENTORY_ID"],
            "INVENTORY_DATE": item["INVENTORY_DATE"],
            "FUEL_NAME": fuel_lookup.get(item["FUEL_TYPE_ID"], item["FUEL_TYPE_ID"]),
            "EXPECTED_CLOSING_LITRES": item["EXPECTED_CLOSING_LITRES"],
            "ACTUAL_CLOSING_LITRES": item["ACTUAL_CLOSING_LITRES"],
            "VARIANCE_LITRES": var,
            "THEFT_RISK": risk
        })
    return alerts

@router.post("/", status_code=status.HTTP_201_CREATED)
def record_inventory_entry(entry: InventoryEntryCreate, current_user: User = Depends(get_current_user)):
    expected = entry.OPENING_STOCK_LITRES + entry.RECEIVED_STOCK_LITRES - entry.RECORDED_SALES_LITRES
    variance = round(entry.ACTUAL_CLOSING_LITRES - expected, 2)
    inv_status = "CHECK" if abs(variance) > 15.0 else "NORMAL"
    
    new_inv = {
        "INVENTORY_ID": f"I{len(INVENTORY_DATA) + 1:03d}",
        "INVENTORY_DATE": entry.INVENTORY_DATE,
        "FUEL_TYPE_ID": entry.FUEL_TYPE_ID,
        "OPENING_STOCK_LITRES": entry.OPENING_STOCK_LITRES,
        "RECEIVED_STOCK_LITRES": entry.RECEIVED_STOCK_LITRES,
        "RECORDED_SALES_LITRES": entry.RECORDED_SALES_LITRES,
        "EXPECTED_CLOSING_LITRES": expected,
        "ACTUAL_CLOSING_LITRES": entry.ACTUAL_CLOSING_LITRES,
        "VARIANCE_LITRES": variance,
        "STATUS": inv_status
    }
    INVENTORY_DATA.insert(0, new_inv)
    return new_inv
