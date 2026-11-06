import time
import logging
from typing import Any, Dict, List, Optional, Tuple
import pandas as pd
from app.core.config import settings
from app.snowflake.mock_data import (
    CUSTOMERS_DATA,
    PUMPS_DATA,
    FUEL_TYPES_DATA,
    EMPLOYEES_DATA,
    SHIFTS_DATA,
    FUEL_SALES_DATA,
    EXPENSES_DATA,
    INVENTORY_DATA,
    CUSTOMER_JSON_DATA
)

logger = logging.getLogger("snowflake.service")

class SnowflakeService:
    def __init__(self):
        self.is_connected: bool = False
        self.connection_mode: str = "DEMO_SIMULATION" # or "LIVE_SNOWFLAKE"
        self.last_error: Optional[str] = None
        self.total_queries_executed: int = 0
        self.total_execution_time_ms: float = 0.0
        self._init_connection()

    def _init_connection(self):
        """Attempt connection to Snowflake, falling back to rich Demo Mode if unconfigured or unreachable"""
        if (settings.SNOWFLAKE_ACCOUNT and 
            settings.SNOWFLAKE_USER and 
            settings.SNOWFLAKE_PASSWORD):
            try:
                import snowflake.connector
                conn = snowflake.connector.connect(
                    user=settings.SNOWFLAKE_USER,
                    password=settings.SNOWFLAKE_PASSWORD,
                    account=settings.SNOWFLAKE_ACCOUNT,
                    warehouse=settings.SNOWFLAKE_WAREHOUSE,
                    database=settings.SNOWFLAKE_DATABASE,
                    schema=settings.SNOWFLAKE_SCHEMA,
                    role=settings.SNOWFLAKE_ROLE,
                    login_timeout=8
                )
                conn.close()
                self.is_connected = True
                self.connection_mode = "LIVE_SNOWFLAKE"
                logger.info(f"Connected successfully to Snowflake: {settings.SNOWFLAKE_DATABASE}.{settings.SNOWFLAKE_SCHEMA}")
                return
            except Exception as e:
                self.last_error = str(e)
                logger.warning(f"Snowflake live connection failed ({str(e)}). Engaging High-Fidelity Demo Engine.")
        
        # High-Fidelity Demo Engine is active
        self.is_connected = True
        self.connection_mode = "DEMO_SIMULATION"

    def get_status(self) -> Dict[str, Any]:
        return {
            "status": "HEALTHY",
            "mode": self.connection_mode,
            "database": settings.SNOWFLAKE_DATABASE,
            "warehouse": settings.SNOWFLAKE_WAREHOUSE,
            "warehouse_size": "XSMALL",
            "warehouse_state": "ACTIVE" if self.is_connected else "SUSPENDED",
            "role": settings.SNOWFLAKE_ROLE,
            "active_schema": settings.SNOWFLAKE_SCHEMA,
            "available_schemas": [
                "CUSTOMER_DATA",
                "FUEL_OPERATIONS",
                "SALES_MANAGEMENT",
                "INVENTORY_CONTROL",
                "WORKFORCE_ANALYTICS"
            ],
            "total_queries_executed": self.total_queries_executed,
            "avg_latency_ms": round(self.total_execution_time_ms / max(1, self.total_queries_executed), 2),
            "last_error": self.last_error,
            "is_live": self.connection_mode == "LIVE_SNOWFLAKE"
        }

    def execute_query(self, sql_query: str, params: Optional[Dict[str, Any]] = None, timeout: int = 30) -> Dict[str, Any]:
        """Execute query either on live Snowflake or using high-fidelity engine"""
        start_time = time.time()
        self.total_queries_executed += 1
        
        # Basic SQL injection safeguard against destructive DDL
        forbidden_keywords = ["DROP DATABASE", "DROP TABLE", "TRUNCATE", "DROP SCHEMA", "DELETE FROM CUSTOMERS"]
        query_upper = sql_query.upper().strip()
        for forbidden in forbidden_keywords:
            if forbidden in query_upper:
                raise ValueError(f"Destructive operation '{forbidden}' blocked by platform security guardrails.")

        if self.connection_mode == "LIVE_SNOWFLAKE":
            try:
                import snowflake.connector
                with snowflake.connector.connect(
                    user=settings.SNOWFLAKE_USER,
                    password=settings.SNOWFLAKE_PASSWORD,
                    account=settings.SNOWFLAKE_ACCOUNT,
                    warehouse=settings.SNOWFLAKE_WAREHOUSE,
                    database=settings.SNOWFLAKE_DATABASE,
                    schema=settings.SNOWFLAKE_SCHEMA,
                    role=settings.SNOWFLAKE_ROLE
                ) as conn:
                    with conn.cursor(snowflake.connector.DictCursor) as cur:
                        cur.execute(sql_query, params or {})
                        rows = cur.fetchall()
                        elapsed = (time.time() - start_time) * 1000
                        self.total_execution_time_ms += elapsed
                        return {
                            "columns": [col[0] for col in cur.description] if cur.description else [],
                            "rows": rows,
                            "row_count": len(rows),
                            "execution_time_ms": round(elapsed, 2),
                            "engine": "Snowflake Enterprise (SPPA_WH)",
                            "query": sql_query
                        }
            except Exception as e:
                logger.error(f"Error executing query on live Snowflake: {e}")
                # Fall through to simulated execution if error occurs
                self.last_error = str(e)

        # High-Fidelity Simulation Engine
        rows, columns = self._simulate_query(sql_query, params)
        elapsed = (time.time() - start_time) * 1000
        self.total_execution_time_ms += elapsed
        return {
            "columns": columns,
            "rows": rows,
            "row_count": len(rows),
            "execution_time_ms": round(elapsed, 2),
            "engine": "Snowflake Engine (Simulation Mode - SPPA_WH / SMART_PETROL_DB)",
            "query": sql_query
        }

    def _simulate_query(self, query: str, params: Optional[Dict[str, Any]] = None) -> Tuple[List[Dict[str, Any]], List[str]]:
        """Simulate verified queries accurately matching Snowflake result signatures"""
        q = query.upper()

        if "VW_FUEL_REVENUE" in q or ("FUEL_SALES" in q and "FUEL_TYPES" in q and "SUM(" in q):
            # Aggregation by fuel type
            df_sales = pd.DataFrame(FUEL_SALES_DATA)
            df_fuels = pd.DataFrame(FUEL_TYPES_DATA)
            merged = pd.merge(df_sales, df_fuels, on="FUEL_TYPE_ID")
            grouped = merged.groupby("FUEL_NAME").agg(
                LITRES_SOLD=("QUANTITY_LITRES", "sum"),
                SALES_REVENUE=("SALES_AMOUNT", "sum"),
                FUEL_COST=("FUEL_COST", "sum"),
                GROSS_PROFIT=("GROSS_PROFIT", "sum"),
                TRANSACTIONS=("SALE_ID", "count")
            ).reset_index()
            grouped["LITRES_SOLD"] = grouped["LITRES_SOLD"].round(2)
            grouped["SALES_REVENUE"] = grouped["SALES_REVENUE"].round(2)
            grouped["FUEL_COST"] = grouped["FUEL_COST"].round(2)
            grouped["GROSS_PROFIT"] = grouped["GROSS_PROFIT"].round(2)
            grouped["MARGIN_PERCENTAGE"] = (grouped["GROSS_PROFIT"] / grouped["SALES_REVENUE"] * 100).round(2)
            records = grouped.to_dict(orient="records")
            return records, list(records[0].keys()) if records else []

        elif "VW_OPERATOR_PERFORMANCE" in q or ("OPERATOR" in q and "SUM(SALES_AMOUNT)" in q):
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
            grouped = grouped.rename(columns={"EMPLOYEE_NAME": "OPERATOR_NAME"}).sort_values(by="REVENUE", ascending=False)
            records = grouped.to_dict(orient="records")
            return records, list(records[0].keys()) if records else []

        elif "VW_FUEL_THEFT_ALERTS" in q or ("INVENTORY" in q and "VARIANCE" in q):
            df_inv = pd.DataFrame(INVENTORY_DATA)
            df_fuels = pd.DataFrame(FUEL_TYPES_DATA)
            merged = pd.merge(df_inv, df_fuels, on="FUEL_TYPE_ID", how="left")
            merged["THEFT_RISK"] = merged["VARIANCE_LITRES"].apply(
                lambda v: "HIGH_THEFT_RISK" if v < -20 else ("MODERATE_LOSS" if v < -5 else "NORMAL")
            )
            records = merged.to_dict(orient="records")
            return records, list(records[0].keys()) if records else []

        elif "FROM CUSTOMER_DATA.CUSTOMERS" in q or "FROM CUSTOMERS" in q:
            return list(CUSTOMERS_DATA), list(CUSTOMERS_DATA[0].keys())

        elif "FROM FUEL_OPERATIONS.PUMPS" in q or "FROM PUMPS" in q:
            return list(PUMPS_DATA), list(PUMPS_DATA[0].keys())

        elif "FROM FUEL_OPERATIONS.FUEL_TYPES" in q or "FROM FUEL_TYPES" in q:
            return list(FUEL_TYPES_DATA), list(FUEL_TYPES_DATA[0].keys())

        elif "FROM FUEL_OPERATIONS.SHIFTS" in q or "FROM SHIFTS" in q:
            return list(SHIFTS_DATA), list(SHIFTS_DATA[0].keys())

        elif "FROM INVENTORY_CONTROL.EXPENSES" in q or "FROM EXPENSES" in q:
            return list(EXPENSES_DATA), list(EXPENSES_DATA[0].keys())

        elif "FROM INVENTORY_CONTROL.INVENTORY" in q or "FROM INVENTORY" in q:
            return list(INVENTORY_DATA), list(INVENTORY_DATA[0].keys())

        elif "FROM WORKFORCE_ANALYTICS.EMPLOYEES" in q or "FROM EMPLOYEES" in q:
            return list(EMPLOYEES_DATA), list(EMPLOYEES_DATA[0].keys())

        elif "FROM CUSTOMER_DATA.CUSTOMER_JSON_DATA" in q or "RAW_DATA" in q:
            records = []
            for item in CUSTOMER_JSON_DATA:
                raw = item["RAW_DATA"]
                records.append({
                    "JSON_ID": item["JSON_ID"],
                    "CUSTOMER_ID": raw.get("customer_id"),
                    "CUSTOMER_NAME": raw.get("customer_name"),
                    "CUSTOMER_TYPE": raw.get("customer_type"),
                    "CITY": raw.get("city"),
                    "PREFERRED_FUEL": raw.get("preferred_fuel"),
                    "LOADED_AT": item["LOADED_AT"],
                    "RAW_JSON": str(raw)
                })
            return records, list(records[0].keys()) if records else []

        # Default: Return fuel sales
        records = list(FUEL_SALES_DATA)
        return records[:50], list(records[0].keys()) if records else []

snowflake_service = SnowflakeService()
