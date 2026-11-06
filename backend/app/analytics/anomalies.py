from datetime import datetime
from typing import Dict, Any, List
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from app.snowflake.mock_data import INVENTORY_DATA, FUEL_SALES_DATA, FUEL_TYPES_DATA

class AnomalyDetectionService:
    def __init__(self):
        pass

    def detect_anomalies(self) -> Dict[str, Any]:
        """
        Scan inventory records, sales transactions, and daily variances using
        Isolation Forest and statistical deviation thresholds.
        """
        detected_anomalies: List[Dict[str, Any]] = []
        
        # 1. Inventory Variance Anomalies (Fuel Theft / Tank Leakage)
        fuel_lookup = {f["FUEL_TYPE_ID"]: f["FUEL_NAME"] for f in FUEL_TYPES_DATA}
        for item in INVENTORY_DATA:
            var = item["VARIANCE_LITRES"]
            fuel_name = fuel_lookup.get(item["FUEL_TYPE_ID"], item["FUEL_TYPE_ID"])
            expected = item["EXPECTED_CLOSING_LITRES"]
            pct = round((abs(var) / expected * 100), 2) if expected else 0.0
            
            if var <= -25.0:
                detected_anomalies.append({
                    "id": f"anom_inv_{item['INVENTORY_ID']}",
                    "category": "INVENTORY_VARIANCE",
                    "severity": "CRITICAL",
                    "date": item["INVENTORY_DATE"],
                    "entity": f"Tank {fuel_name} ({item['INVENTORY_ID']})",
                    "metric_observed": f"{var} Litres variance ({pct}% of stock)",
                    "expected_value": f"0 to -5 Litres normal evaporative allowance",
                    "explanation": f"Significant negative variance detected in {fuel_name}. Discrepancy exceeds standard operational loss limit by {abs(var) - 5:.1f}L, signalling high probability of fuel theft, dispenser calibration drift, or underground tank pipe seepage.",
                    "recommended_action": "Execute immediate physical dip-stick tank audit and verify dispenser pulse meter calibration."
                })
            elif var <= -10.0:
                detected_anomalies.append({
                    "id": f"anom_inv_{item['INVENTORY_ID']}",
                    "category": "INVENTORY_VARIANCE",
                    "severity": "HIGH",
                    "date": item["INVENTORY_DATE"],
                    "entity": f"Tank {fuel_name} ({item['INVENTORY_ID']})",
                    "metric_observed": f"{var} Litres variance",
                    "expected_value": f"0 to -5 Litres normal allowance",
                    "explanation": f"Moderate fuel discrepancy exceeding normal evaporative loss threshold.",
                    "recommended_action": "Reconcile shift delivery receipts and monitor offloading logs."
                })

        # 2. Transaction Amount Spikes using Isolation Forest
        df_sales = pd.DataFrame(FUEL_SALES_DATA)
        if len(df_sales) >= 10:
            amounts = df_sales[["SALES_AMOUNT"]].values
            iso = IsolationForest(contamination=0.03, random_state=42)
            preds = iso.fit_predict(amounts)
            
            # Outliers are labeled -1
            outlier_indices = np.where(preds == -1)[0]
            for idx in outlier_indices[:4]: # pick top outliers
                row = df_sales.iloc[idx]
                mean_amt = df_sales["SALES_AMOUNT"].mean()
                detected_anomalies.append({
                    "id": f"anom_sale_{row['SALE_ID']}",
                    "category": "TRANSACTION_OUTLIER",
                    "severity": "MEDIUM",
                    "date": str(row["SALE_DATE"]),
                    "entity": f"Sale #{row['SALE_ID']} (Pump {row['PUMP_ID']})",
                    "metric_observed": f"Rs. {row['SALES_AMOUNT']:,.2f} ({row['QUANTITY_LITRES']} Litres)",
                    "expected_value": f"Station Average: Rs. {mean_amt:,.2f}",
                    "explanation": f"Single transaction volume is {row['SALES_AMOUNT']/mean_amt:.1f}x higher than standard customer fuel purchase. Typically associated with fleet bulk fueling or potential operator manual billing error.",
                    "recommended_action": f"Verify fleet commercial voucher for Customer {row['CUSTOMER_ID']} and payment settlement receipt."
                })

        # 3. Summary stats
        return {
            "status": "COMPLETED",
            "scan_timestamp": datetime.now().isoformat(),
            "total_anomalies_detected": len(detected_anomalies),
            "critical_count": sum(1 for a in detected_anomalies if a["severity"] == "CRITICAL"),
            "high_count": sum(1 for a in detected_anomalies if a["severity"] == "HIGH"),
            "medium_count": sum(1 for a in detected_anomalies if a["severity"] == "MEDIUM"),
            "anomalies": detected_anomalies
        }

anomaly_service = AnomalyDetectionService()
