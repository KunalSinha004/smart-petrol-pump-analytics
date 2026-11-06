import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Send,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Database,
  Code2,
  Clock,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { aiApi } from '../services/api';
import { ForecastResult, AnomalyResult, Recommendation, AIQueryResponse } from '../types';

export const AIPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assistant' | 'forecast' | 'anomalies' | 'recommendations'>('assistant');

  // AI Assistant State
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState<AIQueryResponse[]>([
    {
      question: 'Which fuel type generated the highest revenue?',
      answer:
        'Based on verified transaction logs in SMART_PETROL_DB.SALES_MANAGEMENT.FUEL_SALES, **Petrol** leads overall revenue with **₹248,340.50** (2,354.0 Litres) across 78 transactions, followed by Diesel at ₹214,250.00.',
      generated_sql: `SELECT f.FUEL_NAME,
       SUM(s.QUANTITY_LITRES) AS LITRES_SOLD,
       SUM(s.SALES_AMOUNT) AS SALES_REVENUE,
       SUM(s.GROSS_PROFIT) AS GROSS_PROFIT,
       COUNT(*) AS TRANSACTIONS
FROM SALES_MANAGEMENT.FUEL_SALES s
JOIN FUEL_OPERATIONS.FUEL_TYPES f ON s.FUEL_TYPE_ID = f.FUEL_TYPE_ID
GROUP BY f.FUEL_NAME
ORDER BY SALES_REVENUE DESC;`,
      is_read_only_validated: true,
      engine: 'Snowflake Enterprise (SPPA_WH)',
      execution_time_ms: 18.4,
      data: [
        { FUEL_NAME: 'Petrol', LITRES_SOLD: 2354.0, SALES_REVENUE: 248340.5, GROSS_PROFIT: 22363.0, TRANSACTIONS: 78 },
        { FUEL_NAME: 'Diesel', LITRES_SOLD: 2321.2, SALES_REVENUE: 214250.0, GROSS_PROFIT: 18105.4, TRANSACTIONS: 64 },
        { FUEL_NAME: 'CNG', LITRES_SOLD: 1083.4, SALES_REVENUE: 88838.8, GROSS_PROFIT: 13000.8, TRANSACTIONS: 34 },
      ],
      columns: ['FUEL_NAME', 'LITRES_SOLD', 'SALES_REVENUE', 'GROSS_PROFIT', 'TRANSACTIONS'],
    },
  ]);

  // Forecast State
  const [forecastDays, setForecastDays] = useState(14);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);

  // Anomalies State
  const [anomalyResult, setAnomalyResult] = useState<AnomalyResult | null>(null);
  const [isLoadingAnomalies, setIsLoadingAnomalies] = useState(false);

  // Recommendations State
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  useEffect(() => {
    loadForecast(14);
    loadAnomalies();
    loadRecommendations();
  }, []);

  const loadForecast = async (days: number) => {
    setIsLoadingForecast(true);
    try {
      const res = await aiApi.getForecast(days);
      setForecastResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingForecast(false);
    }
  };

  const loadAnomalies = async () => {
    setIsLoadingAnomalies(true);
    try {
      const res = await aiApi.getAnomalies();
      setAnomalyResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAnomalies(false);
    }
  };

  const loadRecommendations = async () => {
    setIsLoadingRecs(true);
    try {
      const res = await aiApi.getRecommendations();
      setRecommendations(res.recommendations);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleAsk = async (questionToAsk?: string) => {
    const q = questionToAsk || inputQuestion;
    if (!q.trim()) return;

    setIsAsking(true);
    try {
      const resp = await aiApi.askAssistant(q);
      setChatHistory([resp, ...chatHistory]);
      if (!questionToAsk) setInputQuestion('');
    } catch (err) {
      alert(`Assistant error: ${err}`);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              AI Intelligence Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              Machine Learning & NLP
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Predictive demand forecasting, multi-vector anomaly detection, and natural language Snowflake business assistant
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-1 sm:space-x-4">
        <button
          onClick={() => setActiveTab('assistant')}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'assistant'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>AI Business Assistant</span>
        </button>

        <button
          onClick={() => setActiveTab('forecast')}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'forecast'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Sales Forecasting</span>
        </button>

        <button
          onClick={() => setActiveTab('anomalies')}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'anomalies'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Anomaly Detection</span>
          {anomalyResult && anomalyResult.critical_count > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
              {anomalyResult.critical_count}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'recommendations'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Smart Recommendations</span>
        </button>
      </div>

      {/* TAB 1: AI BUSINESS ASSISTANT */}
      {activeTab === 'assistant' && (
        <div className="space-y-6">
          {/* Query Input Box */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Ask Natural Language Business Questions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Generates safe, controlled, read-only SQL queries directly against SMART_PETROL_DB schemas.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask e.g. 'Which fuel type generated highest revenue?', 'Show top operators', 'Any inventory theft risks?'"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
              />
              <button
                onClick={() => handleAsk()}
                disabled={isAsking || !inputQuestion.trim()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAsking ? 'Querying...' : 'Ask AI'}</span>
              </button>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold">Suggested Questions:</span>
              {[
                'Which fuel type generated the highest revenue?',
                'Show the best-performing pump',
                'Show inventory theft risk',
                'Who is the top operator by sales?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleAsk(suggestion)}
                  className="px-2.5 py-1 text-[11px] bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-600 dark:text-slate-300 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation & Query Responses */}
          <div className="space-y-4">
            {chatHistory.map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card space-y-3"
              >
                {/* User Prompt */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    Q
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">Executive Query</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{item.question}</h3>
                  </div>
                </div>

                {/* AI Executive Summary */}
                <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>AI Business Intelligence Insight:</span>
                  </div>
                  {item.answer}
                </div>

                {/* Controlled SQL Query Block */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Code2 className="w-3.5 h-3.5 text-emerald-500" />
                      Generated Read-Only Snowflake SQL:
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      ✓ Read-Only Validated ({item.execution_time_ms}ms)
                    </span>
                  </div>
                  <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto border border-slate-800">
                    {item.generated_sql}
                  </pre>
                </div>

                {/* Tabular Result Preview */}
                {item.data && item.data.length > 0 && (
                  <div className="mt-2 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                          <tr>
                            {item.columns.map((col) => (
                              <th key={col} className="py-2.5 px-3">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                          {item.data.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              {item.columns.map((col) => (
                                <td key={col} className="py-2 px-3 font-mono">
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
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SALES FORECASTING */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          {/* Model Specification Card */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Fuel Demand & Revenue Forecasting Model
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Multivariate Ridge Regression incorporating 30-day velocity and day-of-week seasonality
                </p>
              </div>

              {/* Horizon Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Horizon:</span>
                {[7, 14, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setForecastDays(d);
                      loadForecast(d);
                    }}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                      forecastDays === d
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Model Evaluation Metrics Banner */}
            {forecastResult && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Model MAE</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {forecastResult.metrics.mean_absolute_error_litres} L
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Model RMSE</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {forecastResult.metrics.root_mean_squared_error_litres} L
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Accuracy (MAPE)</span>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {forecastResult.metrics.mean_absolute_percentage_error}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">R² Fit Score</span>
                  <p className="text-base font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                    {forecastResult.metrics.r2_variance_score}
                  </p>
                </div>
              </div>
            )}

            {/* Forecast Chart with Confidence Bands */}
            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecastResult?.forecast || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${Number(val).toFixed(1)} L`, name]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="volume_upper_bound"
                    name="90% Upper Bound"
                    stroke="#A7F3D0"
                    fill="#ECFDF5"
                    fillOpacity={0.4}
                  />
                  <Line
                    type="monotone"
                    dataKey="estimated_volume_litres"
                    name="Predicted Volume (Litres)"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume_lower_bound"
                    name="90% Lower Bound"
                    stroke="#A7F3D0"
                    fill="none"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>
                {forecastResult?.disclaimer ||
                  'Predictions are statistical estimates. Exogenous price shocks may cause variance.'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANOMALY DETECTION */}
      {activeTab === 'anomalies' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Multi-Vector Operational Anomaly Scanner
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Isolation Forest & statistical Z-score bounds on fuel tanks, nozzle flow, and ticket spikes
                </p>
              </div>

              <button
                onClick={loadAnomalies}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-scan System</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-red-600">Critical Anomalies</span>
                <p className="text-xl font-bold text-red-700 dark:text-red-300 mt-0.5">
                  {anomalyResult?.critical_count || 0}
                </p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-amber-600">High Risk Alerts</span>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-0.5">
                  {anomalyResult?.high_count || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-blue-600">Medium Ticket Outliers</span>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-0.5">
                  {anomalyResult?.medium_count || 0}
                </p>
              </div>
            </div>

            {/* Anomaly Cards List */}
            <div className="space-y-3 mt-4">
              {anomalyResult?.anomalies.map((anom) => (
                <div
                  key={anom.id}
                  className={`p-4 rounded-xl border flex flex-col gap-2 ${
                    anom.severity === 'CRITICAL'
                      ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                      : anom.severity === 'HIGH'
                      ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                      : 'bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          anom.severity === 'CRITICAL'
                            ? 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200'
                            : anom.severity === 'HIGH'
                            ? 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200'
                            : 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200'
                        }`}
                      >
                        {anom.severity}
                      </span>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{anom.entity}</span>
                      <span className="text-slate-400 text-xs font-mono">({anom.date})</span>
                    </div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      {anom.metric_observed}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{anom.explanation}</p>

                  <div className="p-2.5 bg-white dark:bg-navy-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 mt-1">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 dark:text-white">Recommended Remediation:</strong>{' '}
                      {anom.recommended_action}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SMART RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {rec.category.replace(/_/g, ' ')}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{rec.title}</h3>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.priority === 'HIGH'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : rec.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 my-3 leading-relaxed">
                    {rec.recommendation}
                  </p>

                  <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/50 mb-3">
                    <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
                      Expected Business Impact:
                    </span>
                    <p className="text-xs text-emerald-800 dark:text-emerald-200 mt-0.5">{rec.impact}</p>
                  </div>
                </div>

                {/* Evidence Table */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                    Data Evidence from SMART_PETROL_DB:
                  </span>
                  <div className="space-y-1 text-xs">
                    {Object.entries(rec.evidence).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-[11px]">
                        <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
