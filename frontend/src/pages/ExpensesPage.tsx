import React, { useState, useEffect } from 'react';
import { PieChart, Plus, DollarSign, TrendingUp, Receipt, ArrowUpRight, X } from 'lucide-react';
import { expensesApi } from '../services/api';
import { Expense, DailyProfit } from '../types';

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [profitSummary, setProfitSummary] = useState<DailyProfit[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newExp, setNewExp] = useState({
    EXPENSE_DATE: new Date().toISOString().split('T')[0],
    EXPENSE_TYPE: 'Electricity',
    DESCRIPTION: '',
    AMOUNT: 1000.0,
  });

  const fetchExpenses = async () => {
    try {
      const [expRes, profitRes] = await Promise.all([
        expensesApi.list(),
        expensesApi.getProfitSummary(),
      ]);
      setExpenses(expRes);
      setProfitSummary(profitRes);
    } catch (err) {
      console.error('Failed to load expenses data:', err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await expensesApi.create(newExp);
      setExpenses([created, ...expenses]);
      setShowAddModal(false);
      // Refresh summaries
      const updatedProfit = await expensesApi.getProfitSummary();
      setProfitSummary(updatedProfit);
    } catch (err) {
      alert(`Error creating expense: ${err}`);
    }
  };

  const totalOpex = expenses.reduce((acc, curr) => acc + curr.AMOUNT, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Expense & Net Profit Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Operating expenditure and profit rollups from INVENTORY_CONTROL.EXPENSES & DAILY_PROFIT_SUMMARY
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense Voucher</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card">
          <span className="text-xs font-medium text-slate-500">Total Station OPEX</span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            ₹{totalOpex.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400">{expenses.length} logged vouchers</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card">
          <span className="text-xs font-medium text-slate-500">Net Profit Generated</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            ₹
            {profitSummary
              .reduce((acc, curr) => acc + curr.NET_PROFIT, 0)
              .toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400">Post fuel COGS & operational expenses</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card">
          <span className="text-xs font-medium text-slate-500">Average Daily Net Margin</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            9.2%
          </div>
          <span className="text-[11px] text-emerald-500 font-semibold">Exceeds industry 7.5% benchmark</span>
        </div>
      </div>

      {/* Daily Profit Summary Table (DAILY_PROFIT_SUMMARY) */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Daily Profit Rollup</h2>
          <span className="text-xs text-slate-400 font-mono">SALES_MANAGEMENT.DAILY_PROFIT_SUMMARY</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Gross Revenue</th>
                <th className="py-3 px-4">Fuel COGS</th>
                <th className="py-3 px-4">Gross Margin</th>
                <th className="py-3 px-4">OPEX</th>
                <th className="py-3 px-4">Net Profit</th>
                <th className="py-3 px-4">Net Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {profitSummary.map((d) => (
                <tr key={d.SALE_DATE} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{d.SALE_DATE}</td>
                  <td className="py-3 px-4 font-bold">₹{d.SALES_REVENUE.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4 text-slate-500">₹{d.FUEL_COST.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4 font-medium text-emerald-600">₹{d.GROSS_PROFIT.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4 text-rose-500 font-medium">₹{d.OPERATING_EXPENSE.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{d.NET_PROFIT.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">{d.MARGIN_PCT}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Vouchers Table */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Logged Operating Expense Vouchers</h2>
          <span className="text-xs text-slate-400 font-mono">INVENTORY_CONTROL.EXPENSES</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Voucher ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Expense Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {expenses.map((e) => (
                <tr key={e.EXPENSE_ID} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{e.EXPENSE_ID}</td>
                  <td className="py-3 px-4">{e.EXPENSE_DATE}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {e.EXPENSE_TYPE}
                    </span>
                  </td>
                  <td className="py-3 px-4">{e.DESCRIPTION}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">₹{e.AMOUNT.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Expense */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Record Operating Expense</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Expense Category</label>
                <select
                  value={newExp.EXPENSE_TYPE}
                  onChange={(e) => setNewExp({ ...newExp, EXPENSE_TYPE: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="Electricity">Electricity & Power</option>
                  <option value="Maintenance">Pump & Tank Maintenance</option>
                  <option value="Salary">Staff Shift Support</option>
                  <option value="Logistics">Fuel Tanker Offloading Logistics</option>
                  <option value="Utilities">Station Water & Sanitation</option>
                  <option value="Software">IoT Telemetry & Cloud Fees</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dispenser nozzle filter calibration"
                  value={newExp.DESCRIPTION}
                  onChange={(e) => setNewExp({ ...newExp, DESCRIPTION: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="50"
                  required
                  value={newExp.AMOUNT}
                  onChange={(e) => setNewExp({ ...newExp, AMOUNT: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
                >
                  Save Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
