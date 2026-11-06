from datetime import datetime, date, timedelta
from typing import Dict, Any, List, Optional
import pandas as pd
from app.snowflake.mock_data import (
    FUEL_SALES_DATA,
    FUEL_TYPES_DATA,
    PUMPS_DATA,
    CUSTOMERS_DATA,
    EXPENSES_DATA,
    INVENTORY_DATA
)
from app.snowflake.connection import snowflake_service

class DashboardService:
    def __init__(self):
        pass

    def get_kpis(self, start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict[str, Any]:
        """Calculate executive KPI cards matching Snowflake production query definitions"""
        df_sales = pd.DataFrame(FUEL_SALES_DATA)
        df_expenses = pd.DataFrame(EXPENSES_DATA)
        df_inv = pd.DataFrame(INVENTORY_DATA)

        if start_date:
            df_sales = df_sales[df_sales["SALE_DATE"] >= start_date]
            df_expenses = df_expenses[df_expenses["EXPENSE_DATE"] >= start_date]
        if end_date:
            df_sales = df_sales[df_sales["SALE_DATE"] <= end_date]
            df_expenses = df_expenses[df_expenses["EXPENSE_DATE"] <= end_date]

        total_revenue = float(round(df_sales["SALES_AMOUNT"].sum(), 2)) if not df_sales.empty else 0.0
        total_litres = float(round(df_sales["QUANTITY_LITRES"].sum(), 2)) if not df_sales.empty else 0.0
        total_transactions = int(len(df_sales))
        total_cogs = float(round(df_sales["FUEL_COST"].sum(), 2)) if not df_sales.empty else 0.0
        gross_profit = float(round(df_sales["GROSS_PROFIT"].sum(), 2)) if not df_sales.empty else 0.0
        total_expenses = float(round(df_expenses["AMOUNT"].sum(), 2)) if not df_expenses.empty else 0.0
        net_profit = float(round(gross_profit - total_expenses, 2))

        # Distinct customers and active pumps
        distinct_customers = len(set(df_sales["CUSTOMER_ID"].dropna()))
        total_customers = len(CUSTOMERS_DATA)
        active_pumps = sum(1 for p in PUMPS_DATA if p["STATUS"] == "ACTIVE")
        total_pumps = len(PUMPS_DATA)

        # Current total closing stock across fuel types
        latest_inv = df_inv.sort_values("INVENTORY_DATE").groupby("FUEL_TYPE_ID").last().reset_index()
        total_fuel_stock = float(round(latest_inv["ACTUAL_CLOSING_LITRES"].sum(), 2)) if not latest_inv.empty else 0.0

        # Net Profit margin %
        net_margin_pct = round((net_profit / total_revenue * 100), 2) if total_revenue > 0 else 0.0

        return {
            "total_revenue": total_revenue,
            "total_fuel_sales_litres": total_litres,
            "total_transactions": total_transactions,
            "total_customers": total_customers,
            "active_transacting_customers": distinct_customers,
            "gross_profit": gross_profit,
            "total_expenses": total_expenses,
            "net_profit": net_profit,
            "net_margin_pct": net_margin_pct,
            "fuel_stock_litres": total_fuel_stock,
            "active_pumps": active_pumps,
            "total_pumps": total_pumps,
            "pump_health_pct": round((active_pumps / max(1, total_pumps) * 100), 1),
            "last_updated": datetime.now().isoformat()
        }

    def get_revenue_trends(self, days: int = 30) -> List[Dict[str, Any]]:
        """Return daily revenue and volume trajectory for charts"""
        df_sales = pd.DataFrame(FUEL_SALES_DATA)
        df_sales["SALE_DATE"] = pd.to_datetime(df_sales["SALE_DATE"])
        
        # Sort and take recent days
        daily = df_sales.groupby("SALE_DATE").agg(
            revenue=("SALES_AMOUNT", "sum"),
            litres=("QUANTITY_LITRES", "sum"),
            gross_profit=("GROSS_PROFIT", "sum"),
            transactions=("SALE_ID", "count")
        ).reset_index().sort_values("SALE_DATE")
        
        # 7-day moving average calculation
        daily["moving_avg_revenue"] = daily["revenue"].rolling(window=7, min_periods=1).mean().round(2)
        daily["revenue"] = daily["revenue"].round(2)
        daily["litres"] = daily["litres"].round(2)
        daily["gross_profit"] = daily["gross_profit"].round(2)
        daily["date_str"] = daily["SALE_DATE"].dt.strftime("%Y-%m-%d")

        return daily.to_dict(orient="records")

    def get_fuel_type_breakdown(self) -> List[Dict[str, Any]]:
        """Aggregated fuel revenue & margin breakdown"""
        df_sales = pd.DataFrame(FUEL_SALES_DATA)
        df_fuels = pd.DataFrame(FUEL_TYPES_DATA)
        merged = pd.merge(df_sales, df_fuels, on="FUEL_TYPE_ID", suffixes=("_sale", ""))
        
        grouped = merged.groupby(["FUEL_NAME", "UNIT", "SELLING_PRICE", "PURCHASE_COST"]).agg(
            revenue=("SALES_AMOUNT", "sum"),
            litres=("QUANTITY_LITRES", "sum"),
            fuel_cost=("FUEL_COST", "sum"),
            profit=("GROSS_PROFIT", "sum"),
            transactions=("SALE_ID", "count")
        ).reset_index()

        total_rev = float(grouped["revenue"].sum())
        grouped["revenue_share_pct"] = (grouped["revenue"] / max(1.0, total_rev) * 100).round(2)
        grouped["margin_pct"] = (grouped["profit"] / grouped["revenue"].replace(0, 1) * 100).round(2)
        grouped["revenue"] = grouped["revenue"].round(2)
        grouped["litres"] = grouped["litres"].round(2)
        grouped["profit"] = grouped["profit"].round(2)

        return grouped.to_dict(orient="records")

    def get_pump_performance(self) -> List[Dict[str, Any]]:
        """Dispenser throughput & island performance"""
        df_sales = pd.DataFrame(FUEL_SALES_DATA)
        df_pumps = pd.DataFrame(PUMPS_DATA)
        merged = pd.merge(df_pumps, df_sales, on="PUMP_ID", how="left")

        grouped = merged.groupby(["PUMP_ID", "PUMP_NAME", "ISLAND", "STATUS"]).agg(
            transactions=("SALE_ID", "count"),
            litres=("QUANTITY_LITRES", "sum"),
            revenue=("SALES_AMOUNT", "sum"),
            profit=("GROSS_PROFIT", "sum")
        ).reset_index()

        grouped["revenue"] = grouped["revenue"].fillna(0).round(2)
        grouped["litres"] = grouped["litres"].fillna(0).round(2)
        grouped["profit"] = grouped["profit"].fillna(0).round(2)
        grouped["transactions"] = grouped["transactions"].fillna(0).astype(int)

        return grouped.to_dict(orient="records")

dashboard_service = DashboardService()
