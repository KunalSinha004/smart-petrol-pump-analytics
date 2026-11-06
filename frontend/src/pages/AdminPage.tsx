import React, { useState, useEffect } from 'react';
import { ShieldCheck, Server, Users, FileText, Plus, Cpu, HardDrive, CheckCircle2, Clock, X } from 'lucide-react';
import { adminApi } from '../services/api';

export const AdminPage: React.FC = () => {
  const [health, setHealth] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    role: 'OPERATOR',
    password: '',
  });

  const fetchAdminData = async () => {
    try {
      const [healthRes, usersRes, logsRes, jobsRes] = await Promise.all([
        adminApi.getSystemHealth(),
        adminApi.listUsers(),
        adminApi.getAuditLogs(30),
        adminApi.getScheduledJobs(),
      ]);
      setHealth(healthRes);
      setUsers(usersRes);
      setAuditLogs(logsRes);
      setJobs(jobsRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createUser(newUser);
      setShowAddUserModal(false);
      setNewUser({ email: '', full_name: '', role: 'OPERATOR', password: '' });
      fetchAdminData();
    } catch (err) {
      alert(`Error creating user: ${err}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Enterprise Admin & Governance
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300">
              RBAC Protected
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            System diagnostics, identity access management, security audit log & task scheduler
          </p>
        </div>

        <button
          onClick={() => setShowAddUserModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Provision User Account</span>
        </button>
      </div>

      {/* System Diagnostics Health Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">API Gateway</span>
            <Server className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">OPERATIONAL</div>
          <span className="text-[11px] text-slate-400">FastAPI 2.0.0 ASGI</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">Host CPU Utilization</span>
            <Cpu className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {health?.server?.cpu_usage_pct || 14.5}%
          </div>
          <span className="text-[11px] text-slate-400">Low load • Nominal</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">Memory Utilization</span>
            <HardDrive className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {health?.server?.memory_usage_pct || 38.2}%
          </div>
          <span className="text-[11px] text-slate-400">Buffer cache optimized</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">Snowflake Foundation</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
            {health?.database?.warehouse || 'SPPA_WH'}
          </div>
          <span className="text-[11px] text-slate-400">State: {health?.database?.warehouse_state || 'ACTIVE'}</span>
        </div>
      </div>

      {/* Two Column Layout: User Management & Scheduled Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Management */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active RBAC Identity Accounts</h2>
            <span className="text-xs text-slate-400">{users.length} Users Enrolled</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {users.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{u.full_name}</div>
                  <div className="text-slate-400 text-[11px]">{u.email}</div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : u.role === 'MANAGER'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : u.role === 'ANALYST'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {u.role}
                  </span>
                  <div className="text-[10px] text-emerald-500 mt-1 font-semibold">● Active</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Automated Jobs */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Scheduled Maintenance Jobs</h2>
            <span className="text-xs text-slate-400 font-mono">Snowflake Tasks & Crons</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {jobs.map((j) => (
              <div key={j.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{j.name}</div>
                  <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                    Schedule: {j.cron} • Last run: {j.last_run}
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {j.status}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">Duration: {j.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Audit Log Table */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Security & Audit Event Trail</h2>
          </div>
          <span className="text-xs text-slate-400">Strict Append-Only Logging</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Event</th>
                <th className="py-2.5 px-4">Actor</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">IP Address</th>
                <th className="py-2.5 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-4 text-slate-400">{log.timestamp.slice(0, 19).replace('T', ' ')}</td>
                  <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">{log.event}</td>
                  <td className="py-2.5 px-4">{log.user_email}</td>
                  <td className="py-2.5 px-4 font-semibold">{log.role}</td>
                  <td className="py-2.5 px-4 text-slate-400">{log.ip_address}</td>
                  <td className="py-2.5 px-4 font-sans text-slate-600 dark:text-slate-300">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Provision User */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Provision Identity Account</h2>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sundaram"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="priya@smartpetrol.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">RBAC Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="OPERATOR">OPERATOR</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ANALYST">ANALYST</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
                >
                  Enroll User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
