from typing import List
from fastapi import APIRouter, Depends
from app.snowflake.mock_data import FUEL_TYPES_DATA
from app.security.auth import get_current_user, User

router = APIRouter(prefix="/fuel-types", tags=["Fuel Types"])

@router.get("/")
def list_fuel_types(current_user: User = Depends(get_current_user)):
    return FUEL_TYPES_DATA
