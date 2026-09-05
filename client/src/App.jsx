import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RawMaterialsPage from './pages/RawMaterialsPage';
import FinishedProductsPage from './pages/FinishedProductsPage';
import StockHistoryPage from './pages/StockHistoryPage';
import PurchaseListPage from './pages/PurchaseListPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Inventory Application Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="raw-materials" element={<RawMaterialsPage />} />
          <Route path="finished-products" element={<FinishedProductsPage />} />
          <Route path="history" element={<StockHistoryPage />} />
          <Route path="purchase-list" element={<PurchaseListPage />} />
        </Route>

        {/* Fallback to Dashboard / Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
