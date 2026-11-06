import React, { useState, useEffect } from 'react';
import { Briefcase, UserCheck, Calendar, Award, Fuel, DollarSign, Clock } from 'lucide-react';
import { workforceApi } from '../services/api';
import { Employee, Shift } from '../types';

export const WorkforcePage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [operatorPerf, setOperatorPerf] = useState<any[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkforce = async () => {
    try {
      const [empRes, opRes, shiftsRes] = await Promise.all([
        workforceApi.listEmployees(),
        workforceApi.getOperatorPerformance(),
        workforceApi.listShifts(),
      ]);
      setEmployees(empRes);
      setOperatorPerf(opRes);
      setShifts(shiftsRes);
    } catch (err) {
      console.error('Failed to load workforce:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkforce();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Workforce & Shift Performance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Staff productivity, operator throughput rankings & shift roster from WORKFORCE_ANALYTICS
        </p>
      </div>

      {/* Operator Leaderboard (VW_OPERATOR_PERFORMANCE) */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Operator Revenue Leaderboard
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">VW_OPERATOR_PERFORMANCE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {operatorPerf.map((op, idx) => (
            <div
              key={op.OPERATOR_ID}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Rank #{idx + 1}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    {op.OPERATOR_NAME || op.OPERATOR_ID}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">{op.OPERATOR_ID}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                  #{idx + 1}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">Total Revenue:</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    ₹{op.REVENUE.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Volume Dispensed:</span>
                  <p className="font-semibold text-sky-600 dark:text-sky-400 mt-0.5">
                    {op.LITRES_SOLD.toFixed(1)} L
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns: Employee Roster & Shift Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Roster */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Staff Directory</h2>
            <span className="text-xs text-slate-400">{employees.length} Staff Members</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {employees.map((emp) => (
              <div key={emp.EMPLOYEE_ID} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold">
                    {emp.EMPLOYEE_NAME.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{emp.EMPLOYEE_NAME}</h3>
                    <p className="text-[11px] text-slate-400">{emp.ROLE} • {emp.EMPLOYEE_ID}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {emp.SHIFT} Shift
                  </span>
                  <div className="text-[10px] text-emerald-500 font-semibold mt-1">● {emp.STATUS}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shift Allocations */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Shift Allocation Schedule</h2>
            <span className="text-xs text-slate-400">FUEL_OPERATIONS.SHIFTS</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {shifts.map((sh) => (
              <div key={sh.SHIFT_ID} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-slate-900 dark:text-white">{sh.SHIFT_ID}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">({sh.SHIFT_TYPE})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{sh.START_TIME} - {sh.END_TIME} • Date: {sh.SHIFT_DATE}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    Operator: {sh.OPERATOR_ID}
                  </span>
                  <div className="text-[10px] text-slate-400">Manager: {sh.MANAGER_ID}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
