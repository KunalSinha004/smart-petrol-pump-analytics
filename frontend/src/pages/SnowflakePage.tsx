import React, { useState, useEffect } from 'react';
import {
  Database,
  Layers,
  Play,
  Clock,
  Copy,
  Activity,
  CheckCircle,
  AlertTriangle,
  Code2,
  Terminal,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { snowflakeApi } from '../services/api';
import { SnowflakeStatus } from '../types';

export const SnowflakePage: React.FC = () => {
  const [status, setStatus] = useState<SnowflakeStatus | null>(null);
  const [views, setViews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'status' | 'query' | 'views' | 'timetravel' | 'cloning' | 'streams'>('status');

  // Query Runner State
  const [sqlQuery, setSqlQuery] = useState(
    `SELECT f.FUEL_NAME,
       SUM(s.QUANTITY_LITRES) AS LITRES_SOLD,
       SUM(s.SALES_AMOUNT) AS SALES_REVENUE,
       SUM(s.GROSS_PROFIT) AS GROSS_PROFIT
FROM SALES_MANAGEMENT.FUEL_SALES s
JOIN FUEL_OPERATIONS.FUEL_TYPES f ON s.FUEL_TYPE_ID = f.FUEL_TYPE_ID
GROUP BY f.FUEL_NAME
ORDER BY SALES_REVENUE DESC;`
  );
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Time Travel & Cloning state
  const [timeTravelData, setTimeTravelData] = useState<any | null>(null);
  const [cloneData, setCloneData] = useState<any | null>(null);
  const [streamsTasksData, setStreamsTasksData] = useState<any | null>(null);

  const fetchSnowflakeInfo = async () => {
    try {
      const [stRes, vwRes] = await Promise.all([
        snowflakeApi.getStatus(),
        snowflakeApi.listViews(),
      ]);
      setStatus(stRes);
      setViews(vwRes.views || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSnowflakeInfo();
  }, []);

  const handleRunQuery = async () => {
    setIsExecuting(true);
    setQueryError(null);
    try {
      const res = await snowflakeApi.executeQuery(sqlQuery);
      setQueryResult(res);
    } catch (err: any) {
      setQueryError(err.message || 'Execution error');
      setQueryResult(null);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRunTimeTravel = async () => {
    try {
      const res = await snowflakeApi.getTimeTravelDemo();
      setTimeTravelData(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunClone = async () => {
    try {
      const res = await snowflakeApi.getZeroCopyCloneDemo();
      setCloneData(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoadStreams = async () => {
    try {
      const res = await snowflakeApi.getStreamsTasks();
      setStreamsTasksData(res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Snowflake Data Cloud Foundation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {status?.mode || 'CONNECTED'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Architecture, live schema views, parameterized queries & continuous data protection
          </p>
        </div>

        <button
          onClick={fetchSnowflakeInfo}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 text-slate-700 dark:text-slate-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Warehouse Status</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 sm:space-x-6 overflow-x-auto text-xs sm:text-sm font-semibold">
        {[
          { id: 'status', label: 'Warehouse & Schemas' },
          { id: 'query', label: 'Interactive Query Runner' },
          { id: 'views', label: 'Analytical Views (5)' },
          { id: 'timetravel', label: 'Time Travel Demo' },
          { id: 'cloning', label: 'Zero-Copy Cloning' },
          { id: 'streams', label: 'Streams & Tasks (CDC)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              if (tab.id === 'timetravel') handleRunTimeTravel();
              if (tab.id === 'cloning') handleRunClone();
              if (tab.id === 'streams') handleLoadStreams();
            }}
            className={`py-3 px-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: STATUS & SCHEMAS */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          {/* Warehouse Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card">
              <span className="text-xs text-slate-400 font-mono">DATABASE</span>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                {status?.database || 'SMART_PETROL_DB'}
              </div>
              <span className="text-[11px] text-emerald-500 font-semibold">5 Functional Schemas</span>
            </div>

            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card">
              <span className="text-xs text-slate-400 font-mono">VIRTUAL WAREHOUSE</span>
              <div className="text-lg font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
                {status?.warehouse || 'SPPA_WH'} ({status?.warehouse_size || 'XSMALL'})
              </div>
              <span className="text-[11px] text-slate-400">Auto-Suspend: 60s • Auto-Resume: TRUE</span>
            </div>

            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card">
              <span className="text-xs text-slate-400 font-mono">SECURITY ROLE</span>
              <div className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
                {status?.role || 'ACCOUNTADMIN'}
              </div>
              <span className="text-[11px] text-slate-400">Strict RBAC & Least-Privilege</span>
            </div>

            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card">
              <span className="text-xs text-slate-400 font-mono">QUERY PERFORMANCE</span>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {status?.avg_latency_ms || 18.5} ms Avg
              </div>
              <span className="text-[11px] text-slate-400">{status?.total_queries_executed || 1} Queries run</span>
            </div>
          </div>

          {/* 5 Functional Schemas Overview */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Active Schemas & Table Hierarchy
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Structured matching Smart_Petrol_Pump_Full_Setup_Error_Checked.sql
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-mono font-bold text-emerald-600">1. CUSTOMER_DATA</span>
                <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <li>• <strong>CUSTOMERS</strong> (Customer profiles & types)</li>
                  <li>• <strong>CUSTOMER_JSON_DATA</strong> (Semi-structured VARIANT)</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-mono font-bold text-sky-600">2. FUEL_OPERATIONS</span>
                <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <li>• <strong>PUMPS</strong> (Nozzle dispenser IDs & status)</li>
                  <li>• <strong>FUEL_TYPES</strong> (Petrol, Diesel, CNG rates)</li>
                  <li>• <strong>SHIFTS</strong> (Roster assignments & hours)</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-mono font-bold text-indigo-600">3. SALES_MANAGEMENT</span>
                <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <li>• <strong>FUEL_SALES</strong> (Primary transaction ledger)</li>
                  <li>• <strong>OPERATOR_SALES</strong> (Staff sales breakdown)</li>
                  <li>• <strong>DAILY_PROFIT_SUMMARY</strong> (Net profit rollups)</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-mono font-bold text-teal-600">4. INVENTORY_CONTROL</span>
                <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <li>• <strong>EXPENSES</strong> (Vouchers & power allocations)</li>
                  <li>• <strong>INVENTORY</strong> (Underground tank balances)</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-mono font-bold text-purple-600">5. WORKFORCE_ANALYTICS</span>
                <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <li>• <strong>EMPLOYEES</strong> (Roster directory & active roles)</li>
                  <li>• <strong>SHIFT_SUMMARY</strong> (Performance aggregates)</li>
                  <li>• <strong>CLEANED_SALES</strong> (Transient pipeline table)</li>
                  <li>• <strong>LOAD_VALIDATION</strong> (Session validation audit)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUERY RUNNER */}
      {activeTab === 'query' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Interactive Snowflake SQL Console
                </h2>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                Read-Only Guardrails Enforced
              </span>
            </div>

            <textarea
              rows={6}
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Destructive operations (DROP/TRUNCATE) are strictly blocked.</span>
              </div>
              <button
                onClick={handleRunQuery}
                disabled={isExecuting || !sqlQuery.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isExecuting ? 'Executing in SPPA_WH...' : 'Run Query'}</span>
              </button>
            </div>
          </div>

          {/* Query Error Display */}
          {queryError && (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300">
              <span className="font-bold">Execution Error:</span> {queryError}
            </div>
          )}

          {/* Results Table */}
          {queryResult && (
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card overflow-hidden">
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Returned <strong>{queryResult.row_count} rows</strong> in{' '}
                  <strong className="text-emerald-500">{queryResult.execution_time_ms} ms</strong>
                </span>
                <span className="font-mono text-slate-400 text-[11px]">{queryResult.engine}</span>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase sticky top-0">
                    <tr>
                      {queryResult.columns.map((c: string) => (
                        <th key={c} className="py-2.5 px-3">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    {queryResult.rows.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        {queryResult.columns.map((col: string) => (
                          <td key={col} className="py-2 px-3">
                            {typeof row[col] === 'number'
                              ? row[col].toLocaleString('en-IN', { maximumFractionDigits: 2 })
                              : String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ANALYTICAL VIEWS */}
      {activeTab === 'views' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {views.map((v) => (
              <div
                key={v.view_name}
                className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {v.schema}.{v.view_name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {v.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">{v.purpose}</p>
                <div className="mt-3 pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>View Type: {v.is_secure ? 'SECURE VIEW' : 'STANDARD VIEW'}</span>
                  <button
                    onClick={() => {
                      setSqlQuery(`SELECT * FROM ${v.schema}.${v.view_name} LIMIT 20;`);
                      setActiveTab('query');
                    }}
                    className="text-emerald-600 hover:underline font-semibold"
                  >
                    Query View →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TIME TRAVEL DEMO */}
      {activeTab === 'timetravel' && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Snowflake Time Travel (Continuous Data Protection)
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Time Travel enables querying historical data at any point within a defined retention window (up to 90 days), providing instant point-in-time recovery and audit inspection without restoring tape or disk backups.
          </p>

          <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto">
{`-- Query state of FUEL_SALES as it existed 15 minutes ago:
SELECT * 
FROM SALES_MANAGEMENT.FUEL_SALES 
AT(OFFSET => -60*15);

-- Or restore from a specific query ID:
SELECT * 
FROM SALES_MANAGEMENT.FUEL_SALES 
BEFORE(STATEMENT => '01b34e2f-0001-2a9c-0002-3f1200034a7e');`}
          </pre>

          {timeTravelData && (
            <div className="p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 rounded-xl text-xs space-y-1">
              <span className="font-bold text-sky-900 dark:text-sky-300">Feature Status: {timeTravelData.status}</span>
              <p className="text-slate-600 dark:text-slate-300">{timeTravelData.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ZERO-COPY CLONING DEMO */}
      {activeTab === 'cloning' && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <Copy className="w-5 h-5 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Zero-Copy Cloning Demonstration
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Zero-copy cloning references existing micro-partitions without physically copying data, allowing instantaneous creation of isolated staging or testing environments with zero additional storage costs until modified.
          </p>

          <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto">
{`-- Instantly clone production sales into dev sandbox:
CREATE TABLE SALES_MANAGEMENT.FUEL_SALES_DEV 
CLONE SALES_MANAGEMENT.FUEL_SALES;

-- Clone an entire database for staging QA:
CREATE DATABASE SMART_PETROL_STAGING 
CLONE SMART_PETROL_DB;`}
          </pre>

          {cloneData && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs space-y-1">
              <span className="font-bold text-emerald-900 dark:text-emerald-300">Clone Execution Duration: {cloneData.duration_ms} ms</span>
              <p className="text-slate-600 dark:text-slate-300">{cloneData.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: STREAMS & TASKS */}
      {activeTab === 'streams' && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Change Data Capture (CDC) Streams & Automated Tasks
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Continuous automated pipeline: Streams track change data capture on sales events, while Tasks execute serverless ledger rollups into DAILY_PROFIT_SUMMARY.
          </p>

          <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto">
{`CREATE OR REPLACE STREAM SALES_MANAGEMENT.STM_FUEL_SALES_CDC
  ON TABLE SALES_MANAGEMENT.FUEL_SALES
  APPEND_ONLY = TRUE;

CREATE OR REPLACE TASK SALES_MANAGEMENT.TSK_RECONCILE_DAILY_PROFIT
  WAREHOUSE = SPPA_WH
  SCHEDULE = 'USING CRON 0 23 * * * Asia/Kolkata'
AS
  INSERT INTO SALES_MANAGEMENT.DAILY_PROFIT_SUMMARY (...)
  SELECT ... FROM SALES_MANAGEMENT.STM_FUEL_SALES_CDC;`}
          </pre>

          {streamsTasksData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Active Stream: STM_FUEL_SALES_CDC</span>
                <p className="text-slate-500 mt-1">Status: Tracking Append-only sales dispenser transactions</p>
              </div>
              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Active Task: TSK_RECONCILE_DAILY_PROFIT</span>
                <p className="text-slate-500 mt-1">Schedule: 23:00 Daily • Target: DAILY_PROFIT_SUMMARY</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
