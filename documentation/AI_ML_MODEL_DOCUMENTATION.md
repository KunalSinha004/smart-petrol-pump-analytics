# AI & Machine Learning Analytics Architecture

## Smart Petrol Pump Analytics
### Predictive Intelligence, Anomaly Detection & NLP Engine

---

## 1. Predictive Demand & Sales Forecasting

### Objective
Accurately forecast daily fuel demand (volume in litres) and sales revenue across station nozzles for up to 30 days ahead, allowing precise tanker offloading scheduling and avoiding nozzle dry-outs.

### Model Architecture
- **Algorithm**: Multivariate Ridge Regression with L2 Regularization (`alpha=1.0`)
- **Features Engineered**:
  - Continuous chronological trend vector (`DAY_INDEX`)
  - One-Hot Encoded Day-of-Week Seasonality (`DOW_0` through `DOW_6`)
- **Target Variables**:
  - `TOTAL_LITRES`: Aggregated daily volume
  - `TOTAL_REVENUE`: Aggregated daily revenue
- **Confidence Bounds**:
  - Calculated at the 90% confidence level using residual root mean squared error:
    $$\text{Upper Bound} = \hat{y} + 1.5 \times \text{RMSE}$$
    $$\text{Lower Bound} = \max(0, \hat{y} - 1.5 \times \text{RMSE})$$
- **Evaluation Metrics Computed on Historical Series**:
  - Mean Absolute Error (MAE): $\frac{1}{n} \sum |y_i - \hat{y}_i|$
  - Root Mean Squared Error (RMSE): $\sqrt{\frac{1}{n} \sum (y_i - \hat{y}_i)^2}$
  - Mean Absolute Percentage Error (MAPE): $\frac{100\%}{n} \sum \left|\frac{y_i - \hat{y}_i}{y_i}\right|$
  - Coefficient of Determination ($R^2$)

---

## 2. Multi-Vector Anomaly Detection

### Objective
Detect operational discrepancies before they cause severe financial loss, including underground tank leakage, dispenser calibration drift, unauthorized siphon theft, or manual cashier billing errors.

### Methodology
1. **Underground Tank Variance Analysis**:
   - Compares physical dip-stick closing stock against theoretical balance:
     $$\text{Expected} = \text{Opening Stock} + \text{Received Delivery} - \text{Recorded Sales}$$
     $$\text{Variance} = \text{Actual Dip Closing} - \text{Expected Closing}$$
   - Thresholds:
     - `VARIANCE < -20.0 L`: High theft risk / severe pipe leakage
     - `-20.0 L <= VARIANCE < -5.0 L`: Moderate operational discrepancy
     - `VARIANCE >= -5.0 L`: Normal evaporative allowance
2. **Transaction Outlier Detection**:
   - Uses Scikit-Learn `IsolationForest` with `contamination=0.03` to isolate abnormal single transactions (e.g. ticket values 3x higher than station average).
3. **Severity Categorization**:
   - `CRITICAL`: Immediate physical audit required.
   - `HIGH`: Shift manager delivery receipt reconciliation.
   - `MEDIUM`: Commercial fleet voucher verification.

---

## 3. Natural Language Business Assistant (Text-to-SQL Guardrails)

### Objective
Allow station executives and managers to query complex business performance in plain English without writing SQL.

### Security & Safety Guardrails
1. **Strict Read-Only Enforcement**:
   - Only `SELECT` statements are permitted.
   - Keywords `DROP`, `TRUNCATE`, `ALTER`, `DELETE`, `UPDATE`, `INSERT`, `GRANT`, `REVOKE` are immediately blocked.
2. **Parameterized Schema Targeting**:
   - Queries are mapped directly to verified schemas: `CUSTOMER_DATA`, `FUEL_OPERATIONS`, `SALES_MANAGEMENT`, `INVENTORY_CONTROL`, `WORKFORCE_ANALYTICS`.
3. **Dual Output Generation**:
   - Generates the exact verified SQL statement with execution latency.
   - Translates raw data into a natural-language executive summary.

---

## 4. Evidentiary Smart Recommendations
Analyzes cross-schema operational metrics to generate prioritized recommendations:
- **Inventory Replenishment**: Calculates fuel burn rates ($\text{Litres/day}$) and remaining runway days, issuing automatic reorder triggers when stock falls below buffer thresholds.
- **Dispenser Maintenance**: Correlates inactive dispenser downtime with foregone peak-hour sales volume.
- **Workforce Rush-Hour Alignment**: Identifies peak transaction windows (e.g. 07:30 - 09:30 AM) to allocate staff efficiently.
- **Digital Payments Optimization**: Measures card merchant discount rates (MDR) vs zero-fee UPI transactions to save interchange costs.
