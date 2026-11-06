import React, { useState } from 'react';
import { FileSpreadsheet, Download, FileText, Calendar, Filter, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('sales');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-11-06');
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    let url = '';
    if (selectedReport === 'sales') {
      url = format === 'csv' ? '/api/reports/sales/csv' : '/api/reports/sales/pdf';
    } else {
      url = '/api/reports/inventory/csv';
    }
    window.open(url, '_blank');
    setTimeout(() => setIsExporting(false), 1500);
  };

  const reportsList = [
    {
      id: 'sales',
      title: 'Sales & Dispenser Audit Report',
      description: 'Transaction-level fuel sales logs, nozzle dispenser breakdown, gross margin per ticket, and settlement method audit.',
      schema: 'SALES_MANAGEMENT.FUEL_SALES',
      formats: ['CSV', 'PDF'],
    },
    {
      id: 'inventory',
      title: 'Underground Tank Inventory & Variance Ledger',
      description: 'Tank dip-stick audit readings, offloading delivery logs, sales reconciliation, and potential fuel theft variance flags.',
      schema: 'INVENTORY_CONTROL.INVENTORY',
      formats: ['CSV'],
    },
    {
      id: 'operator',
      title: 'Operator Productivity & Sales Ranking Report',
      description: 'Shift operator performance, total volume dispensed, ticket averages, and profit generated.',
      schema: 'SALES_MANAGEMENT.VW_OPERATOR_PERFORMANCE',
      formats: ['CSV'],
    },
    {
      id: 'financial',
      title: 'Daily Financial & Net Profit Statement',
      description: 'Daily revenue vs fuel cost of goods sold, operating expense breakdown (OPEX), and net profit margin.',
      schema: 'SALES_MANAGEMENT.DAILY_PROFIT_SUMMARY',
      formats: ['CSV'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Enterprise Reports Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Generate, preview, and export compliance audit reports from SMART_PETROL_DB
        </p>
      </div>

      {/* Date & Filter Configuration Bar */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Audit Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Audit End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => handleDownload('csv')}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white dark:bg-navy-950 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-800 dark:text-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download CSV Data</span>
          </button>
          <button
            onClick={() => handleDownload('pdf')}
            disabled={isExporting || selectedReport !== 'sales'}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Audit PDF</span>
          </button>
        </div>
      </div>

      {/* Reports Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map((rep) => {
          const isSelected = selectedReport === rep.id;
          return (
            <div
              key={rep.id}
              onClick={() => setSelectedReport(rep.id)}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                  : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{rep.schema}</span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{rep.title}</h3>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">{rep.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">Available Formats:</span>
                <div className="flex items-center gap-1.5">
                  {rep.formats.map((fmt) => (
                    <span
                      key={fmt}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
