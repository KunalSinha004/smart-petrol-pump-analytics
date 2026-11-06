# System Architecture Specification

## Smart Petrol Pump Analytics
### AI-Powered Fuel Station Management & Business Intelligence Platform

---

## 1. High-Level Architectural Diagram

```
                                  +------------------------------------+
                                  |     React 19 + TypeScript SPA      |
                                  |  (Tailwind CSS + Framer Motion)    |
                                  +-----------------+------------------+
                                                    |
                                       HTTPS / JWT Bearer
                                                    |
                                                    v
                                  +------------------------------------+
                                  |     FastAPI Enterprise Backend     |
                                  |     REST APIs / Pydantic Models    |
                                  +--------+------------------+--------+
                                           |                  |
                    +----------------------+                  +-----------------------+
                    |                                                                 |
                    v                                                                 v
+---------------------------------------+                         +---------------------------------------+
|          Security & RBAC Layer        |                         |         AI & Analytics Engine         |
|  - Passlib/Bcrypt PBKDF2 Hashing      |                         |  - Ridge Multivariate Regression      |
|  - JWT HS256 Token Validation         |                         |  - Isolation Forest Anomaly Detection |
|  - Role Checks: Admin, Mgr, Op, Alyst |                         |  - Controlled Natural Language to SQL |
|  - Append-Only Security Audit Logs    |                         |  - Evidentiary Smart Recommendations  |
+-------------------+-------------------+                         +-------------------+-------------------+
                    |                                                                 |
                    +----------------------+                  +-----------------------+
                                           |                  |
                                           v                  v
                                  +------------------------------------+
                                  |      Snowflake Service Layer       |
                                  |  - snowflake-connector-python      |
                                  |  - Parameterized Query Guardrails  |
                                  |  - Controlled Execution Pool       |
                                  |  - High-Fidelity Simulation Engine |
                                  +-----------------+------------------+
                                                    |
                                                    v
                               +--------------------------------------------+
                               |     Snowflake Cloud Data Platform          |
                               |     Database : SMART_PETROL_DB             |
                               |     Warehouse: SPPA_WH (XSMALL)            |
                               +--------------------+-----------------------+
                                                    |
               +-------------------+----------------+--------------------+-------------------+
               |                   |                |                    |                   |
               v                   v                v                    v                   v
      +-----------------+  +----------------+  +-----------------+  +-----------------+  +---------------------+
      |  CUSTOMER_DATA  |  |FUEL_OPERATIONS |  |SALES_MANAGEMENT |  |INVENTORY_CONTROL|  | WORKFORCE_ANALYTICS |
      |  - CUSTOMERS    |  | - PUMPS        |  | - FUEL_SALES    |  | - EXPENSES      |  | - EMPLOYEES         |
      |  - CUSTOMER_    |  | - FUEL_TYPES   |  | - OPERATOR_     |  | - INVENTORY     |  | - SHIFT_SUMMARY     |
      |    JSON_DATA    |  | - SHIFTS       |  |   SALES         |  | - VW_FUEL_THEFT |  | - CLEANED_SALES     |
      |    (VARIANT)    |  | - VW_PUMP_     |  | - DAILY_PROFIT  |  |   _ALERTS       |  | - LOAD_VALIDATION   |
      |                 |  |   UTILIZATION  |  | - VW_FUEL_REV   |  +-----------------+  +---------------------+
      +-----------------+  +----------------+  | - VW_OPERATOR   |
                                               +-----------------+
```

---

## 2. Snowflake Integration Patterns

### Zero-Copy Cloning
Demonstrated in `SALES_MANAGEMENT.FUEL_SALES_DEV CLONE SALES_MANAGEMENT.FUEL_SALES`.
Zero-copy cloning references active metadata pointers without physical micro-partition byte duplication, allowing isolated dev/test sandbox environments at 0 storage cost until modified.

### Time Travel
Demonstrated in `SALES_MANAGEMENT.FUEL_SALES AT(OFFSET => -60*15)`.
Continuous Data Protection allows point-in-time recovery and transactional audit inspection up to 90 days in Snowflake Enterprise Edition.

### Semi-Structured JSON VARIANT Processing
Table `CUSTOMER_DATA.CUSTOMER_JSON_DATA` stores raw JSON payloads inside Snowflake `VARIANT` types.
Dot-notation path extraction (`RAW_DATA:customer_id::VARCHAR`) provides performant, schemaless document queries.

---

## 3. RBAC Permission Matrix

| Role | Dashboard | Sales | Pumps | Inventory | Workforce | Expenses | AI Center | Snowflake Runner | Admin Panel |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **ADMIN** | Full | Full | Full | Full | Full | Full | Full | Full (Read/Execute) | Full |
| **MANAGER**| Full | Full | Full | Full | Full | Full | Full | Read/Views | Read Health |
| **OPERATOR**| Read | Write/Record | Status Toggle | View | View | None | View | None | None |
| **ANALYST**| Full | Read | Read | Read | Read | Read | Full | Full (Read/Execute) | None |
