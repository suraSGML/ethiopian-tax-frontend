import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import { LanguageProvider } from './contexts/LanguageContext';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Taxpayer pages
import TaxpayerDashboard from './pages/taxpayer/Dashboard';
import FilingsPage from './pages/taxpayer/FilingsPage';
import NewFilingPage from './pages/taxpayer/NewFilingPage';
import FilingDetailPage from './pages/taxpayer/FilingDetailPage';
import PaymentsPage from './pages/taxpayer/PaymentsPage';
import PaymentPage from './pages/taxpayer/PaymentPage';
import ProfilePage from './pages/taxpayer/ProfilePage';
import TaxCalculatorPage from './pages/taxpayer/TaxCalculatorPage';
import AppealPage from './pages/taxpayer/AppealPage';
import AmendmentPage from './pages/taxpayer/AmendmentPage';
import CompliancePage from './pages/taxpayer/CompliancePage';
import NotificationsPage from './pages/shared/NotificationsPage';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import UsersPage from './pages/admin/UsersPage';
import AllFilingsPage from './pages/admin/AllFilingsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import FraudAlertsPage from './pages/admin/FraudAlertsPage';
import ReportsPage from './pages/admin/ReportsPage';

// Officer pages
import OfficerDashboard from './pages/officer/OfficerDashboard';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && !['tax_officer', 'super_admin'].includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const OfficerRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'tax_officer') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    const dest = user?.role === 'super_admin' ? '/admin' : user?.role === 'tax_officer' ? '/officer' : '/dashboard';
    return <Navigate to={dest} replace />;
  }
  return children;
};

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
          </Route>

          {/* Taxpayer routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<TaxpayerDashboard />} />
            <Route path="/filings" element={<FilingsPage />} />
            <Route path="/filings/new" element={<NewFilingPage />} />
            <Route path="/filings/:id" element={<FilingDetailPage />} />
            <Route path="/filings/:id/appeal" element={<AppealPage />} />
            <Route path="/filings/:id/amend" element={<AmendmentPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/payments/pay/:filingId" element={<PaymentPage />} />
            <Route path="/calculator" element={<TaxCalculatorPage />} />
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Tax Officer routes */}
          <Route element={<OfficerRoute><MainLayout isOfficer /></OfficerRoute>}>
            <Route path="/officer" element={<OfficerDashboard />} />
            <Route path="/officer/filings" element={<AllFilingsPage />} />
            <Route path="/officer/filings/:id" element={<FilingDetailPage isOfficer />} />
            <Route path="/officer/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute><MainLayout isAdmin /></AdminRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/filings" element={<AllFilingsPage />} />
            <Route path="/admin/filings/:id" element={<FilingDetailPage isAdmin />} />
            <Route path="/admin/audit" element={<AuditLogsPage />} />
            <Route path="/admin/fraud" element={<FraudAlertsPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
