import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { SalesPage } from './pages/SalesPage';
import { PumpsPage } from './pages/PumpsPage';
import { InventoryPage } from './pages/InventoryPage';
import { CustomersPage } from './pages/CustomersPage';
import { WorkforcePage } from './pages/WorkforcePage';
import { ExpensesPage } from './pages/ExpensesPage';
import { AIPage } from './pages/AIPage';
import { ReportsPage } from './pages/ReportsPage';
import { SnowflakePage } from './pages/SnowflakePage';
import { AdminPage } from './pages/AdminPage';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="pumps" element={<PumpsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="workforce" element={<WorkforcePage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="ai" element={<AIPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="snowflake" element={<SnowflakePage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
