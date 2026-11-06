from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
import pandas as pd
from app.snowflake.mock_data import EXPENSES_DATA, FUEL_SALES_DATA
from app.security.auth import get_current_user, User
from app.schemas.all_schemas import ExpenseCreate

router = APIRouter(prefix="/expenses", tags=["Expenses & Profit"])

@router.get("/")
def list_expenses(current_user: User = Depends(get_current_user)):
    results = list(EXPENSES_DATA)
    results.sort(key=lambda x: str(x.get("EXPENSE_DATE")), reverse=True)
    return results

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_expense(expense: ExpenseCreate, current_user: User = Depends(get_current_user)):
    new_id = f"EX{len(EXPENSES_DATA) + 1:03d}"
    new_expense = {
        "EXPENSE_ID": new_id,
        "EXPENSE_DATE": expense.EXPENSE_DATE,
        "EXPENSE_TYPE": expense.EXPENSE_TYPE,
        "DESCRIPTION": expense.DESCRIPTION,
        "AMOUNT": round(expense.AMOUNT, 2)
    }
    EXPENSES_DATA.insert(0, new_expense)
    return new_expense

@router.get("/profit-summary")
def get_daily_profit_summary(current_user: User = Depends(get_current_user)):
    """Corresponds to SALES_MANAGEMENT.DAILY_PROFIT_SUMMARY"""
    df_sales = pd.DataFrame(FUEL_SALES_DATA)
    df_exp = pd.DataFrame(EXPENSES_DATA)

    sales_daily = df_sales.groupby("SALE_DATE").agg(
        TOTAL_LITRES=("QUANTITY_LITRES", "sum"),
        SALES_REVENUE=("SALES_AMOUNT", "sum"),
        FUEL_COST=("FUEL_COST", "sum"),
        GROSS_PROFIT=("GROSS_PROFIT", "sum"),
        TRANSACTIONS=("SALE_ID", "count")
    ).reset_index()

    exp_daily = df_exp.groupby("EXPENSE_DATE").agg(
        OPERATING_EXPENSE=("AMOUNT", "sum")
    ).reset_index().rename(columns={"EXPENSE_DATE": "SALE_DATE"})

    merged = pd.merge(sales_daily, exp_daily, on="SALE_DATE", how="left")
    merged["OPERATING_EXPENSE"] = merged["OPERATING_EXPENSE"].fillna(0)
    merged["NET_PROFIT"] = merged["GROSS_PROFIT"] - merged["OPERATING_EXPENSE"]
    merged["MARGIN_PCT"] = (merged["NET_PROFIT"] / merged["SALES_REVENUE"] * 100).round(2)

    merged["TOTAL_LITRES"] = merged["TOTAL_LITRES"].round(2)
    merged["SALES_REVENUE"] = merged["SALES_REVENUE"].round(2)
    merged["FUEL_COST"] = merged["FUEL_COST"].round(2)
    merged["GROSS_PROFIT"] = merged["GROSS_PROFIT"].round(2)
    merged["NET_PROFIT"] = merged["NET_PROFIT"].round(2)

    return merged.sort_values("SALE_DATE", ascending=False).to_dict(orient="records")
