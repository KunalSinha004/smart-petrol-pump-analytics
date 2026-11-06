# SMART PETROL PUMP ANALYTICS
### AI-Powered Fuel Station Management & Business Intelligence Platform

[![Snowflake](https://img.shields.io/badge/Snowflake-SMART__PETROL__DB-00A1E9?style=flat-square&logo=snowflake&logoColor=white)](https://snowflake.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-2.0.0-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.9-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![License](https://img.shields.io/badge/License-Enterprise-059669?style=flat-square)]()

---

## 1. Executive Summary

**Smart Petrol Pump Analytics** is a production-oriented enterprise SaaS business intelligence platform engineered for fuel station operators, regional managers, and station network executives.

Built on an authentic Snowflake foundation (`SMART_PETROL_DB` and `SPPA_WH`), the platform eliminates manual dip-stick spreadsheets, mitigates underground fuel theft, predicts fuel replenishment requirements via multivariate machine learning, and allows natural-language conversational queries directly against cloud data schemas.

---

## 2. Key Modules & Capabilities

### A. Executive Analytics Dashboard
- **8 Primary KPI Metrics**: Total Revenue, Volume Dispensed (Litres), Total Transactions, Active Customer Profiles, Net Profit Post-OPEX, Operating Expenses, Closing Tank Inventory, and Active Dispenser Units.
- **7-Day Moving Average Trajectory**: Rolling window calculation from `SALES_MANAGEMENT.FUEL_SALES`.
- **Fuel Product Share & Margins**: Live visual breakdown of Petrol vs. Diesel vs. CNG revenue and profit margins.
- **Dispenser Throughput**: Island A vs. Island B comparative performance.

### B. Fuel Sales Ledger
- Full transaction history with multi-parameter filtering (Fuel grade, Dispenser pump, Operator, Payment method, Date range).
- Real-time **"Record New Sale"** modal calculating unit pricing, fuel cost, and gross profit.
- One-click export to CSV and PDF audit reports.

### C. Dispenser & Island Management
- Visual status cards for all pump units across Island A and Island B.
- Live telemetry tracking transaction counts, dispensed litres, and total revenue.
- One-click dispenser status toggle (`ACTIVE` $\leftrightarrow$ `MAINTENANCE`).

### D. Smart Inventory & Tank Telemetry
- Tank level visualization for underground tanks (Petrol, Diesel, CNG cascades).
- **Theft & Discrepancy Risk Alerts**: Powered by view `INVENTORY_CONTROL.VW_FUEL_THEFT_ALERTS` flagging variances exceeding evaporative thresholds.
- Tank dip-stick reading audit logger.

### E. Customer Intelligence & Loyalty
- Profile management for **Regular**, **Premium**, and **Commercial Fleet** accounts.
- Lifetime spend and fueling preferences tracking.
- **Snowflake Semi-Structured VARIANT Inspector**: Live viewer and dot-notation query demonstration for `CUSTOMER_DATA.CUSTOMER_JSON_DATA`.

### F. Workforce & Shift Analytics
- Operator sales leaderboard based on view `SALES_MANAGEMENT.VW_OPERATOR_PERFORMANCE`.
- Shift allocation roster (Morning, Evening, Night) with automated hours tracking.

### G. Expense & Profit Analytics
- Operating expense vouchers tracking (Electricity, Maintenance, Staff, Logistics).
- Daily profit rollup based on `SALES_MANAGEMENT.DAILY_PROFIT_SUMMARY`.

### H. AI Intelligence Center
1. **AI Business Assistant**: Natural language query interface translating executive questions ("Which fuel type generated highest revenue?", "Top operators", "Show theft risks") into safe, validated read-only SQL queries with dual tabular and executive prose answers.
2. **Predictive Sales Forecasting**: Scikit-Learn multivariate Ridge regression model predicting daily demand and revenue up to 30 days ahead with 90% confidence bands and evaluation metrics (MAE, RMSE, MAPE, $R^2$).
3. **Multi-Vector Anomaly Detection**: Scikit-Learn `IsolationForest` and Z-score variance analyzer flagging tank leaks, siphon theft, and transaction spikes with actionable remediation steps.
4. **Smart Recommendations**: Evidentiary business advice with clear mathematical backing.

### I. Snowflake Foundation Console
- Live status monitor for `SMART_PETROL_DB` and warehouse `SPPA_WH`.
- Schema browser across all 5 functional schemas.
- Interactive SQL Query Runner with parameterized execution and destructive operation guardrails.
- Interactive demonstrations of **Snowflake Time Travel**, **Zero-Copy Cloning**, and **CDC Streams & Tasks**.

### J. Enterprise Admin Panel
- Real-time system diagnostics (Host CPU, RAM, API gateways, database connection).
- Identity & Role-Based Access Control (RBAC) user provisioning.
- Strict append-only security audit trail.
- Scheduled task and cron monitor.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Visualizations**: Recharts
- **Icons**: Lucide React
- **State & Query**: TanStack Query v5 + React Context
- **Routing**: React Router v7

### Backend
- **Framework**: Python FastAPI
- **Data Validation**: Pydantic v2
- **Database Engine**: Snowflake Connector for Python (`snowflake-connector-python`)
- **Security**: JWT (`PyJWT`), Bcrypt Password Hashing, RBAC Guardrails
- **Reporting**: ReportLab (Vector PDF Generation), Python CSV Streaming
- **Server**: Uvicorn ASGI

### Database (Snowflake)
- **Database**: `SMART_PETROL_DB`
- **Warehouse**: `SPPA_WH` (`XSMALL`, Auto-suspend 60s)
- **Schemas**: `CUSTOMER_DATA`, `FUEL_OPERATIONS`, `SALES_MANAGEMENT`, `INVENTORY_CONTROL`, `WORKFORCE_ANALYTICS`

### AI / Machine Learning
- **Libraries**: Scikit-Learn, Pandas, NumPy, Scipy
- **Models**: Ridge Regression (Time-series with seasonality), Isolation Forest (Anomaly detection), Natural Language Intent-to-SQL Mapper

---

## 4. Default Enterprise Credentials (RBAC)

The application comes pre-configured with 4 RBAC role accounts for demonstration:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@smartpetrol.com` | `admin123` | Full system access, Admin Panel, User Provisioning, SQL Console |
| **MANAGER** | `manager@smartpetrol.com` | `manager123` | Full operational access, Reports, AI Analytics, Inventory, Workforce |
| **OPERATOR** | `operator@smartpetrol.com` | `operator123` | Record sales, toggle pump operational status, view shifts |
| **ANALYST** | `analyst@smartpetrol.com` | `analyst123` | Read-only analytics, BI metrics, Reports, SQL Console |

*Note: You can instantly switch between these accounts anytime using the Role Switcher in the top-right user menu.*

---

## 5. Local Setup & Execution Guide

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)

### Step 1: Clone and Configure Environment
```bash
git clone <repository_url>
cd smart-petrol-pump-analytics

# Copy environment configuration
cp .env.example .env
```

*(Optional) Configure your Snowflake account in `.env`. If credentials are omitted, the application automatically engages the High-Fidelity Simulation Engine matching the exact `SMART_PETROL_DB` schema.*

### Step 2: Install Python Dependencies
```bash
python -m pip install fastapi uvicorn pydantic pydantic-settings snowflake-connector-python pandas numpy scikit-learn reportlab PyJWT bcrypt pytest httpx httpx2
```

### Step 3: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### Step 4: Run the Application

#### Option A: Run Unified Production Server (Single Command)
Build the frontend and run the complete application on a single port:
```bash
# 1. Build the React SPA
cd frontend
npm run build
cd ..

# 2. Start the FastAPI Unified Server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir backend
```
- Web Application: **http://127.0.0.1:8000**
- Interactive Swagger Docs: **http://127.0.0.1:8000/docs**

#### Option B: Run in Development Mode (Hot-Reloading)
Run backend and frontend independently:
```bash
# Terminal 1: Backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 --app-dir backend

# Terminal 2: Frontend
cd frontend
npm run dev
```
- Frontend Dev Server: **http://localhost:5173**
- Backend API Server: **http://127.0.0.1:8000**

---

## 6. Automated Testing

### Backend Test Suite (Pytest)
Run the 12 automated backend test suites:
```bash
python -m pytest backend/tests -v
```
**Results**:
- `test_auth_success`: PASSED
- `test_auth_failure`: PASSED
- `test_snowflake_status`: PASSED
- `test_dashboard_kpis`: PASSED
- `test_sales_forecasting`: PASSED
- `test_anomaly_detection`: PASSED
- `test_ai_business_assistant`: PASSED
- `test_smart_recommendations`: PASSED
- `test_customer_list`: PASSED
- `test_sales_list`: PASSED
- `test_inventory_theft_alerts`: PASSED
- `test_workforce_operator_performance`: PASSED

### Frontend Test Suite (Vitest)
Run the frontend unit tests:
```bash
cd frontend
npm test
```
**Results**:
- `stores and retrieves JWT tokens properly`: PASSED
- `clears auth token on logout`: PASSED
- `calculates gross revenue and profit margin properly`: PASSED

---

## 7. Project Structure

```
smart-petrol-pump-analytics/
├── .env.example
├── README.md
├── database/
│   ├── Smart_Petrol_Pump_Full_Setup_Error_Checked.sql
│   ├── schema_inspection.sql
│   ├── analytics_queries.sql
│   └── views.sql
├── documentation/
│   ├── ARCHITECTURE.md
│   ├── SNOWFLAKE_INTEGRATION_GUIDE.md
│   └── AI_ML_MODEL_DOCUMENTATION.md
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/config.py
│   │   ├── security/auth.py, passwords.py
│   │   ├── snowflake/connection.py, mock_data.py
│   │   ├── analytics/forecasting.py, anomalies.py
│   │   ├── ai/assistant.py, recommendations.py
│   │   ├── services/dashboard_service.py, reports_service.py
│   │   ├── schemas/all_schemas.py
│   │   └── api/ (auth, dashboard, sales, pumps, inventory, customers, etc.)
│   └── tests/test_endpoints.py
└── frontend/
    ├── package.json, vite.config.ts, tailwind.config.js
    └── src/
        ├── App.tsx, main.tsx, index.css
        ├── layouts/AppLayout.tsx
        ├── pages/ (Dashboard, Sales, Pumps, Inventory, Customers, Workforce, Expenses, AI, Reports, Snowflake, Admin)
        ├── services/api.ts
        ├── context/AuthContext.tsx
        ├── types/index.ts
        └── __tests__/unit.test.ts
```

---

## 8. License & Enterprise Compliance
Built for smart petroleum retail networks, commercial fueling chains, and enterprise business intelligence pipelines. All SQL queries and table schemas adhere to the verified Snowflake foundation specifications.
