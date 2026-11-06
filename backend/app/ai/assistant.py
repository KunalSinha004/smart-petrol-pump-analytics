import re
from typing import Dict, Any, List
from app.snowflake.connection import snowflake_service

class AIAssistantService:
    def __init__(self):
        pass

    def ask(self, question: str) -> Dict[str, Any]:
        """
        Interprets natural language business inquiries, maps them to safe,
        read-only verified SQL queries across SMART_PETROL_DB schemas, executes them,
        and provides an executive summary.
        """
        q_clean = question.strip().lower()
        
        # 1. Intent recognition & controlled SQL query generation
        if any(w in q_clean for w in ["highest revenue", "top fuel", "best selling fuel", "fuel revenue", "fuel sales"]):
            sql = """SELECT f.FUEL_NAME,
       SUM(s.QUANTITY_LITRES) AS LITRES_SOLD,
       SUM(s.SALES_AMOUNT) AS SALES_REVENUE,
       SUM(s.GROSS_PROFIT) AS GROSS_PROFIT,
       COUNT(*) AS TRANSACTIONS
FROM SALES_MANAGEMENT.FUEL_SALES s
JOIN FUEL_OPERATIONS.FUEL_TYPES f ON s.FUEL_TYPE_ID = f.FUEL_TYPE_ID
GROUP BY f.FUEL_NAME
ORDER BY SALES_REVENUE DESC;"""
            summary_template = "Revenue breakdown by fuel type shows which fuel grades drive the highest station turnover."

        elif any(w in q_clean for w in ["pump", "island", "best performing pump", "dispenser"]):
            sql = """SELECT p.PUMP_ID, p.PUMP_NAME, p.ISLAND, p.STATUS,
       COUNT(s.SALE_ID) AS TRANSACTIONS,
       SUM(s.QUANTITY_LITRES) AS TOTAL_LITRES,
       SUM(s.SALES_AMOUNT) AS TOTAL_REVENUE
FROM FUEL_OPERATIONS.PUMPS p
LEFT JOIN SALES_MANAGEMENT.FUEL_SALES s ON p.PUMP_ID = s.PUMP_ID
GROUP BY p.PUMP_ID, p.PUMP_NAME, p.ISLAND, p.STATUS
ORDER BY TOTAL_REVENUE DESC;"""
            summary_template = "Dispenser throughput analysis highlights pump utilization across Island A and Island B."

        elif any(w in q_clean for w in ["operator", "employee", "workforce", "best employee", "staff", "performance"]):
            sql = """SELECT s.OPERATOR_ID, e.EMPLOYEE_NAME,
       SUM(s.QUANTITY_LITRES) AS LITRES_SOLD,
       SUM(s.SALES_AMOUNT) AS TOTAL_REVENUE,
       SUM(s.GROSS_PROFIT) AS PROFIT,
       COUNT(*) AS TRANSACTIONS
FROM SALES_MANAGEMENT.FUEL_SALES s
LEFT JOIN WORKFORCE_ANALYTICS.EMPLOYEES e ON s.OPERATOR_ID = e.EMPLOYEE_ID
GROUP BY s.OPERATOR_ID, e.EMPLOYEE_NAME
ORDER BY TOTAL_REVENUE DESC;"""
            summary_template = "Operator productivity analysis showcases sales revenue, total litres dispensed, and transaction volumes."

        elif any(w in q_clean for w in ["theft", "variance", "leakage", "discrepancy", "inventory risk", "loss"]):
            sql = """SELECT i.INVENTORY_ID, i.INVENTORY_DATE, f.FUEL_NAME,
       i.EXPECTED_CLOSING_LITRES, i.ACTUAL_CLOSING_LITRES, i.VARIANCE_LITRES,
       IFF(i.VARIANCE_LITRES < -20, 'HIGH_THEFT_RISK', IFF(i.VARIANCE_LITRES < -5, 'MODERATE_LOSS', 'NORMAL')) AS THEFT_RISK
FROM INVENTORY_CONTROL.INVENTORY i
LEFT JOIN FUEL_OPERATIONS.FUEL_TYPES f ON i.FUEL_TYPE_ID = f.FUEL_TYPE_ID
ORDER BY i.VARIANCE_LITRES ASC;"""
            summary_template = "Inventory reconciliation reveals tank variance levels and flags potential loss or theft incidents."

        elif any(w in q_clean for w in ["profit", "expense", "margin", "net profit", "financial"]):
            sql = """SELECT 
    d.SALE_DATE,
    d.SALES_REVENUE,
    d.FUEL_COST,
    d.GROSS_PROFIT,
    d.OPERATING_EXPENSE,
    d.NET_PROFIT
FROM SALES_MANAGEMENT.DAILY_PROFIT_SUMMARY d
ORDER BY d.SALE_DATE DESC;"""
            summary_template = "Net profit trajectory reflects gross revenue minus cost of goods sold and operating expenses."

        elif any(w in q_clean for w in ["customer", "fleet", "loyalty", "regular"]):
            sql = """SELECT c.CUSTOMER_ID, c.CUSTOMER_NAME, c.CUSTOMER_TYPE,
       c.FUEL_PREFERENCE, c.PAYMENT_METHOD, c.CITY,
       COUNT(s.SALE_ID) AS VISIT_COUNT,
       COALESCE(SUM(s.SALES_AMOUNT), 0) AS TOTAL_SPENT
FROM CUSTOMER_DATA.CUSTOMERS c
LEFT JOIN SALES_MANAGEMENT.FUEL_SALES s ON c.CUSTOMER_ID = s.CUSTOMER_ID
GROUP BY c.CUSTOMER_ID, c.CUSTOMER_NAME, c.CUSTOMER_TYPE, c.FUEL_PREFERENCE, c.PAYMENT_METHOD, c.CITY
ORDER BY TOTAL_SPENT DESC;"""
            summary_template = "Customer segmentation analysis displays lifetime purchase volume and fueling preferences."

        else:
            # Default to overarching executive metrics
            sql = """SELECT 
    f.FUEL_NAME,
    COUNT(s.SALE_ID) AS TRANSACTIONS,
    SUM(s.QUANTITY_LITRES) AS VOLUME_LITRES,
    SUM(s.SALES_AMOUNT) AS TOTAL_REVENUE,
    SUM(s.GROSS_PROFIT) AS TOTAL_PROFIT
FROM SALES_MANAGEMENT.FUEL_SALES s
JOIN FUEL_OPERATIONS.FUEL_TYPES f ON s.FUEL_TYPE_ID = f.FUEL_TYPE_ID
GROUP BY f.FUEL_NAME
ORDER BY TOTAL_REVENUE DESC;"""
            summary_template = f"Executive query executed regarding '{question}'. Displaying core fuel volume and revenue analytics."

        # 2. Strict read-only guardrail check
        if not re.match(r"^\s*SELECT", sql, re.IGNORECASE):
            return {
                "error": "Query validation failure: Only read-only SELECT operations are permitted by platform guardrails.",
                "status": "REJECTED"
            }

        # 3. Execute via Snowflake service layer
        result = snowflake_service.execute_query(sql)
        
        # 4. Generate dynamic natural language answer from the data
        rows = result.get("rows", [])
        answer_text = summary_template
        if rows and "SALES_REVENUE" in rows[0] and "FUEL_NAME" in rows[0]:
            top_fuel = rows[0]
            answer_text = (
                f"Based on real transaction logs in SMART_PETROL_DB, **{top_fuel['FUEL_NAME']}** leads overall revenue with "
                f"**Rs. {top_fuel['SALES_REVENUE']:,.2f}** ({top_fuel['LITRES_SOLD']:,.2f} Litres) across {top_fuel['TRANSACTIONS']} transactions."
            )
        elif rows and "OPERATOR_NAME" in rows[0]:
            top_op = rows[0]
            answer_text = (
                f"Top operator is **{top_op['OPERATOR_NAME']}**, having generated "
                f"**Rs. {top_op.get('TOTAL_REVENUE', top_op.get('REVENUE', 0)):,.2f}** in fuel sales."
            )
        elif rows and "THEFT_RISK" in rows[0]:
            high_risks = [r for r in rows if r.get("THEFT_RISK") == "HIGH_THEFT_RISK"]
            answer_text = (
                f"Found **{len(high_risks)} high-risk tank discrepancy event(s)** requiring immediate dip-stick physical verification."
            )

        return {
            "question": question,
            "answer": answer_text,
            "generated_sql": sql,
            "is_read_only_validated": True,
            "engine": result.get("engine"),
            "execution_time_ms": result.get("execution_time_ms"),
            "data": rows,
            "columns": result.get("columns")
        }

ai_assistant_service = AIAssistantService()
