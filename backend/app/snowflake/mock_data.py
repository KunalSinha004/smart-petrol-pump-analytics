from datetime import datetime, date, timedelta
import random

# Base starter data from Smart_Petrol_Pump_Full_Setup_Error_Checked.sql

CUSTOMERS_DATA = [
    {
        "CUSTOMER_ID": "C001",
        "CUSTOMER_NAME": "Aarav Sharma",
        "CUSTOMER_TYPE": "Regular",
        "FUEL_PREFERENCE": "Petrol",
        "PAYMENT_METHOD": "UPI",
        "CITY": "Bengaluru",
        "PHONE": "9000000001",
        "EMAIL": "aarav@example.com",
        "CREATED_DATE": "2026-10-01"
    },
    {
        "CUSTOMER_ID": "C002",
        "CUSTOMER_NAME": "Diya Rao",
        "CUSTOMER_TYPE": "Premium",
        "FUEL_PREFERENCE": "Diesel",
        "PAYMENT_METHOD": "Card",
        "CITY": "Bengaluru",
        "PHONE": "9000000002",
        "EMAIL": "diya@example.com",
        "CREATED_DATE": "2026-10-05"
    },
    {
        "CUSTOMER_ID": "C003",
        "CUSTOMER_NAME": "Rohan Das",
        "CUSTOMER_TYPE": "Fleet",
        "FUEL_PREFERENCE": "Diesel",
        "PAYMENT_METHOD": "Cash",
        "CITY": "Mysuru",
        "PHONE": "9000000003",
        "EMAIL": "rohan@example.com",
        "CREATED_DATE": "2026-10-10"
    },
    {
        "CUSTOMER_ID": "C004",
        "CUSTOMER_NAME": "Meera Nair",
        "CUSTOMER_TYPE": "Regular",
        "FUEL_PREFERENCE": "Petrol",
        "PAYMENT_METHOD": "UPI",
        "CITY": "Bengaluru",
        "PHONE": "9000000004",
        "EMAIL": "meera@example.com",
        "CREATED_DATE": "2026-10-12"
    },
    {
        "CUSTOMER_ID": "C005",
        "CUSTOMER_NAME": "Kabir Singh",
        "CUSTOMER_TYPE": "Fleet",
        "FUEL_PREFERENCE": "CNG",
        "PAYMENT_METHOD": "Card",
        "CITY": "Tumakuru",
        "PHONE": "9000000005",
        "EMAIL": "kabir@example.com",
        "CREATED_DATE": "2026-10-15"
    },
    {
        "CUSTOMER_ID": "C006",
        "CUSTOMER_NAME": "Ananya Iyer",
        "CUSTOMER_TYPE": "Regular",
        "FUEL_PREFERENCE": "Petrol",
        "PAYMENT_METHOD": "UPI",
        "CITY": "Bengaluru",
        "PHONE": "9000000006",
        "EMAIL": "ananya@example.com",
        "CREATED_DATE": "2026-10-20"
    },
    {
        "CUSTOMER_ID": "C007",
        "CUSTOMER_NAME": "Vikramaditya Hegde",
        "CUSTOMER_TYPE": "Fleet",
        "FUEL_PREFERENCE": "Diesel",
        "PAYMENT_METHOD": "Card",
        "CITY": "Bengaluru",
        "PHONE": "9000000007",
        "EMAIL": "vikram.h@transport.in",
        "CREATED_DATE": "2026-10-22"
    },
    {
        "CUSTOMER_ID": "C008",
        "CUSTOMER_NAME": "Pooja Kulkarni",
        "CUSTOMER_TYPE": "Regular",
        "FUEL_PREFERENCE": "CNG",
        "PAYMENT_METHOD": "UPI",
        "CITY": "Mysuru",
        "PHONE": "9000000008",
        "EMAIL": "pooja.k@example.com",
        "CREATED_DATE": "2026-10-25"
    }
]

PUMPS_DATA = [
    {"PUMP_ID": "P001", "PUMP_NAME": "Pump 1 - High Flow", "ISLAND": "Island A", "STATUS": "ACTIVE"},
    {"PUMP_ID": "P002", "PUMP_NAME": "Pump 2 - Dual Nozzle", "ISLAND": "Island A", "STATUS": "ACTIVE"},
    {"PUMP_ID": "P003", "PUMP_NAME": "Pump 3 - Multi Product", "ISLAND": "Island B", "STATUS": "ACTIVE"},
    {"PUMP_ID": "P004", "PUMP_NAME": "Pump 4 - Heavy Commercial", "ISLAND": "Island B", "STATUS": "MAINTENANCE"}
]

FUEL_TYPES_DATA = [
    {
        "FUEL_TYPE_ID": "F001",
        "FUEL_NAME": "Petrol",
        "UNIT": "Litre",
        "SELLING_PRICE": 105.50,
        "PURCHASE_COST": 96.00,
        "PROFIT_PER_UNIT": 9.50
    },
    {
        "FUEL_TYPE_ID": "F002",
        "FUEL_NAME": "Diesel",
        "UNIT": "Litre",
        "SELLING_PRICE": 92.30,
        "PURCHASE_COST": 84.50,
        "PROFIT_PER_UNIT": 7.80
    },
    {
        "FUEL_TYPE_ID": "F003",
        "FUEL_NAME": "CNG",
        "UNIT": "Kg",
        "SELLING_PRICE": 82.00,
        "PURCHASE_COST": 70.00,
        "PROFIT_PER_UNIT": 12.00
    }
]

EMPLOYEES_DATA = [
    {"EMPLOYEE_ID": "E001", "EMPLOYEE_NAME": "Arjun Kumar", "ROLE": "Operator", "SHIFT": "Morning", "STATUS": "ACTIVE"},
    {"EMPLOYEE_ID": "E002", "EMPLOYEE_NAME": "Neha Verma", "ROLE": "Operator", "SHIFT": "Evening", "STATUS": "ACTIVE"},
    {"EMPLOYEE_ID": "E003", "EMPLOYEE_NAME": "Vikram Rao", "ROLE": "Manager", "SHIFT": "Morning", "STATUS": "ACTIVE"},
    {"EMPLOYEE_ID": "E004", "EMPLOYEE_NAME": "Sara Khan", "ROLE": "Operator", "SHIFT": "Night", "STATUS": "ACTIVE"},
    {"EMPLOYEE_ID": "E005", "EMPLOYEE_NAME": "Manoj Das", "ROLE": "Manager", "SHIFT": "Evening", "STATUS": "ACTIVE"}
]

SHIFTS_DATA = [
    {
        "SHIFT_ID": "SH001",
        "SHIFT_DATE": "2026-11-01",
        "SHIFT_TYPE": "Morning",
        "OPERATOR_ID": "E001",
        "MANAGER_ID": "E003",
        "START_TIME": "06:00",
        "END_TIME": "14:00",
        "PUMPS_COVERED": 2,
        "STATUS": "COMPLETED"
    },
    {
        "SHIFT_ID": "SH002",
        "SHIFT_DATE": "2026-11-01",
        "SHIFT_TYPE": "Evening",
        "OPERATOR_ID": "E002",
        "MANAGER_ID": "E005",
        "START_TIME": "14:00",
        "END_TIME": "22:00",
        "PUMPS_COVERED": 2,
        "STATUS": "COMPLETED"
    },
    {
        "SHIFT_ID": "SH003",
        "SHIFT_DATE": "2026-11-02",
        "SHIFT_TYPE": "Night",
        "OPERATOR_ID": "E004",
        "MANAGER_ID": "E005",
        "START_TIME": "22:00",
        "END_TIME": "06:00",
        "PUMPS_COVERED": 2,
        "STATUS": "COMPLETED"
    },
    {
        "SHIFT_ID": "SH004",
        "SHIFT_DATE": "2026-11-02",
        "SHIFT_TYPE": "Morning",
        "OPERATOR_ID": "E001",
        "MANAGER_ID": "E003",
        "START_TIME": "06:00",
        "END_TIME": "14:00",
        "PUMPS_COVERED": 2,
        "STATUS": "COMPLETED"
    },
    {
        "SHIFT_ID": "SH005",
        "SHIFT_DATE": "2026-11-03",
        "SHIFT_TYPE": "Morning",
        "OPERATOR_ID": "E001",
        "MANAGER_ID": "E003",
        "START_TIME": "06:00",
        "END_TIME": "14:00",
        "PUMPS_COVERED": 3,
        "STATUS": "COMPLETED"
    },
    {
        "SHIFT_ID": "SH006",
        "SHIFT_DATE": "2026-11-04",
        "SHIFT_TYPE": "Evening",
        "OPERATOR_ID": "E002",
        "MANAGER_ID": "E005",
        "START_TIME": "14:00",
        "END_TIME": "22:00",
        "PUMPS_COVERED": 3,
        "STATUS": "COMPLETED"
    },
    {
        "SHIFT_ID": "SH007",
        "SHIFT_DATE": "2026-11-05",
        "SHIFT_TYPE": "Night",
        "OPERATOR_ID": "E004",
        "MANAGER_ID": "E005",
        "START_TIME": "22:00",
        "END_TIME": "06:00",
        "PUMPS_COVERED": 2,
        "STATUS": "COMPLETED"
    },
    {
        "SHIFT_ID": "SH008",
        "SHIFT_DATE": "2026-11-06",
        "SHIFT_TYPE": "Morning",
        "OPERATOR_ID": "E001",
        "MANAGER_ID": "E003",
        "START_TIME": "06:00",
        "END_TIME": "14:00",
        "PUMPS_COVERED": 3,
        "STATUS": "ACTIVE"
    }
]

# Generate realistic sales transactions across the last 30 days
def generate_seed_sales():
    base_sales = [
        {"SALE_ID":"S001","SHIFT_ID":"SH001","SALE_DATE":"2026-11-01","SHIFT_TYPE":"Morning","PUMP_ID":"P001","OPERATOR_ID":"E001","MANAGER_ID":"E003","CUSTOMER_ID":"C001","FUEL_TYPE_ID":"F001","QUANTITY_LITRES":20.00,"SELLING_PRICE":105.50,"SALES_AMOUNT":2110.00,"FUEL_COST":1920.00,"GROSS_PROFIT":190.00,"PAYMENT_METHOD":"UPI"},
        {"SALE_ID":"S002","SHIFT_ID":"SH001","SALE_DATE":"2026-11-01","SHIFT_TYPE":"Morning","PUMP_ID":"P002","OPERATOR_ID":"E001","MANAGER_ID":"E003","CUSTOMER_ID":"C002","FUEL_TYPE_ID":"F002","QUANTITY_LITRES":30.00,"SELLING_PRICE":92.30,"SALES_AMOUNT":2769.00,"FUEL_COST":2535.00,"GROSS_PROFIT":234.00,"PAYMENT_METHOD":"Card"},
        {"SALE_ID":"S003","SHIFT_ID":"SH002","SALE_DATE":"2026-11-01","SHIFT_TYPE":"Evening","PUMP_ID":"P003","OPERATOR_ID":"E002","MANAGER_ID":"E005","CUSTOMER_ID":"C003","FUEL_TYPE_ID":"F002","QUANTITY_LITRES":45.00,"SELLING_PRICE":92.30,"SALES_AMOUNT":4153.50,"FUEL_COST":3802.50,"GROSS_PROFIT":351.00,"PAYMENT_METHOD":"Cash"},
        {"SALE_ID":"S004","SHIFT_ID":"SH002","SALE_DATE":"2026-11-01","SHIFT_TYPE":"Evening","PUMP_ID":"P001","OPERATOR_ID":"E002","MANAGER_ID":"E005","CUSTOMER_ID":"C004","FUEL_TYPE_ID":"F001","QUANTITY_LITRES":15.00,"SELLING_PRICE":105.50,"SALES_AMOUNT":1582.50,"FUEL_COST":1440.00,"GROSS_PROFIT":142.50,"PAYMENT_METHOD":"UPI"},
        {"SALE_ID":"S005","SHIFT_ID":"SH003","SALE_DATE":"2026-11-02","SHIFT_TYPE":"Night","PUMP_ID":"P002","OPERATOR_ID":"E004","MANAGER_ID":"E005","CUSTOMER_ID":"C005","FUEL_TYPE_ID":"F003","QUANTITY_LITRES":18.00,"SELLING_PRICE":82.00,"SALES_AMOUNT":1476.00,"FUEL_COST":1260.00,"GROSS_PROFIT":216.00,"PAYMENT_METHOD":"Card"},
        {"SALE_ID":"S006","SHIFT_ID":"SH003","SALE_DATE":"2026-11-02","SHIFT_TYPE":"Night","PUMP_ID":"P003","OPERATOR_ID":"E004","MANAGER_ID":"E005","CUSTOMER_ID":"C001","FUEL_TYPE_ID":"F001","QUANTITY_LITRES":25.00,"SELLING_PRICE":105.50,"SALES_AMOUNT":2637.50,"FUEL_COST":2400.00,"GROSS_PROFIT":237.50,"PAYMENT_METHOD":"UPI"},
        {"SALE_ID":"S007","SHIFT_ID":"SH004","SALE_DATE":"2026-11-02","SHIFT_TYPE":"Morning","PUMP_ID":"P001","OPERATOR_ID":"E001","MANAGER_ID":"E003","CUSTOMER_ID":"C002","FUEL_TYPE_ID":"F002","QUANTITY_LITRES":40.00,"SELLING_PRICE":92.30,"SALES_AMOUNT":3692.00,"FUEL_COST":3380.00,"GROSS_PROFIT":312.00,"PAYMENT_METHOD":"Card"},
        {"SALE_ID":"S008","SHIFT_ID":"SH004","SALE_DATE":"2026-11-02","SHIFT_TYPE":"Morning","PUMP_ID":"P002","OPERATOR_ID":"E001","MANAGER_ID":"E003","CUSTOMER_ID":"C003","FUEL_TYPE_ID":"F001","QUANTITY_LITRES":12.00,"SELLING_PRICE":105.50,"SALES_AMOUNT":1266.00,"FUEL_COST":1152.00,"GROSS_PROFIT":114.00,"PAYMENT_METHOD":"Cash"}
    ]
    
    # Generate additional historical records up to current date
    random.seed(42)
    sales = list(base_sales)
    sale_idx = 9
    start_dt = date(2026, 10, 10)
    end_dt = max(date.today(), date(2026, 11, 10))
    
    curr = start_dt
    while curr <= end_dt:
        d_str = curr.isoformat()
        # 4 to 8 sales per day
        num_sales = random.randint(5, 8)
        for _ in range(num_sales):
            fuel = random.choice(FUEL_TYPES_DATA)
            # Prior to Nov 6, Pump 4 (P004) was fully active and dispenses fuel
            if curr < date(2026, 11, 6):
                pump = random.choice(PUMPS_DATA)
            else:
                # After Nov 6, P004 entered scheduled calibration maintenance
                pump = random.choice([p for p in PUMPS_DATA if p["STATUS"] == "ACTIVE"])
            operator = random.choice([e for e in EMPLOYEES_DATA if e["ROLE"] == "Operator"])
            manager = random.choice([e for e in EMPLOYEES_DATA if e["ROLE"] == "Manager"])
            cust = random.choice(CUSTOMERS_DATA)
            shift_type = random.choice(["Morning", "Evening", "Night"])
            
            qty = round(random.uniform(10.0, 55.0), 2)
            selling_price = fuel["SELLING_PRICE"]
            cost_price = fuel["PURCHASE_COST"]
            sales_amount = round(qty * selling_price, 2)
            fuel_cost = round(qty * cost_price, 2)
            gross_profit = round(sales_amount - fuel_cost, 2)
            pm = random.choice(["UPI", "Card", "Cash"])
            
            sales.append({
                "SALE_ID": f"S{sale_idx:04d}",
                "SHIFT_ID": f"SH{random.randint(1, 8):03d}",
                "SALE_DATE": d_str,
                "SHIFT_TYPE": shift_type,
                "PUMP_ID": pump["PUMP_ID"],
                "OPERATOR_ID": operator["EMPLOYEE_ID"],
                "MANAGER_ID": manager["EMPLOYEE_ID"],
                "CUSTOMER_ID": cust["CUSTOMER_ID"],
                "FUEL_TYPE_ID": fuel["FUEL_TYPE_ID"],
                "QUANTITY_LITRES": qty,
                "SELLING_PRICE": selling_price,
                "SALES_AMOUNT": sales_amount,
                "FUEL_COST": fuel_cost,
                "GROSS_PROFIT": gross_profit,
                "PAYMENT_METHOD": pm
            })
            sale_idx += 1
        curr += timedelta(days=1)
        
    return sales

FUEL_SALES_DATA = generate_seed_sales()

EXPENSES_DATA = [
    {"EXPENSE_ID": "EX001", "EXPENSE_DATE": "2026-11-01", "EXPENSE_TYPE": "Electricity", "DESCRIPTION": "Monthly electricity allocation", "AMOUNT": 1200.00},
    {"EXPENSE_ID": "EX002", "EXPENSE_DATE": "2026-11-01", "EXPENSE_TYPE": "Maintenance", "DESCRIPTION": "Pump nozzle maintenance", "AMOUNT": 800.00},
    {"EXPENSE_ID": "EX003", "EXPENSE_DATE": "2026-11-02", "EXPENSE_TYPE": "Salary", "DESCRIPTION": "Shift support expense", "AMOUNT": 1500.00},
    {"EXPENSE_ID": "EX004", "EXPENSE_DATE": "2026-11-03", "EXPENSE_TYPE": "Logistics", "DESCRIPTION": "Fuel tanker offloading freight", "AMOUNT": 950.00},
    {"EXPENSE_ID": "EX005", "EXPENSE_DATE": "2026-11-04", "EXPENSE_TYPE": "Utilities", "DESCRIPTION": "Station water and sanitation", "AMOUNT": 350.00},
    {"EXPENSE_ID": "EX006", "EXPENSE_DATE": "2026-11-05", "EXPENSE_TYPE": "Software", "DESCRIPTION": "IoT telemetry cloud subscription", "AMOUNT": 1800.00},
    {"EXPENSE_ID": "EX007", "EXPENSE_DATE": "2026-11-06", "EXPENSE_TYPE": "Maintenance", "DESCRIPTION": "Underground tank calibration check", "AMOUNT": 1100.00}
]

INVENTORY_DATA = [
    {"INVENTORY_ID": "I001", "INVENTORY_DATE": "2026-11-01", "FUEL_TYPE_ID": "F001", "OPENING_STOCK_LITRES": 5000.0, "RECEIVED_STOCK_LITRES": 1000.0, "RECORDED_SALES_LITRES": 60.0, "EXPECTED_CLOSING_LITRES": 5940.0, "ACTUAL_CLOSING_LITRES": 5925.0, "VARIANCE_LITRES": -15.0, "STATUS": "NORMAL"},
    {"INVENTORY_ID": "I002", "INVENTORY_DATE": "2026-11-01", "FUEL_TYPE_ID": "F002", "OPENING_STOCK_LITRES": 6000.0, "RECEIVED_STOCK_LITRES": 500.0, "RECORDED_SALES_LITRES": 75.0, "EXPECTED_CLOSING_LITRES": 6425.0, "ACTUAL_CLOSING_LITRES": 6390.0, "VARIANCE_LITRES": -35.0, "STATUS": "CHECK"},
    {"INVENTORY_ID": "I003", "INVENTORY_DATE": "2026-11-02", "FUEL_TYPE_ID": "F001", "OPENING_STOCK_LITRES": 5925.0, "RECEIVED_STOCK_LITRES": 500.0, "RECORDED_SALES_LITRES": 37.0, "EXPECTED_CLOSING_LITRES": 6388.0, "ACTUAL_CLOSING_LITRES": 6380.0, "VARIANCE_LITRES": -8.0, "STATUS": "NORMAL"},
    {"INVENTORY_ID": "I004", "INVENTORY_DATE": "2026-11-02", "FUEL_TYPE_ID": "F003", "OPENING_STOCK_LITRES": 1500.0, "RECEIVED_STOCK_LITRES": 300.0, "RECORDED_SALES_LITRES": 18.0, "EXPECTED_CLOSING_LITRES": 1782.0, "ACTUAL_CLOSING_LITRES": 1760.0, "VARIANCE_LITRES": -22.0, "STATUS": "CHECK"},
    {"INVENTORY_ID": "I005", "INVENTORY_DATE": "2026-11-03", "FUEL_TYPE_ID": "F001", "OPENING_STOCK_LITRES": 6380.0, "RECEIVED_STOCK_LITRES": 2000.0, "RECORDED_SALES_LITRES": 185.0, "EXPECTED_CLOSING_LITRES": 8195.0, "ACTUAL_CLOSING_LITRES": 8190.0, "VARIANCE_LITRES": -5.0, "STATUS": "NORMAL"},
    {"INVENTORY_ID": "I006", "INVENTORY_DATE": "2026-11-04", "FUEL_TYPE_ID": "F002", "OPENING_STOCK_LITRES": 6390.0, "RECEIVED_STOCK_LITRES": 1500.0, "RECORDED_SALES_LITRES": 210.0, "EXPECTED_CLOSING_LITRES": 7680.0, "ACTUAL_CLOSING_LITRES": 7635.0, "VARIANCE_LITRES": -45.0, "STATUS": "CHECK"},
    {"INVENTORY_ID": "I007", "INVENTORY_DATE": "2026-11-05", "FUEL_TYPE_ID": "F001", "OPENING_STOCK_LITRES": 8190.0, "RECEIVED_STOCK_LITRES": 0.0, "RECORDED_SALES_LITRES": 240.0, "EXPECTED_CLOSING_LITRES": 7950.0, "ACTUAL_CLOSING_LITRES": 7942.0, "VARIANCE_LITRES": -8.0, "STATUS": "NORMAL"},
    {"INVENTORY_ID": "I008", "INVENTORY_DATE": "2026-11-06", "FUEL_TYPE_ID": "F003", "OPENING_STOCK_LITRES": 1760.0, "RECEIVED_STOCK_LITRES": 1000.0, "RECORDED_SALES_LITRES": 140.0, "EXPECTED_CLOSING_LITRES": 2620.0, "ACTUAL_CLOSING_LITRES": 2615.0, "VARIANCE_LITRES": -5.0, "STATUS": "NORMAL"}
]

CUSTOMER_JSON_DATA = [
    {
        "JSON_ID": 1,
        "RAW_DATA": {
            "customer_id": "C006",
            "customer_name": "Ananya Iyer",
            "customer_type": "Regular",
            "city": "Bengaluru",
            "preferred_fuel": "Petrol",
            "loyalty_tier": "Silver",
            "points_balance": 350
        },
        "LOADED_AT": "2026-11-01T10:30:00"
    },
    {
        "JSON_ID": 2,
        "RAW_DATA": {
            "customer_id": "C007",
            "customer_name": "Vikramaditya Hegde",
            "customer_type": "Fleet",
            "city": "Bengaluru",
            "preferred_fuel": "Diesel",
            "fleet_size": 18,
            "credit_limit": 250000.0
        },
        "LOADED_AT": "2026-11-02T14:15:00"
    }
]
