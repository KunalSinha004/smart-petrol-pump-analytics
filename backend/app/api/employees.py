from typing import Optional, List
from fastapi import APIRouter, Depends
import pandas as pd
from app.snowflake.mock_data import EMPLOYEES_DATA, FUEL_SALES_DATA
from app.security.auth import get_current_user, User

router = APIRouter(prefix="/employees", tags=["Workforce Analytics"])

@router.get("/")
def list_employees(current_user: User = Depends(get_current_user)):
    df_sales = pd.DataFrame(FUEL_SALES_DATA)
    emp_stats = {}
    if not df_sales.empty:
        grouped = df_sales.groupby("OPERATOR_ID").agg(
            total_sales_amount=("SALES_AMOUNT", "sum"),
            total_litres=("QUANTITY_LITRES", "sum"),
            total_transactions=("SALE_ID", "count"),
            gross_profit=("GROSS_PROFIT", "sum")
        ).reset_index()
        for _, r in grouped.iterrows():
            emp_stats[r["OPERATOR_ID"]] = {
                "total_sales_amount": float(round(r["total_sales_amount"], 2)),
                "total_litres": float(round(r["total_litres"], 2)),
                "total_transactions": int(r["total_transactions"]),
                "gross_profit": float(round(r["gross_profit"], 2))
            }

    results = []
    for emp in EMPLOYEES_DATA:
        eid = emp["EMPLOYEE_ID"]
        st = emp_stats.get(eid, {
            "total_sales_amount": 0.0,
            "total_litres": 0.0,
            "total_transactions": 0,
            "gross_profit": 0.0
        })
        results.append({**emp, **st})
    return results

@router.get("/operator-performance")
def get_operator_performance(current_user: User = Depends(get_current_user)):
    """Corresponds to SALES_MANAGEMENT.VW_OPERATOR_PERFORMANCE"""
    df_sales = pd.DataFrame(FUEL_SALES_DATA)
    df_emp = pd.DataFrame(EMPLOYEES_DATA)
    merged = pd.merge(df_sales, df_emp, left_on="OPERATOR_ID", right_on="EMPLOYEE_ID", how="left")
    
    grouped = merged.groupby(["OPERATOR_ID", "EMPLOYEE_NAME"]).agg(
        LITRES_SOLD=("QUANTITY_LITRES", "sum"),
        REVENUE=("SALES_AMOUNT", "sum"),
        PROFIT=("GROSS_PROFIT", "sum"),
        TRANSACTIONS=("SALE_ID", "count")
    ).reset_index()
    grouped["AVG_TRANSACTION_VALUE"] = (grouped["REVENUE"] / grouped["TRANSACTIONS"]).round(2)
    grouped["LITRES_SOLD"] = grouped["LITRES_SOLD"].round(2)
    grouped["REVENUE"] = grouped["REVENUE"].round(2)
    grouped["PROFIT"] = grouped["PROFIT"].round(2)
    
    return grouped.sort_values("REVENUE", ascending=False).to_dict(orient="records")
