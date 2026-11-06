import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.security.auth import USERS_DB, authenticate_user, create_access_token
from app.services.dashboard_service import dashboard_service
from app.analytics.forecasting import forecasting_service
from app.analytics.anomalies import anomaly_service
from app.ai.assistant import ai_assistant_service
from app.ai.recommendations import recommendations_service
from app.snowflake.connection import snowflake_service
from app.api.dashboard import get_dashboard_summary, get_dashboard_trends, get_fuel_breakdown, get_pump_performance
from app.api.customers import list_customers
from app.api.sales import list_sales
from app.api.inventory import list_inventory, get_theft_alerts
from app.api.employees import list_employees, get_operator_performance
from app.api.expenses import list_expenses, get_daily_profit_summary
from app.schemas.all_schemas import AIQueryRequest

def test_auth_success():
    user = authenticate_user("admin@smartpetrol.com", "admin123")
    assert user is not None
    assert user.role == "ADMIN"
    token = create_access_token({"sub": user.email, "role": user.role})
    assert token is not None

def test_auth_failure():
    user = authenticate_user("admin@smartpetrol.com", "wrongpass")
    assert user is None

def test_snowflake_status():
    status = snowflake_service.get_status()
    assert status["database"] == "SMART_PETROL_DB"
    assert status["warehouse"] == "SPPA_WH"
    assert status["status"] == "HEALTHY"

def test_dashboard_kpis():
    admin = USERS_DB["admin@smartpetrol.com"]
    kpis = get_dashboard_summary(None, None, admin)
    assert kpis["total_revenue"] > 100000
    assert kpis["total_transactions"] >= 100
    assert kpis["total_pumps"] == 4
    assert kpis["active_pumps"] >= 3

def test_sales_forecasting():
    res = forecasting_service.generate_sales_forecast(days_ahead=7)
    assert res["status"] == "SUCCESS"
    assert len(res["forecast"]) == 7
    assert "metrics" in res

def test_anomaly_detection():
    res = anomaly_service.detect_anomalies()
    assert res["status"] == "COMPLETED"
    assert res["total_anomalies_detected"] > 0
    assert any(a["severity"] == "CRITICAL" for a in res["anomalies"])

def test_ai_business_assistant():
    res = ai_assistant_service.ask("Which fuel type generated the highest revenue?")
    assert "generated_sql" in res
    assert "answer" in res
    assert res["is_read_only_validated"] is True

def test_smart_recommendations():
    rec = recommendations_service.get_recommendations()
    assert rec["status"] == "GENERATED"
    assert len(rec["recommendations"]) >= 3

def test_customer_list():
    admin = USERS_DB["admin@smartpetrol.com"]
    custs = list_customers(None, None, admin)
    assert len(custs) >= 8

def test_sales_list():
    admin = USERS_DB["admin@smartpetrol.com"]
    sales = list_sales(None, None, None, None, None, None, 20, admin)
    assert len(sales) == 20

def test_inventory_theft_alerts():
    admin = USERS_DB["admin@smartpetrol.com"]
    alerts = get_theft_alerts(admin)
    assert len(alerts) > 0
    assert any("HIGH_THEFT_RISK" in a["THEFT_RISK"] for a in alerts)

def test_workforce_operator_performance():
    admin = USERS_DB["admin@smartpetrol.com"]
    ops = get_operator_performance(admin)
    assert len(ops) > 0
    assert "REVENUE" in ops[0]
