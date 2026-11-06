from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.snowflake.mock_data import FUEL_SALES_DATA, FUEL_TYPES_DATA
from app.security.auth import get_current_user, User
from app.schemas.all_schemas import FuelSaleCreate

router = APIRouter(prefix="/sales", tags=["Fuel Sales"])

@router.get("/")
def list_sales(
    pump_id: Optional[str] = Query(None),
    fuel_type_id: Optional[str] = Query(None),
    operator_id: Optional[str] = Query(None),
    payment_method: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_user)
):
    results = list(FUEL_SALES_DATA)
    if pump_id:
        results = [s for s in results if s.get("PUMP_ID") == pump_id]
    if fuel_type_id:
        results = [s for s in results if s.get("FUEL_TYPE_ID") == fuel_type_id]
    if operator_id:
        results = [s for s in results if s.get("OPERATOR_ID") == operator_id]
    if payment_method:
        results = [s for s in results if s.get("PAYMENT_METHOD") == payment_method]
    if start_date:
        results = [s for s in results if str(s.get("SALE_DATE")) >= start_date]
    if end_date:
        results = [s for s in results if str(s.get("SALE_DATE")) <= end_date]

    # Sort descending by date & sale ID
    results.sort(key=lambda x: (str(x.get("SALE_DATE")), str(x.get("SALE_ID"))), reverse=True)
    return results[:limit]

@router.post("/", status_code=status.HTTP_201_CREATED)
def record_sale(sale: FuelSaleCreate, current_user: User = Depends(get_current_user)):
    # Auto-generate sale ID
    new_id = f"S{len(FUEL_SALES_DATA) + 1:04d}"
    
    # Calculate costs and profits
    fuel = next((f for f in FUEL_TYPES_DATA if f["FUEL_TYPE_ID"] == sale.FUEL_TYPE_ID), None)
    cost_per_unit = fuel["PURCHASE_COST"] if fuel else (sale.SELLING_PRICE * 0.9)
    sales_amount = round(sale.QUANTITY_LITRES * sale.SELLING_PRICE, 2)
    fuel_cost = round(sale.QUANTITY_LITRES * cost_per_unit, 2)
    gross_profit = round(sales_amount - fuel_cost, 2)
    
    new_sale = {
        "SALE_ID": new_id,
        "SHIFT_ID": sale.SHIFT_ID,
        "SALE_DATE": sale.SALE_DATE,
        "SHIFT_TYPE": sale.SHIFT_TYPE,
        "PUMP_ID": sale.PUMP_ID,
        "OPERATOR_ID": sale.OPERATOR_ID,
        "MANAGER_ID": sale.MANAGER_ID,
        "CUSTOMER_ID": sale.CUSTOMER_ID,
        "FUEL_TYPE_ID": sale.FUEL_TYPE_ID,
        "QUANTITY_LITRES": sale.QUANTITY_LITRES,
        "SELLING_PRICE": sale.SELLING_PRICE,
        "SALES_AMOUNT": sales_amount,
        "FUEL_COST": fuel_cost,
        "GROSS_PROFIT": gross_profit,
        "PAYMENT_METHOD": sale.PAYMENT_METHOD
    }
    FUEL_SALES_DATA.insert(0, new_sale)
    return new_sale
