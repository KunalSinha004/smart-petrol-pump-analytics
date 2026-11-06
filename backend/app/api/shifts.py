from typing import Optional, List
from fastapi import APIRouter, Depends
from app.snowflake.mock_data import SHIFTS_DATA
from app.security.auth import get_current_user, User

router = APIRouter(prefix="/shifts", tags=["Shifts"])

@router.get("/")
def list_shifts(current_user: User = Depends(get_current_user)):
    return SHIFTS_DATA
