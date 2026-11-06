import React, { useState, useEffect } from 'react';
import {
  Fuel,
  Search,
  Filter,
  Plus,
  Download,
  Calendar,
  CreditCard,
  User,
  Gauge,
  CheckCircle2,
  X
} from 'lucide-react';
import { salesApi, fuelTypesApi, pumpsApi, workforceApi } from '../services/api';
import { FuelSale, FuelType, PumpPerformance, Employee } from '../types';

export const SalesPage: React.FC = () => {
  const [sales, setSales] = useState<FuelSale[]>([]);
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
  const [pumps, setPumps] = useState<PumpPerformance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');
  const [pumpFilter, setPumpFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSale, setNewSale] = useState({
    SHIFT_ID: 'SH004',
    SALE_DATE: new Date().toISOString().split('T')[0],
    SHIFT_TYPE: 'Morning',
    PUMP_ID: 'P001',
    OPERATOR_ID: 'E001',
    MANAGER_ID: 'E003',
    CUSTOMER_ID: 'C001',
    FUEL_TYPE_ID: 'F001',
    QUANTITY_LITRES: 25.0,
    SELLING_PRICE: 105.5,
    PAYMENT_METHOD: 'UPI',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSalesData = async () => {
    try {
      const [salesRes, fuelsRes, pumpsRes, empRes] = await Promise.all([
        salesApi.list({}, 200),
        fuelTypesApi.list(),
        pumpsApi.list(),
        workforceApi.listEmployees(),
      ]);
      setSales(salesRes);
      setFuelTypes(fuelsRes);
      setPumps(pumpsRes);
      setEmployees(empRes);
    } catch (err) {
      console.error('Failed to load sales data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await salesApi.create(newSale);
      setSales([created, ...sales]);
      setShowAddModal(false);
    } catch (err) {
      alert(`Error recording sale: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered sales
  const filteredSales = sales.filter((s) => {
    if (fuelFilter && s.FUEL_TYPE_ID !== fuelFilter) return false;
    if (pumpFilter && s.PUMP_ID !== pumpFilter) return false;
    if (paymentFilter && s.PAYMENT_METHOD !== paymentFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.SALE_ID.toLowerCase().includes(q) ||
        s.CUSTOMER_ID.toLowerCase().includes(q) ||
        s.OPERATOR_ID.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalFilteredRevenue = filteredSales.reduce((acc, curr) => acc + curr.SALES_AMOUNT, 0);
  const totalFilteredVolume = filteredSales.reduce((acc, curr) => acc + curr.QUANTITY_LITRES, 0);
  const totalFilteredProfit = filteredSales.reduce((acc, curr) => acc + curr.GROSS_PROFIT, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Fuel Sales Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Verified transactions from SMART_PETROL_DB.SALES_MANAGEMENT.FUEL_SALES
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open('/api/reports/sales/csv', '_blank')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Sale</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card">
          <span className="text-xs font-medium text-slate-500">Filtered Sales Revenue</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            ₹{totalFilteredRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400">{filteredSales.length} Transactions</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card">
          <span className="text-xs font-medium text-slate-500">Total Volume Dispensed</span>
          <div className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-1">
            {totalFilteredVolume.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Litres
          </div>
          <span className="text-[11px] text-slate-400">Average {(totalFilteredVolume / Math.max(1, filteredSales.length)).toFixed(1)} L/txn</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card">
          <span className="text-xs font-medium text-slate-500">Gross Margin Generated</span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{totalFilteredProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400">{((totalFilteredProfit / Math.max(1, totalFilteredRevenue)) * 100).toFixed(1)}% Gross Margin</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Sale ID, Customer, Operator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Fuel Filter */}
          <select
            value={fuelFilter}
            onChange={(e) => setFuelFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Fuel Types</option>
            {fuelTypes.map((f) => (
              <option key={f.FUEL_TYPE_ID} value={f.FUEL_TYPE_ID}>
                {f.FUEL_NAME} (₹{f.SELLING_PRICE})
              </option>
            ))}
          </select>

          {/* Pump Filter */}
          <select
            value={pumpFilter}
            onChange={(e) => setPumpFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Pumps</option>
            {pumps.map((p) => (
              <option key={p.PUMP_ID} value={p.PUMP_ID}>
                {p.PUMP_NAME}
              </option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Payment Modes</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
          </select>

          {(fuelFilter || pumpFilter || paymentFilter || search) && (
            <button
              onClick={() => {
                setFuelFilter('');
                setPumpFilter('');
                setPaymentFilter('');
                setSearch('');
              }}
              className="text-xs text-red-600 hover:underline px-2 py-1"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Sales Transactions Table */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Sale ID</th>
                <th className="py-3.5 px-4">Date & Shift</th>
                <th className="py-3.5 px-4">Dispenser Pump</th>
                <th className="py-3.5 px-4">Operator</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Volume (L)</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Gross Margin</th>
                <th className="py-3.5 px-4">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredSales.slice(0, 50).map((s) => (
                <tr key={s.SALE_ID} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{s.SALE_ID}</td>
                  <td className="py-3 px-4">
                    <div>{s.SALE_DATE}</div>
                    <div className="text-[10px] text-slate-400">{s.SHIFT_TYPE}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{s.PUMP_ID}</td>
                  <td className="py-3 px-4">{s.OPERATOR_ID}</td>
                  <td className="py-3 px-4">{s.CUSTOMER_ID}</td>
                  <td className="py-3 px-4 font-semibold text-sky-600 dark:text-sky-400">{s.QUANTITY_LITRES.toFixed(1)} L</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">₹{s.SALES_AMOUNT.toFixed(2)}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">₹{s.GROSS_PROFIT.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.PAYMENT_METHOD === 'UPI'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300'
                          : s.PAYMENT_METHOD === 'Card'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      }`}
                    >
                      {s.PAYMENT_METHOD}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSales.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            No transaction records matched the selected filters.
          </div>
        )}
      </div>

      {/* Modal: Record New Sale */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Record Nozzle Sale</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Fuel Type</label>
                  <select
                    value={newSale.FUEL_TYPE_ID}
                    onChange={(e) => {
                      const fuel = fuelTypes.find((f) => f.FUEL_TYPE_ID === e.target.value);
                      setNewSale({
                        ...newSale,
                        FUEL_TYPE_ID: e.target.value,
                        SELLING_PRICE: fuel ? fuel.SELLING_PRICE : 105.5,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    {fuelTypes.map((f) => (
                      <option key={f.FUEL_TYPE_ID} value={f.FUEL_TYPE_ID}>
                        {f.FUEL_NAME} (₹{f.SELLING_PRICE})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">Dispenser Pump</label>
                  <select
                    value={newSale.PUMP_ID}
                    onChange={(e) => setNewSale({ ...newSale, PUMP_ID: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    {pumps.map((p) => (
                      <option key={p.PUMP_ID} value={p.PUMP_ID}>
                        {p.PUMP_NAME}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Quantity (Litres)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={newSale.QUANTITY_LITRES}
                    onChange={(e) => setNewSale({ ...newSale, QUANTITY_LITRES: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">Payment Method</label>
                  <select
                    value={newSale.PAYMENT_METHOD}
                    onChange={(e) => setNewSale({ ...newSale, PAYMENT_METHOD: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Total Amount:</span>
                  <span>₹{(newSale.QUANTITY_LITRES * newSale.SELLING_PRICE).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 mt-1">
                  <span>Unit Rate:</span>
                  <span>₹{newSale.SELLING_PRICE}/L</span>
                </div>
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
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
                >
                  {isSubmitting ? 'Recording...' : 'Commit Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
