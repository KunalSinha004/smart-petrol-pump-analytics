export type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'ANALYST';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface KPISummary {
  total_revenue: number;
  total_fuel_sales_litres: number;
  total_transactions: number;
  total_customers: number;
  active_transacting_customers: number;
  gross_profit: number;
  total_expenses: number;
  net_profit: number;
  net_margin_pct: number;
  fuel_stock_litres: number;
  active_pumps: number;
  total_pumps: number;
  pump_health_pct: number;
  last_updated: string;
}

export interface TrendPoint {
  date_str: string;
  revenue: number;
  litres: number;
  gross_profit: number;
  transactions: number;
  moving_avg_revenue: number;
}

export interface FuelBreakdown {
  FUEL_NAME: string;
  UNIT: string;
  SELLING_PRICE: number;
  PURCHASE_COST: number;
  revenue: number;
  litres: number;
  fuel_cost: number;
  profit: number;
  transactions: number;
  revenue_share_pct: number;
  margin_pct: number;
}

export interface PumpPerformance {
  PUMP_ID: string;
  PUMP_NAME: string;
  ISLAND: string;
  STATUS: 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE';
  transactions: number;
  litres: number;
  revenue: number;
  profit: number;
}

export interface Customer {
  CUSTOMER_ID: string;
  CUSTOMER_NAME: string;
  CUSTOMER_TYPE: string;
  FUEL_PREFERENCE: string;
  PAYMENT_METHOD: string;
  CITY: string;
  PHONE: string;
  EMAIL: string;
  CREATED_DATE: string;
  total_visits?: number;
  total_spent?: number;
  total_litres?: number;
  last_visit?: string;
}

export interface CustomerJsonRecord {
  JSON_ID: number;
  RAW_DATA: {
    customer_id: string;
    customer_name: string;
    customer_type: string;
    city: string;
    preferred_fuel: string;
    loyalty_tier?: string;
    points_balance?: number;
    fleet_size?: number;
    credit_limit?: number;
  };
  LOADED_AT: string;
}

export interface FuelSale {
  SALE_ID: string;
  SHIFT_ID: string;
  SALE_DATE: string;
  SHIFT_TYPE: string;
  PUMP_ID: string;
  OPERATOR_ID: string;
  MANAGER_ID: string;
  CUSTOMER_ID: string;
  FUEL_TYPE_ID: string;
  QUANTITY_LITRES: number;
  SELLING_PRICE: number;
  SALES_AMOUNT: number;
  FUEL_COST: number;
  GROSS_PROFIT: number;
  PAYMENT_METHOD: string;
}

export interface FuelType {
  FUEL_TYPE_ID: string;
  FUEL_NAME: string;
  UNIT: string;
  SELLING_PRICE: number;
  PURCHASE_COST: number;
  PROFIT_PER_UNIT: number;
}

export interface InventoryRecord {
  INVENTORY_ID: string;
  INVENTORY_DATE: string;
  FUEL_TYPE_ID: string;
  OPENING_STOCK_LITRES: number;
  RECEIVED_STOCK_LITRES: number;
  RECORDED_SALES_LITRES: number;
  EXPECTED_CLOSING_LITRES: number;
  ACTUAL_CLOSING_LITRES: number;
  VARIANCE_LITRES: number;
  STATUS: string;
}

export interface TheftAlert {
  INVENTORY_ID: string;
  INVENTORY_DATE: string;
  FUEL_NAME: string;
  EXPECTED_CLOSING_LITRES: number;
  ACTUAL_CLOSING_LITRES: number;
  VARIANCE_LITRES: number;
  THEFT_RISK: 'HIGH_THEFT_RISK' | 'MODERATE_LOSS' | 'NORMAL';
}

export interface Employee {
  EMPLOYEE_ID: string;
  EMPLOYEE_NAME: string;
  ROLE: string;
  SHIFT: string;
  STATUS: string;
  total_sales_amount?: number;
  total_litres?: number;
  total_transactions?: number;
  gross_profit?: number;
}

export interface Shift {
  SHIFT_ID: string;
  SHIFT_DATE: string;
  SHIFT_TYPE: string;
  OPERATOR_ID: string;
  MANAGER_ID: string;
  START_TIME: string;
  END_TIME: string;
  PUMPS_COVERED: number;
  STATUS: string;
}

export interface Expense {
  EXPENSE_ID: string;
  EXPENSE_DATE: string;
  EXPENSE_TYPE: string;
  DESCRIPTION: string;
  AMOUNT: number;
}

export interface DailyProfit {
  SALE_DATE: string;
  TOTAL_LITRES: number;
  SALES_REVENUE: number;
  FUEL_COST: number;
  GROSS_PROFIT: number;
  TRANSACTIONS: number;
  OPERATING_EXPENSE: number;
  NET_PROFIT: number;
  MARGIN_PCT: number;
}

export interface ForecastPoint {
  date: string;
  day_name: string;
  estimated_volume_litres: number;
  volume_lower_bound: number;
  volume_upper_bound: number;
  estimated_revenue: number;
  revenue_lower_bound: number;
  revenue_upper_bound: number;
  confidence_level: string;
  is_estimate: boolean;
}

export interface ForecastResult {
  status: string;
  model_architecture: string;
  historical_days_used: number;
  forecast_horizon_days: number;
  metrics: {
    mean_absolute_error_litres: number;
    root_mean_squared_error_litres: number;
    mean_absolute_percentage_error: string;
    r2_variance_score: number;
  };
  disclaimer: string;
  forecast: ForecastPoint[];
}

export interface Anomaly {
  id: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  date: string;
  entity: string;
  metric_observed: string;
  expected_value: string;
  explanation: string;
  recommended_action: string;
}

export interface AnomalyResult {
  status: string;
  scan_timestamp: string;
  total_anomalies_detected: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  anomalies: Anomaly[];
}

export interface Recommendation {
  id: string;
  title: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  impact: string;
  recommendation: string;
  evidence: Record<string, any>;
}

export interface AIQueryResponse {
  question: string;
  answer: string;
  generated_sql: string;
  is_read_only_validated: boolean;
  engine: string;
  execution_time_ms: number;
  data: any[];
  columns: string[];
}

export interface SnowflakeStatus {
  status: string;
  mode: string;
  database: string;
  warehouse: string;
  warehouse_size: string;
  warehouse_state: string;
  role: string;
  active_schema: string;
  available_schemas: string[];
  total_queries_executed: number;
  avg_latency_ms: number;
  last_error: string | null;
  is_live: boolean;
}
