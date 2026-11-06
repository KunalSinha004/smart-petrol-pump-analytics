# Snowflake Foundation & Integration Guide

## SMART PETROL PUMP ANALYTICS
### Target Database: `SMART_PETROL_DB` | Target Warehouse: `SPPA_WH`

---

## 1. Overview
The platform connects to Snowflake using `snowflake-connector-python` with connection pooling, parameterized query execution, role-based access control, and continuous data protection features.

When live Snowflake credentials are provided in `.env`, the system executes live queries on warehouse `SPPA_WH`. If unconfigured or during offline demonstration, the engine seamlessly engages a high-fidelity Snowflake compatibility layer matching the exact schema signatures and data types.

---

## 2. Snowflake Foundation Setup

Execute `database/Smart_Petrol_Pump_Full_Setup_Error_Checked.sql` in Snowsight or the Snowflake CLI:

```sql
-- 0. WAREHOUSE & DATABASE CREATION
CREATE WAREHOUSE IF NOT EXISTS SPPA_WH
  WAREHOUSE_SIZE = 'XSMALL'
  AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE
  INITIALLY_SUSPENDED = TRUE;

CREATE DATABASE IF NOT EXISTS SMART_PETROL_DB;

USE WAREHOUSE SPPA_WH;
USE DATABASE SMART_PETROL_DB;

-- 1. FIVE FUNCTIONAL SCHEMAS
CREATE SCHEMA IF NOT EXISTS CUSTOMER_DATA;
CREATE SCHEMA IF NOT EXISTS FUEL_OPERATIONS;
CREATE SCHEMA IF NOT EXISTS SALES_MANAGEMENT;
CREATE SCHEMA IF NOT EXISTS INVENTORY_CONTROL;
CREATE SCHEMA IF NOT EXISTS WORKFORCE_ANALYTICS;
```

---

## 3. Schema and Table Specifications

### A. CUSTOMER_DATA
- `CUSTOMERS`: Primary key `CUSTOMER_ID`, customer names, segmentation types (Regular, Premium, Fleet), fuel preference, payment method, phone, email.
- `CUSTOMER_JSON_DATA`: Semi-structured VARIANT column `RAW_DATA` storing schemaless customer documents, fleet units, and loyalty tiers.

### B. FUEL_OPERATIONS
- `PUMPS`: Primary key `PUMP_ID`, name, island location (`Island A`, `Island B`), status (`ACTIVE`, `MAINTENANCE`, `OFFLINE`).
- `FUEL_TYPES`: Primary key `FUEL_TYPE_ID`, fuel name (Petrol, Diesel, CNG), unit price, purchase cost, profit per unit.
- `SHIFTS`: Primary key `SHIFT_ID`, date, shift type (Morning, Evening, Night), assigned operator, manager, pump coverage.

### C. SALES_MANAGEMENT
- `FUEL_SALES`: Primary key `SALE_ID`, shift ID, date, pump ID, operator ID, customer ID, fuel type, volume, sales amount, fuel cost, gross profit, payment method.
- `OPERATOR_SALES`: Staff-level transaction rollup.
- `DAILY_PROFIT_SUMMARY`: Daily revenue, fuel cost of goods sold, gross profit, operating expenses, and net profit.

### D. INVENTORY_CONTROL
- `EXPENSES`: Operating expense vouchers (Electricity, Maintenance, Salary, Logistics).
- `INVENTORY`: Underground tank dip-stick volume ledger: opening stock, deliveries received, recorded pump sales, expected closing stock, actual closing dip, and variance.

### E. WORKFORCE_ANALYTICS
- `EMPLOYEES`: Staff directory, role, shift assignment, active status.
- `SHIFT_SUMMARY`: Shift-level aggregations.
- `CLEANED_SALES`: Transient cleaned sales records.
- `LOAD_VALIDATION`: Temporary session table for validation audits.

---

## 4. Analytical Views

Create the standard views in `database/views.sql`:
1. `SALES_MANAGEMENT.VW_FUEL_REVENUE`: Aggregated litres sold, revenue, cost, profit, and margin percentage by fuel grade.
2. `SALES_MANAGEMENT.VW_OPERATOR_PERFORMANCE`: Throughput, total revenue, gross profit, and average ticket size per operator.
3. `INVENTORY_CONTROL.VW_FUEL_THEFT_ALERTS`: Calculates negative variances exceeding safe evaporative allowances and flags `HIGH_THEFT_RISK`.
4. `FUEL_OPERATIONS.VW_PUMP_UTILIZATION`: Island and pump volume throughput.
5. `CUSTOMER_DATA.VW_CUSTOMER_INSIGHTS`: Customer loyalty visit count and lifetime spend.

---

## 5. Advanced Snowflake Features Demonstrated
- **Time Travel**: Continuous Data Protection point-in-time state inspection (`SELECT * FROM SALES_MANAGEMENT.FUEL_SALES AT(OFFSET => -60*15)`).
- **Zero-Copy Cloning**: Metadata-based instant table duplication without physical micro-partition copy (`CREATE TABLE FUEL_SALES_DEV CLONE FUEL_SALES`).
- **Semi-Structured VARIANT Extraction**: Dot-notation JSON access (`RAW_DATA:customer_id::VARCHAR`).
- **CDC Streams & Tasks**: Append-only sales event streams and automated daily reconciliation tasks.
