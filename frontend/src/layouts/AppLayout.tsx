import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Fuel,
  Gauge,
  Boxes,
  Users,
  Briefcase,
  PieChart,
  BrainCircuit,
  FileSpreadsheet,
  Database,
  ShieldCheck,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink,
  RefreshCw,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  allowedRoles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Executive Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Fuel Sales', path: '/sales', icon: Fuel },
  { name: 'Pump Management', path: '/pumps', icon: Gauge, badge: 'Live' },
  { name: 'Smart Inventory', path: '/inventory', icon: Boxes },
  { name: 'Customer Intelligence', path: '/customers', icon: Users },
  { name: 'Workforce & Shifts', path: '/workforce', icon: Briefcase },
  { name: 'Expenses & Profit', path: '/expenses', icon: PieChart },
  { name: 'AI Intelligence Center', path: '/ai', icon: BrainCircuit, badge: 'AI ML' },
  { name: 'Reports Center', path: '/reports', icon: FileSpreadsheet },
  { name: 'Snowflake Foundation', path: '/snowflake', icon: Database },
  { name: 'Admin Panel', path: '/admin', icon: ShieldCheck, allowedRoles: ['ADMIN', 'MANAGER'] },
];

export const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, switchRole, logout } = useAuth();
  const location = useLocation();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const getBreadcrumb = () => {
    const item = NAV_ITEMS.find((n) => n.path === location.pathname);
    return item ? item.name : 'Console';
  };

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-800 bg-navy-950 text-slate-300 transition-all duration-300 ease-in-out z-30 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-navy-850">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-glow-emerald flex-shrink-0">
              <Fuel className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-white tracking-wide text-base">SMART PETROL</span>
                <span className="text-[10px] tracking-wider uppercase text-emerald-400 font-semibold">
                  Snowflake BI Platform
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-850 transition-colors"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Snowflake Warehouse Status Badge */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-navy-850 bg-navy-900/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                SPPA_WH
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              Database: <span className="text-slate-200 font-mono">SMART_PETROL_DB</span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            if (item.allowedRoles && user && !item.allowedRoles.includes(user.role)) {
              return null;
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-navy-850'
                  }`
                }
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card */}
        <div className="p-3 border-t border-navy-850 bg-navy-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
              {user?.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
                <p className="text-[11px] text-emerald-400 truncate uppercase font-mono">{user?.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* --- MOBILE SIDEBAR DRAWER --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-y-0 left-0 w-72 bg-navy-950 text-slate-300 z-50 flex flex-col md:hidden border-r border-slate-800"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-navy-850">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                    <Fuel className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-white text-base">SMART PETROL</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                          isActive ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-navy-850'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-950 flex items-center justify-between px-4 sm:px-6 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-800 dark:text-slate-200">{getBreadcrumb()}</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Global Search Bar */}
            <div className="relative hidden lg:block w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Global search (Ctrl+K)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Snowflake Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-full text-xs font-medium text-emerald-800 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono">SMART_PETROL_DB</span>
              <span className="text-emerald-400">|</span>
              <span className="font-mono text-[11px]">SPPA_WH</span>
            </div>

            {/* Notification Center */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-3">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Station Alerts</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-semibold text-[10px]">
                      2 Critical
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
                      <p className="font-semibold text-red-800 dark:text-red-300">Fuel Theft / Variance Risk</p>
                      <p className="text-slate-600 dark:text-slate-300 mt-0.5 text-[11px]">
                        Tank F002 (Diesel) recorded -45.0L discrepancy on 2026-11-04.
                      </p>
                    </div>
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg">
                      <p className="font-semibold text-amber-800 dark:text-amber-300">Maintenance Warning</p>
                      <p className="text-slate-600 dark:text-slate-300 mt-0.5 text-[11px]">
                        Pump 4 (Island B) status is currently MAINTENANCE.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  {user?.role.charAt(0)}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-semibold text-slate-800 dark:text-white leading-tight">{user?.role}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
                    {user?.full_name}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="font-bold text-slate-900 dark:text-white">{user?.full_name}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">{user?.email}</p>
                  </div>
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch RBAC Role (Demo)
                  </div>
                  {(['ADMIN', 'MANAGER', 'OPERATOR', 'ANALYST'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 ${
                        user?.role === r ? 'text-emerald-600 font-bold dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{r}</span>
                      {user?.role === r && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
