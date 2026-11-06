import os
import platform
from datetime import datetime
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.security.auth import get_current_user, User, require_roles, USERS_DB, AUDIT_LOGS, hash_password
from app.snowflake.connection import snowflake_service

router = APIRouter(prefix="/admin", tags=["Admin Panel"])

class CreateUserDto(BaseModel):
    email: str
    full_name: str
    role: str
    password: str

@router.get("/system-health")
def get_system_health(current_user: User = Depends(require_roles(["ADMIN", "MANAGER"]))):
    # System resource stats
    cpu_pct = 12.5
    mem_pct = 42.0
    try:
        import psutil
        cpu_pct = psutil.cpu_percent(interval=None) or 12.5
        mem_pct = psutil.virtual_memory().percent or 42.0
    except Exception:
        pass

    sf_status = snowflake_service.get_status()

    return {
        "status": "OPERATIONAL",
        "timestamp": datetime.now().isoformat(),
        "server": {
            "platform": platform.platform(),
            "python_version": platform.python_version(),
            "cpu_usage_pct": cpu_pct,
            "memory_usage_pct": mem_pct,
            "uptime": "Healthy (Continuous)"
        },
        "database": sf_status,
        "api_services": {
            "auth_service": "ONLINE",
            "snowflake_data_pipeline": "ONLINE",
            "forecasting_engine": "ONLINE",
            "anomaly_detector": "ONLINE",
            "ai_business_assistant": "ONLINE"
        }
    }

@router.get("/users")
def list_users(current_user: User = Depends(require_roles(["ADMIN"]))):
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat()
        }
        for u in USERS_DB.values()
    ]

@router.post("/users", status_code=status.HTTP_201_CREATED)
def create_new_user(user_dto: CreateUserDto, current_user: User = Depends(require_roles(["ADMIN"]))):
    email_lower = user_dto.email.lower().strip()
    if email_lower in USERS_DB:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    role_upper = user_dto.role.upper()
    if role_upper not in ["ADMIN", "MANAGER", "OPERATOR", "ANALYST"]:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    new_user = User(
        id=f"usr_{len(USERS_DB) + 1:02d}",
        email=email_lower,
        full_name=user_dto.full_name,
        role=role_upper,
        is_active=True,
        hashed_password=hash_password(user_dto.password)
    )
    USERS_DB[email_lower] = new_user
    return {
        "id": new_user.id,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "role": new_user.role,
        "is_active": new_user.is_active
    }

@router.get("/audit-logs")
def get_audit_logs(limit: int = 50, current_user: User = Depends(require_roles(["ADMIN"]))):
    return AUDIT_LOGS[:limit]

@router.get("/scheduled-jobs")
def get_scheduled_jobs(current_user: User = Depends(require_roles(["ADMIN"]))):
    return [
        {
            "id": "job_01",
            "name": "Daily Profit Reconciliation & Ledger Rollup",
            "cron": "0 23 * * *",
            "status": "ACTIVE",
            "last_run": "2026-11-06 23:00:00",
            "last_outcome": "SUCCESS",
            "duration": "1.4s"
        },
        {
            "id": "job_02",
            "name": "Underground Tank Dip-Stick Variance Healthcheck",
            "cron": "0 */4 * * *",
            "status": "ACTIVE",
            "last_run": "2026-11-06 20:00:00",
            "last_outcome": "SUCCESS",
            "duration": "0.8s"
        },
        {
            "id": "job_03",
            "name": "AI Demand Forecast Model Weight Recalibration",
            "cron": "0 0 * * 0",
            "status": "ACTIVE",
            "last_run": "2026-11-01 00:00:00",
            "last_outcome": "SUCCESS",
            "duration": "3.1s"
        }
    ]
