from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from app.snowflake.connection import snowflake_service
from app.schemas.all_schemas import QueryRequest
from app.security.auth import get_current_user, User, require_roles

router = APIRouter(prefix="/snowflake", tags=["Snowflake Data Access"])

@router.get("/status")
def get_snowflake_status(current_user: User = Depends(get_current_user)):
    return snowflake_service.get_status()

@router.post("/query")
def run_snowflake_query(request: QueryRequest, current_user: User = Depends(require_roles(["ADMIN", "MANAGER", "ANALYST"]))):
    try:
        res = snowflake_service.execute_query(request.sql, request.params)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query execution error: {str(e)}")

@router.get("/views")
def list_analytical_views(current_user: User = Depends(get_current_user)):
    return {
        "database": "SMART_PETROL_DB",
        "warehouse": "SPPA_WH",
        "views": [
            {
                "schema": "SALES_MANAGEMENT",
                "view_name": "VW_FUEL_REVENUE",
                "purpose": "Aggregates revenue, litres sold, COGS, and profit margin by fuel grade",
                "is_secure": False,
                "status": "VALID"
            },
            {
                "schema": "SALES_MANAGEMENT",
                "view_name": "VW_OPERATOR_PERFORMANCE",
                "purpose": "Measures operator throughput, sales volume, and ticket averages",
                "is_secure": False,
                "status": "VALID"
            },
            {
                "schema": "INVENTORY_CONTROL",
                "view_name": "VW_FUEL_THEFT_ALERTS",
                "purpose": "Flags abnormal negative inventory variance and potential theft risk",
                "is_secure": True,
                "status": "VALID"
            },
            {
                "schema": "FUEL_OPERATIONS",
                "view_name": "VW_PUMP_UTILIZATION",
                "purpose": "Island and dispenser utilization metrics and active status",
                "is_secure": False,
                "status": "VALID"
            },
            {
                "schema": "CUSTOMER_DATA",
                "view_name": "VW_CUSTOMER_INSIGHTS",
                "purpose": "Customer lifetime spend, loyalty frequency, and fuel preferences",
                "is_secure": False,
                "status": "VALID"
            }
        ]
    }

@router.get("/time-travel-demo")
def demonstrate_time_travel(current_user: User = Depends(get_current_user)):
    """Simulate Snowflake's Time Travel continuous data protection feature"""
    return {
        "feature": "Snowflake Time Travel (Continuous Data Protection)",
        "sql_demonstrated": "SELECT * FROM SALES_MANAGEMENT.FUEL_SALES AT(OFFSET => -60*15);",
        "retention_period": "1 Day (Standard Edition) / Up to 90 Days (Enterprise)",
        "status": "OPERATIONAL",
        "explanation": "Allows querying point-in-time state of FUEL_SALES prior to recent transactions or unintended updates without requiring snapshot backups.",
        "sample_point_in_time_snapshot": {
            "snapshot_timestamp": "15 Minutes Ago",
            "active_transactions": 8,
            "consistency": "TRANSACTIONALLY_ISOLATED"
        }
    }

@router.get("/zero-copy-clone-demo")
def demonstrate_zero_copy_clone(current_user: User = Depends(get_current_user)):
    """Simulate Snowflake Zero-Copy Cloning"""
    return {
        "feature": "Zero-Copy Cloning",
        "sql_demonstrated": "CREATE TABLE SALES_MANAGEMENT.FUEL_SALES_DEV CLONE SALES_MANAGEMENT.FUEL_SALES;",
        "storage_cost": "0 GB additional physical storage until modified",
        "duration_ms": 14.2,
        "status": "INSTANTANEOUS_METADATA_CLONE",
        "explanation": "Instantly creates an isolated writable copy of production fuel sales for sandbox testing or dev/QA without duplicating underlying micro-partition storage."
    }

@router.get("/streams-tasks")
def get_streams_and_tasks(current_user: User = Depends(get_current_user)):
    """Simulate Snowflake Change Data Capture (CDC) Streams & Serverless Tasks"""
    return {
        "streams": [
            {
                "stream_name": "STM_FUEL_SALES_CDC",
                "source_table": "SALES_MANAGEMENT.FUEL_SALES",
                "type": "STANDARD (APPEND_ONLY)",
                "stale": False,
                "has_data": False,
                "purpose": "Captures real-time fuel sales dispenser events for automated ledger reconciliation"
            }
        ],
        "tasks": [
            {
                "task_name": "TSK_RECONCILE_DAILY_PROFIT",
                "schedule": "USING CRON 0 23 * * * Asia/Kolkata",
                "state": "STARTED",
                "warehouse": "SPPA_WH",
                "target_table": "SALES_MANAGEMENT.DAILY_PROFIT_SUMMARY",
                "last_run_status": "SUCCESS"
            }
        ]
    }
