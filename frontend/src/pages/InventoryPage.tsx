import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, ShieldAlert, Plus, CheckCircle2, TrendingDown, ArrowDownRight, RefreshCw, X } from 'lucide-react';
import { inventoryApi, fuelTypesApi } from '../services/api';
import { InventoryRecord, TheftAlert, FuelType } from '../types';

export const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [theftAlerts, setTheftAlerts] = useState<TheftAlert[]>([]);
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [newLog, setNewLog] = useState({
    INVENTORY_DATE: new Date().toISOString().split('T')[0],
    FUEL_TYPE_ID: 'F001',
    OPENING_STOCK_LITRES: 7942.0,
    RECEIVED_STOCK_LITRES: 1500.0,
    RECORDED_SALES_LITRES: 160.0,
    ACTUAL_CLOSING_LITRES: 9270.0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventoryData = async () => {
    try {
      const [invRes, theftRes, fuelsRes] = await Promise.all([
        inventoryApi.list(),
        inventoryApi.getTheftAlerts(),
        fuelTypesApi.list(),
      ]);
      setInventory(invRes);
      setTheftAlerts(theftRes);
      setFuelTypes(fuelsRes);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await inventoryApi.create(newLog);
      setInventory([created, ...inventory]);
      setShowLogModal(false);
      // Refresh theft alerts
      const updatedAlerts = await inventoryApi.getTheftAlerts();
      setTheftAlerts(updatedAlerts);
    } catch (err) {
      alert(`Error logging inventory: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group latest closing stock by fuel type
  const tankLevels: Record<string, { current: number; max: number; name: string; unit: string }> = {
    F001: { current: 7942.0, max: 10000.0, name: 'Petrol Tank A', unit: 'Litres' },
    F002: { current: 7635.0, max: 12000.0, name: 'Diesel Tank B', unit: 'Litres' },
    F003: { current: 2615.0, max: 4000.0, name: 'CNG Cascades', unit: 'Kg' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Smart Inventory & Tank Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Underground tank volume reconciliation, dip-stick calibration & theft alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open('/api/reports/inventory/csv', '_blank')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50"
          >
            Export Stock CSV
          </button>
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Log Dip-Stick Audit</span>
          </button>
        </div>
      </div>

      {/* Underground Tank Fill Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(tankLevels).map(([fid, tank]) => {
          const pct = Math.round((tank.current / tank.max) * 100);
          return (
            <div
              key={fid}
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{tank.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{fid}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  {pct}% Capacity
                </span>
              </div>

              {/* Tank Level Bar */}
              <div className="mt-4 mb-2">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-baseline justify-between text-xs mt-3">
                <span className="text-slate-500">Current Balance:</span>
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  {tank.current.toLocaleString()} {tank.unit}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>Maximum Capacity:</span>
                <span>{tank.max.toLocaleString()} {tank.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Theft & Discrepancy Risk Alerts Section (VW_FUEL_THEFT_ALERTS) */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Inventory Theft & Discrepancy Risk Monitor
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">VW_FUEL_THEFT_ALERTS</span>
        </div>

        <div className="space-y-2.5">
          {theftAlerts.filter((a) => a.THEFT_RISK !== 'NORMAL').map((alert) => (
            <div
              key={alert.INVENTORY_ID}
              className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                alert.THEFT_RISK === 'HIGH_THEFT_RISK'
                  ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/60'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold text-xs uppercase px-2 py-0.5 rounded text-[10px] ${
                      alert.THEFT_RISK === 'HIGH_THEFT_RISK'
                        ? 'bg-red-200 text-red-900 dark:bg-red-900/80 dark:text-red-200'
                        : 'bg-amber-200 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200'
                    }`}
                  >
                    {alert.THEFT_RISK.replace(/_/g, ' ')}
                  </span>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white">
                    {alert.FUEL_NAME} Tank Discrepancy on {alert.INVENTORY_DATE}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Expected Closing: {alert.EXPECTED_CLOSING_LITRES.toLocaleString()} L | Actual Closing: {alert.ACTUAL_CLOSING_LITRES.toLocaleString()} L
                </p>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                  {alert.VARIANCE_LITRES} Litres
                </span>
                <div className="text-[10px] text-slate-400">Physical Dip-Stick Variance</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Movement Ledger Table */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Underground Tank Movement Ledger</h2>
          <span className="text-xs text-slate-400 font-mono">INVENTORY_CONTROL.INVENTORY</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Fuel Grade</th>
                <th className="py-3 px-4">Opening (L)</th>
                <th className="py-3 px-4">Received (L)</th>
                <th className="py-3 px-4">Sales (L)</th>
                <th className="py-3 px-4">Expected (L)</th>
                <th className="py-3 px-4">Actual Closing (L)</th>
                <th className="py-3 px-4">Variance</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {inventory.map((inv) => (
                <tr key={inv.INVENTORY_ID} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{inv.INVENTORY_ID}</td>
                  <td className="py-3 px-4">{inv.INVENTORY_DATE}</td>
                  <td className="py-3 px-4 font-semibold">{inv.FUEL_TYPE_ID}</td>
                  <td className="py-3 px-4">{inv.OPENING_STOCK_LITRES.toLocaleString()}</td>
                  <td className="py-3 px-4 text-emerald-600 font-medium">+{inv.RECEIVED_STOCK_LITRES.toLocaleString()}</td>
                  <td className="py-3 px-4 text-rose-500 font-medium">-{inv.RECORDED_SALES_LITRES.toLocaleString()}</td>
                  <td className="py-3 px-4">{inv.EXPECTED_CLOSING_LITRES.toLocaleString()}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{inv.ACTUAL_CLOSING_LITRES.toLocaleString()}</td>
                  <td className="py-3 px-4 font-bold text-red-600 dark:text-red-400">{inv.VARIANCE_LITRES} L</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.STATUS === 'NORMAL'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                      }`}
                    >
                      {inv.STATUS}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log Tank Reading */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Log Tank Dip-Stick Reading</h2>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Fuel Grade</label>
                <select
                  value={newLog.FUEL_TYPE_ID}
                  onChange={(e) => setNewLog({ ...newLog, FUEL_TYPE_ID: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  {fuelTypes.map((f) => (
                    <option key={f.FUEL_TYPE_ID} value={f.FUEL_TYPE_ID}>
                      {f.FUEL_NAME} ({f.FUEL_TYPE_ID})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Opening Stock (L)</label>
                  <input
                    type="number"
                    value={newLog.OPENING_STOCK_LITRES}
                    onChange={(e) => setNewLog({ ...newLog, OPENING_STOCK_LITRES: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">Received Tanker (L)</label>
                  <input
                    type="number"
                    value={newLog.RECEIVED_STOCK_LITRES}
                    onChange={(e) => setNewLog({ ...newLog, RECEIVED_STOCK_LITRES: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Recorded Sales (L)</label>
                  <input
                    type="number"
                    value={newLog.RECORDED_SALES_LITRES}
                    onChange={(e) => setNewLog({ ...newLog, RECORDED_SALES_LITRES: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">Actual Closing Dip (L)</label>
                  <input
                    type="number"
                    value={newLog.ACTUAL_CLOSING_LITRES}
                    onChange={(e) => setNewLog({ ...newLog, ACTUAL_CLOSING_LITRES: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between font-bold">
                <span>Calculated Variance:</span>
                <span className="text-red-500">
                  {(
                    newLog.ACTUAL_CLOSING_LITRES -
                    (newLog.OPENING_STOCK_LITRES + newLog.RECEIVED_STOCK_LITRES - newLog.RECORDED_SALES_LITRES)
                  ).toFixed(1)}{' '}
                  Litres
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
                >
                  {isSubmitting ? 'Logging...' : 'Commit Tank Reading'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
