from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# --- AUTH SCHEMAS ---
class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserCreate(BaseModel):
    email: str
    full_name: str
    role: str
    password: str

# --- CUSTOMER SCHEMAS ---
class CustomerBase(BaseModel):
    CUSTOMER_ID: str
    CUSTOMER_NAME: str
    CUSTOMER_TYPE: str
    FUEL_PREFERENCE: str
    PAYMENT_METHOD: str
    CITY: str
    PHONE: str
    EMAIL: str
    CREATED_DATE: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

# --- SALES SCHEMAS ---
class FuelSaleCreate(BaseModel):
    SHIFT_ID: str
    SALE_DATE: str
    SHIFT_TYPE: str
    PUMP_ID: str
    OPERATOR_ID: str
    MANAGER_ID: str
    CUSTOMER_ID: str
    FUEL_TYPE_ID: str
    QUANTITY_LITRES: float
    SELLING_PRICE: float
    PAYMENT_METHOD: str

class FuelSaleResponse(BaseModel):
    SALE_ID: str
    SHIFT_ID: str
    SALE_DATE: str
    SHIFT_TYPE: str
    PUMP_ID: str
    OPERATOR_ID: str
    MANAGER_ID: str
    CUSTOMER_ID: str
    FUEL_TYPE_ID: str
    QUANTITY_LITRES: float
    SELLING_PRICE: float
    SALES_AMOUNT: float
    FUEL_COST: float
    GROSS_PROFIT: float
    PAYMENT_METHOD: str

# --- PUMPS SCHEMAS ---
class PumpStatusUpdate(BaseModel):
    status: str

# --- INVENTORY SCHEMAS ---
class InventoryEntryCreate(BaseModel):
    INVENTORY_DATE: str
    FUEL_TYPE_ID: str
    OPENING_STOCK_LITRES: float
    RECEIVED_STOCK_LITRES: float
    RECORDED_SALES_LITRES: float
    ACTUAL_CLOSING_LITRES: float

# --- EXPENSE SCHEMAS ---
class ExpenseCreate(BaseModel):
    EXPENSE_DATE: str
    EXPENSE_TYPE: str
    DESCRIPTION: str
    AMOUNT: float

# --- SNOWFLAKE QUERY SCHEMAS ---
class QueryRequest(BaseModel):
    sql: str
    params: Optional[Dict[str, Any]] = None

class AIQueryRequest(BaseModel):
    question: str
