import React, { useState, useEffect } from 'react';
import { Gauge, CheckCircle, AlertTriangle, XCircle, RefreshCw, Activity, Power } from 'lucide-react';
import { pumpsApi } from '../services/api';
import { PumpPerformance } from '../types';

export const PumpsPage: React.FC = () => {
  const [pumps, setPumps] = useState<PumpPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchPumps = async () => {
    setIsLoading(true);
    try {
      const data = await pumpsApi.list();
      setPumps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load pumps:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPumps();
  }, []);

  const handleToggleStatus = async (pump: PumpPerformance) => {
    const nextStatus = pump.STATUS === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
    setIsUpdating(pump.PUMP_ID);
    try {
      await pumpsApi.updateStatus(pump.PUMP_ID, nextStatus);
      setPumps(
        pumps.map((p) => (p.PUMP_ID === pump.PUMP_ID ? { ...p, STATUS: nextStatus } : p))
      );
    } catch (err) {
      alert(`Failed to update pump status: ${err}`);
    } finally {
      setIsUpdating(null);
    }
  };

  const getPumpRevenue = (p: any): number => {
    return Number(p.revenue ?? p.total_revenue ?? 0);
  };

  const getPumpLitres = (p: any): number => {
    return Number(p.litres ?? p.total_litres ?? 0);
  };

  const getPumpTxns = (p: any): number => {
    return Number(p.transactions ?? p.total_txns ?? 0);
  };

  if (isLoading && pumps.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-64"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const activeCount = pumps.filter((p) => p.STATUS === 'ACTIVE').length;
  const maintCount = pumps.filter((p) => p.STATUS === 'MAINTENANCE').length;
  const islandARev = pumps
    .filter((p) => p.ISLAND === 'Island A')
    .reduce((acc, curr) => acc + getPumpRevenue(curr), 0);
  const islandBRev = pumps
    .filter((p) => p.ISLAND === 'Island B')
    .reduce((acc, curr) => acc + getPumpRevenue(curr), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Dispenser & Island Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time telemetry from SMART_PETROL_DB.FUEL_OPERATIONS.PUMPS & VW_PUMP_UTILIZATION
          </p>
        </div>

        <button
          onClick={fetchPumps}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 text-slate-700 dark:text-slate-300"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Island Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card">
          <span className="text-xs text-slate-500">Active Dispenser Units</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {activeCount} / {pumps.length}
          </div>
          <span className="text-[11px] text-emerald-500 font-semibold">Available for customer fueling</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card">
          <span className="text-xs text-slate-500">Island A Throughput</span>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1">
            ₹{islandARev.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-slate-400">High-flow dual nozzle</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card">
          <span className="text-xs text-slate-500">Island B Throughput</span>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            ₹{islandBRev.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-slate-400">Heavy vehicle & multi-product</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card">
          <span className="text-xs text-slate-500">Maintenance Backlog</span>
          <div className="text-2xl font-bold text-amber-500 mt-1">
            {maintCount} Unit
          </div>
          <span className="text-[11px] text-slate-400">Scheduled technician calibration</span>
        </div>
      </div>

      {/* Dispenser Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pumps.map((pump) => {
          const isActive = pump.STATUS === 'ACTIVE';
          const rev = getPumpRevenue(pump);
          const litres = getPumpLitres(pump);
          const txns = getPumpTxns(pump);

          return (
            <div
              key={pump.PUMP_ID}
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-slate-900 dark:text-white">{pump.PUMP_NAME}</h2>
                    <span className="text-xs text-slate-400 font-mono">
                      {pump.PUMP_ID} • {pump.ISLAND}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}
                  ></span>
                  {pump.STATUS}
                </span>
              </div>

              {/* Pump Metrics */}
              <div className="grid grid-cols-3 gap-3 my-4 text-center">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Sales</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    ₹{rev.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Litres Dispensed</span>
                  <p className="text-sm font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                    {litres.toLocaleString('en-IN', { maximumFractionDigits: 1 })} L
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Transactions</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{txns}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleToggleStatus(pump)}
                  disabled={isUpdating === pump.PUMP_ID}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                    isActive
                      ? 'text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                      : 'text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>
                    {isUpdating === pump.PUMP_ID
                      ? 'Switching...'
                      : isActive
                      ? 'Place in Maintenance'
                      : 'Restore to Active'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
