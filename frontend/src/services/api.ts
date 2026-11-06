import {
  KPISummary,
  TrendPoint,
  FuelBreakdown,
  PumpPerformance,
  Customer,
  FuelSale,
  FuelType,
  InventoryRecord,
  TheftAlert,
  Employee,
  Shift,
  Expense,
  DailyProfit,
  ForecastResult,
  AnomalyResult,
  Recommendation,
  AIQueryResponse,
  SnowflakeStatus,
  User
} from '../types';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('sppa_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('sppa_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('sppa_token');
  localStorage.removeItem('sppa_user');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.error || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// --- AUTH API ---
export const authApi = {
  login: async (email: string, password: string): Promise<{ access_token: string; user: User }> => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  getProfile: async (): Promise<User> => {
    return request('/auth/me');
  },
};

// --- DASHBOARD API ---
export const dashboardApi = {
  getSummary: async (startDate?: string, endDate?: string): Promise<KPISummary> => {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/dashboard/summary${qs}`);
  },
  getTrends: async (days: number = 30): Promise<TrendPoint[]> => {
    return request(`/dashboard/trends?days=${days}`);
  },
  getFuelBreakdown: async (): Promise<FuelBreakdown[]> => {
    return request('/dashboard/fuel-breakdown');
  },
  getPumpPerformance: async (): Promise<PumpPerformance[]> => {
    return request('/dashboard/pump-performance');
  },
};

// --- CUSTOMERS API ---
export const customersApi = {
  list: async (search?: string, customerType?: string): Promise<Customer[]> => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (customerType) params.set('customer_type', customerType);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/customers/${qs}`);
  },
  create: async (customer: Partial<Customer>): Promise<Customer> => {
    return request('/customers/', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  },
  getJsonRecords: async (): Promise<any[]> => {
    return request('/customers/json-records');
  },
};

// --- SALES API ---
export const salesApi = {
  list: async (filters: Record<string, string> = {}, limit: number = 100): Promise<FuelSale[]> => {
    const params = new URLSearchParams(filters);
    params.set('limit', limit.toString());
    return request(`/sales/?${params.toString()}`);
  },
  create: async (sale: Partial<FuelSale>): Promise<FuelSale> => {
    return request('/sales/', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
  },
};

// --- PUMPS API ---
export const pumpsApi = {
  list: async (): Promise<PumpPerformance[]> => {
    return request('/pumps/');
  },
  updateStatus: async (pumpId: string, status: string): Promise<any> => {
    return request(`/pumps/${pumpId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// --- FUEL TYPES API ---
export const fuelTypesApi = {
  list: async (): Promise<FuelType[]> => {
    return request('/fuel-types/');
  },
};

// --- INVENTORY API ---
export const inventoryApi = {
  list: async (fuelTypeId?: string): Promise<InventoryRecord[]> => {
    const qs = fuelTypeId ? `?fuel_type_id=${fuelTypeId}` : '';
    return request(`/inventory/${qs}`);
  },
  getTheftAlerts: async (): Promise<TheftAlert[]> => {
    return request('/inventory/theft-alerts');
  },
  create: async (entry: Partial<InventoryRecord>): Promise<InventoryRecord> => {
    return request('/inventory/', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },
};

// --- WORKFORCE API ---
export const workforceApi = {
  listEmployees: async (): Promise<Employee[]> => {
    return request('/employees/');
  },
  getOperatorPerformance: async (): Promise<any[]> => {
    return request('/employees/operator-performance');
  },
  listShifts: async (): Promise<Shift[]> => {
    return request('/shifts/');
  },
};

// --- EXPENSES & PROFIT API ---
export const expensesApi = {
  list: async (): Promise<Expense[]> => {
    return request('/expenses/');
  },
  create: async (expense: Partial<Expense>): Promise<Expense> => {
    return request('/expenses/', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  },
  getProfitSummary: async (): Promise<DailyProfit[]> => {
    return request('/expenses/profit-summary');
  },
};

// --- AI INTELLIGENCE API ---
export const aiApi = {
  askAssistant: async (question: string): Promise<AIQueryResponse> => {
    return request('/ai/query', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  },
  getForecast: async (days: number = 14, fuelTypeId?: string): Promise<ForecastResult> => {
    const params = new URLSearchParams({ days: days.toString() });
    if (fuelTypeId) params.set('fuel_type_id', fuelTypeId);
    return request(`/analytics/forecast?${params.toString()}`);
  },
  getAnomalies: async (): Promise<AnomalyResult> => {
    return request('/analytics/anomalies');
  },
  getRecommendations: async (): Promise<{ status: string; recommendations: Recommendation[] }> => {
    return request('/ai/recommendations');
  },
};

// --- SNOWFLAKE CONSOLE API ---
export const snowflakeApi = {
  getStatus: async (): Promise<SnowflakeStatus> => {
    return request('/snowflake/status');
  },
  executeQuery: async (sql: string, params?: Record<string, any>): Promise<any> => {
    return request('/snowflake/query', {
      method: 'POST',
      body: JSON.stringify({ sql, params }),
    });
  },
  listViews: async (): Promise<any> => {
    return request('/snowflake/views');
  },
  getTimeTravelDemo: async (): Promise<any> => {
    return request('/snowflake/time-travel-demo');
  },
  getZeroCopyCloneDemo: async (): Promise<any> => {
    return request('/snowflake/zero-copy-clone-demo');
  },
  getStreamsTasks: async (): Promise<any> => {
    return request('/snowflake/streams-tasks');
  },
};

// --- ADMIN API ---
export const adminApi = {
  getSystemHealth: async (): Promise<any> => {
    return request('/admin/system-health');
  },
  listUsers: async (): Promise<any[]> => {
    return request('/admin/users');
  },
  createUser: async (user: any): Promise<any> => {
    return request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },
  getAuditLogs: async (limit: number = 50): Promise<any[]> => {
    return request(`/admin/audit-logs?limit=${limit}`);
  },
  getScheduledJobs: async (): Promise<any[]> => {
    return request('/admin/scheduled-jobs');
  },
};
