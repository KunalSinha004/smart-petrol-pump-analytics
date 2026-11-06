from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
import pandas as pd
from app.snowflake.mock_data import CUSTOMERS_DATA, CUSTOMER_JSON_DATA, FUEL_SALES_DATA
from app.security.auth import get_current_user, User
from app.schemas.all_schemas import CustomerCreate

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("/")
def list_customers(
    search: Optional[str] = Query(None),
    customer_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    df_sales = pd.DataFrame(FUEL_SALES_DATA)
    # Aggregate customer stats
    customer_stats = {}
    if not df_sales.empty:
        grouped = df_sales.groupby("CUSTOMER_ID").agg(
            total_visits=("SALE_ID", "count"),
            total_spent=("SALES_AMOUNT", "sum"),
            total_litres=("QUANTITY_LITRES", "sum"),
            last_visit=("SALE_DATE", "max")
        ).reset_index()
        for _, row in grouped.iterrows():
            customer_stats[row["CUSTOMER_ID"]] = {
                "total_visits": int(row["total_visits"]),
                "total_spent": float(round(row["total_spent"], 2)),
                "total_litres": float(round(row["total_litres"], 2)),
                "last_visit": str(row["last_visit"])
            }

    results = []
    for c in CUSTOMERS_DATA:
        cid = c["CUSTOMER_ID"]
        stats = customer_stats.get(cid, {
            "total_visits": 0,
            "total_spent": 0.0,
            "total_litres": 0.0,
            "last_visit": None
        })
        item = {**c, **stats}
        
        # Filtering
        if customer_type and c["CUSTOMER_TYPE"].lower() != customer_type.lower():
            continue
        if search:
            s = search.lower()
            if (s not in c["CUSTOMER_NAME"].lower() and 
                s not in c["CUSTOMER_ID"].lower() and 
                s not in c.get("PHONE", "").lower() and 
                s not in c.get("CITY", "").lower()):
                continue
        results.append(item)
    return results

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_customer(customer: CustomerCreate, current_user: User = Depends(get_current_user)):
    # Check if ID exists
    if any(c["CUSTOMER_ID"] == customer.CUSTOMER_ID for c in CUSTOMERS_DATA):
        raise HTTPException(status_code=400, detail="Customer with this ID already exists")
    
    new_c = customer.model_dump()
    CUSTOMERS_DATA.append(new_c)
    return new_c

@router.get("/json-records")
def get_json_records(current_user: User = Depends(get_current_user)):
    """Semi-structured JSON VARIANT records stored in CUSTOMER_DATA.CUSTOMER_JSON_DATA"""
    return CUSTOMER_JSON_DATA
