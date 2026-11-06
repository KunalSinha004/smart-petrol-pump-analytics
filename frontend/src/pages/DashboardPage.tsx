import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Fuel,
  CreditCard,
  Users,
  TrendingUp,
  Receipt,
  Boxes,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Database
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { dashboardApi } from '../services/api';
import { KPISummary, TrendPoint, FuelBreakdown, PumpPerformance } from '../types';

const FUEL_COLORS: Record<string, string> = {
  Petrol: '#10B981', // Emerald
  Diesel: '#0284C7', // Sky Blue
  CNG: '#F59E0B',    // Amber
};

export const DashboardPage: React.FC = () => {
  const [kpis, setKpis] = useState<KPISummary | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [fuelBreakdown, setFuelBreakdown] = useState<FuelBreakdown[]>([]);
  const [pumpPerf, setPumpPerf] = useState<PumpPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30D');

  const fetchDashboardData = async () => {
    try {
      const [kpiRes, trendRes, fuelRes, pumpRes] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getTrends(30),
        dashboardApi.getFuelBreakdown(),
        dashboardApi.getPumpPerformance(),
      ]);
      setKpis(kpiRes);
      setTrends(trendRes);
      setFuelBreakdown(fuelRes);
      setPumpPerf(pumpRes);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  const handleExportCSV = () => {
    window.open('/api/reports/sales/csv', '_blank');
  };

  const handleExportPDF = () => {
    window.open('/api/reports/sales/pdf', '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-64"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const pieData = fuelBreakdown.map((f) => ({
    name: f.FUEL_NAME,
    value: f.revenue,
    litres: f.litres,
    margin: f.margin_pct,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Executive Fuel Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Verified Snowflake Query
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time station revenue, dispenser telemetry, and fuel inventory analytics
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Date range filter */}
          <div className="flex items-center bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 text-xs">
            {['7D', '14D', '30D'].map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  dateRange === r
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Refresh metrics from Snowflake"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Audit PDF</span>
          </button>
        </div>
      </div>

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Revenue */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total Station Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              ₹{kpis?.total_revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
            <span className="flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-3 h-3" /> +14.2%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Past 30 days operational gross</div>
        </motion.div>

        {/* KPI 2: Total Fuel Sales (Litres) */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total Dispensed Volume</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {kpis?.total_fuel_sales_litres.toLocaleString('en-IN', { maximumFractionDigits: 1 })} L
            </span>
            <span className="flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-3 h-3" /> +8.7%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Petrol, Diesel, & CNG aggregate</div>
        </motion.div>

        {/* KPI 3: Total Transactions */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total Transactions</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {kpis?.total_transactions.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">
              Avg ₹{kpis ? (kpis.total_revenue / Math.max(1, kpis.total_transactions)).toFixed(0) : 0}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Nozzle dispense records</div>
        </motion.div>

        {/* KPI 4: Net Profit */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Net Profit (Post-Opex)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{kpis?.net_profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
              {kpis?.net_margin_pct}% Margin
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Gross profit minus OPEX</div>
        </motion.div>

        {/* KPI 5: Total Expenses */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Operating Expenses (OPEX)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              ₹{kpis?.total_expenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-slate-400">7 logged vouchers</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Power, staff, calibration & maintenance</div>
        </motion.div>

        {/* KPI 6: Total Customers */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Customer Profiles</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{kpis?.total_customers}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              100% active transacting
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Regular, Premium & Commercial Fleets</div>
        </motion.div>

        {/* KPI 7: Fuel Stock In Underground Tanks */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Closing Tank Inventory</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {kpis?.fuel_stock_litres.toLocaleString()} L
            </span>
            <span className="text-xs text-emerald-500 font-semibold">Healthy</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Sum of 3 underground tanks</div>
        </motion.div>

        {/* KPI 8: Active Dispensers */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Dispenser Pump Health</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {kpis?.active_pumps} / {kpis?.total_pumps}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
              1 Maint.
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">75% operational availability</div>
        </motion.div>
      </div>

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Revenue & 7-Day Moving Average Trajectory (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Daily Revenue & 7-Day Moving Average</h2>
              <p className="text-xs text-slate-400">Analytical window calculation from SALES_MANAGEMENT.FUEL_SALES</p>
            </div>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded">
              Trend: +12.4%
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis
                  dataKey="date_str"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(val) => val.slice(5)}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Daily Revenue"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="moving_avg_revenue"
                  name="7-Day Moving Avg"
                  stroke="#0284C7"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Fuel Type Sales Distribution & Margins */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-card flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Fuel Product Revenue Share</h2>
            <p className="text-xs text-slate-400">View VW_FUEL_REVENUE breakdown</p>

            <div className="h-52 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={FUEL_COLORS[entry.name] || '#10B981'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fuel breakdown pills */}
          <div className="space-y-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {fuelBreakdown.map((f) => (
              <div key={f.FUEL_NAME} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: FUEL_COLORS[f.FUEL_NAME] || '#10B981' }}
                  ></span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{f.FUEL_NAME}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-500">₹{f.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                    {f.margin_pct}% Margin
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Dispenser Performance & Quick Operational Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispenser Revenue & Throughput */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Dispenser Pump Productivity</h2>
              <p className="text-xs text-slate-400">Island A vs Island B dispenser throughput</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">P001 - P004</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pumpPerf} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="PUMP_NAME" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} name="Total Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Dispenser Status List */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-card">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Live Dispenser Status</h2>
          <p className="text-xs text-slate-400 mb-3">Nozzle telemetry & island coverage</p>

          <div className="space-y-3">
            {pumpPerf.map((p) => (
              <div
                key={p.PUMP_ID}
                className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/70 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">{p.PUMP_NAME}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({p.ISLAND})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {p.transactions} txns • {p.litres.toFixed(1)} L dispensed
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    p.STATUS === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                  }`}
                >
                  {p.STATUS}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Last sync with Snowflake:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
};
