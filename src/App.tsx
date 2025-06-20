import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { CompanySelectionProvider } from './contexts/CompanySelectionContext';
import { ToastProvider } from './components/ui/Toast';
import ErrorBoundary from './components/ui/ErrorBoundary';
// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ResetPassword from './pages/auth/ResetPassword';
// Superadmin pages
import SuperadminDashboard from './pages/superadmin/Dashboard';
import SubCompanyDetail from './pages/superadmin/SubCompanyDetail';
import CreateSubCompany from './pages/superadmin/CreateSubCompany';

import Companies from './pages/superadmin/Companies';
import CompanyManagement from './pages/superadmin/CompanyManagement';
import AdminAssignments from './pages/superadmin/AdminAssignments';
// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import Investments from './pages/admin/Investments';
import Investors from './pages/admin/Investors';
// Investor pages
import InvestorDashboard from './pages/investor/Dashboard';
import Portfolio from './pages/investor/Portfolio';
import InvestorPortfolioDashboard from './pages/investor/InvestorPortfolioDashboard';
import Marketplace from './pages/investor/Marketplace';
import PendingApproval from './pages/investor/PendingApproval';
// Salesman pages
import SalesmanDashboard from './pages/salesman/Dashboard';
// Shared modules
import Analytics from './pages/shared/Analytics';
import Reports from './pages/shared/Reports';
// Universal modules
import Profile from './pages/universal/Profile';
import AdminConsole from './pages/universal/AdminConsole';
// Route guards
import ProtectedRoute from './components/routing/ProtectedRoute';
function App() {
  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ToastProvider>
          <AuthProvider>
            <DataProvider>
              <CompanySelectionProvider>
                <div className="w-full min-h-screen bg-slate-900 text-white font-sans">
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  {/* Superadmin routes */}
                  <Route path="/superadmin/dashboard" element={<ProtectedRoute role="superadmin">
                        <SuperadminDashboard />
                      </ProtectedRoute>} />
                  <Route path="/superadmin/company-management" element={<ProtectedRoute role="superadmin">
                        <CompanyManagement />
                      </ProtectedRoute>} />
                  <Route path="/superadmin/admin-assignments" element={<ProtectedRoute role="superadmin">
                        <AdminAssignments />
                      </ProtectedRoute>} />
                  <Route path="/superadmin/companies" element={<ProtectedRoute role="superadmin">
                        <Companies />
                      </ProtectedRoute>} />
                  <Route path="/superadmin/company/:id" element={<ProtectedRoute role="superadmin">
                        <SubCompanyDetail />
                      </ProtectedRoute>} />
                  <Route path="/superadmin/company/new" element={<ProtectedRoute role="superadmin">
                        <CreateSubCompany />
                      </ProtectedRoute>} />
                  <Route path="/superadmin/analytics" element={<ProtectedRoute role="superadmin">
                        <Analytics userRole="superadmin" />
                      </ProtectedRoute>} />
                  {/* Admin routes */}
                  <Route path="/admin/dashboard" element={<ProtectedRoute role="admin">
                        <AdminDashboard />
                      </ProtectedRoute>} />
                  <Route path="/admin/investments" element={<ProtectedRoute role="admin">
                        <Investments />
                      </ProtectedRoute>} />
                  <Route path="/admin/investors" element={<ProtectedRoute role="admin">
                        <Investors />
                      </ProtectedRoute>} />
                  <Route path="/admin/analytics" element={<ProtectedRoute role="admin">
                        <Analytics userRole="admin" />
                      </ProtectedRoute>} />
                  {/* Investor routes */}
                  <Route path="/investor/dashboard" element={<ProtectedRoute role="investor">
                        <InvestorDashboard />
                      </ProtectedRoute>} />
                  <Route path="/investor/portfolio" element={<ProtectedRoute role="investor">
                        <InvestorPortfolioDashboard />
                      </ProtectedRoute>} />
                  <Route path="/investor/portfolio-legacy" element={<ProtectedRoute role="investor">
                        <Portfolio />
                      </ProtectedRoute>} />
                  <Route path="/investor/marketplace" element={<ProtectedRoute role="investor">
                        <Marketplace />
                      </ProtectedRoute>} />
                  <Route path="/investor/pending" element={<ProtectedRoute role="investor">
                        <PendingApproval />
                      </ProtectedRoute>} />
                  <Route path="/investor/analytics" element={<ProtectedRoute role="investor">
                        <Analytics userRole="investor" />
                      </ProtectedRoute>} />
                  {/* Salesman routes */}
                  <Route path="/salesman/dashboard" element={<ProtectedRoute role="salesman">
                        <SalesmanDashboard />
                      </ProtectedRoute>} />
                  <Route path="/salesman/analytics" element={<ProtectedRoute role="salesman">
                        <Analytics userRole="salesman" />
                      </ProtectedRoute>} />
                  {/* Universal routes */}
                  <Route path="/profile" element={<ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute>
                        <Reports />
                      </ProtectedRoute>} />
                  <Route path="/admin-console" element={<ProtectedRoute role="superadmin">
                        <AdminConsole />
                      </ProtectedRoute>} />
                  {/* Default redirect */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
                </div>
              </CompanySelectionProvider>
            </DataProvider>
          </AuthProvider>
        </ToastProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;