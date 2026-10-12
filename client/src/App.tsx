import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterCompanyPage } from './pages/RegisterCompanyPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { AttendancePage } from './pages/AttendancePage';
import { LeavePage } from './pages/LeavePage';
import { PayrollPage } from './pages/PayrollPage';
import { RecruitmentPage } from './pages/RecruitmentPage';
import { PerformancePage } from './pages/PerformancePage';
import { AssetsPage } from './pages/AssetsPage';
import { HelpDeskPage } from './pages/HelpDeskPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditPage } from './pages/AuditPage';
import { WorkflowsPage } from './pages/WorkflowsPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { SuperAdminPage } from './pages/SuperAdminPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#051720] flex items-center justify-center text-slate-100 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="h-6 w-6 border-2 border-[#ff6f32] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs sm:text-sm font-medium text-slate-400">
            Validating SmartHCM workspace session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RoleProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: string[];
}> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user?.isSuperAdmin || user?.role === 'PLATFORM_SUPER_ADMIN' || user?.role === 'ORG_ADMIN') {
    return <>{children}</>;
  }

  if (user?.role && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  return <AccessDeniedPage />;
};

const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  const isSuperAdmin = user?.isSuperAdmin || user?.role === 'PLATFORM_SUPER_ADMIN';
  if (!isSuperAdmin) {
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
};

const InitialExperienceRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#051720] flex items-center justify-center text-slate-100 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="h-6 w-6 border-2 border-[#ff6f32] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs sm:text-sm font-medium text-slate-400">
            Validating SmartHCM workspace session...
          </span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginPage />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Initial Experience: If authenticated open permitted dashboard; if not, display Login & Sign Up */}
              <Route path="/" element={<InitialExperienceRoute />} />

              {/* Explicit Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<LoginPage />} />
              <Route path="/register" element={<RegisterCompanyPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Public Portal Showcase / Marketing */}
              <Route path="/portal" element={<LandingPage />} />
              <Route path="/showcase" element={<LandingPage />} />

              {/* Workspace URL login route */}
              <Route path="/w/:workspaceSlug/login" element={<LoginPage />} />
              <Route path="/w/:workspaceSlug" element={<Navigate to="login" replace />} />

              <Route path="/app" element={<Navigate to="/dashboard" replace />} />

              {/* Authenticated Enterprise HCM Workspace Shell */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/leaves" element={<LeavePage />} />

                {/* Role-protected routes */}
                <Route
                  path="/payroll"
                  element={
                    <RoleProtectedRoute allowedRoles={['PAYROLL_MANAGER', 'HR_DIRECTOR', 'HR_MANAGER', 'AUDITOR']}>
                      <PayrollPage />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/workflows"
                  element={
                    <RoleProtectedRoute allowedRoles={['DEPT_MANAGER', 'HR_DIRECTOR', 'HR_MANAGER', 'AUDITOR']}>
                      <WorkflowsPage />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/recruitment"
                  element={
                    <RoleProtectedRoute allowedRoles={['RECRUITER', 'HR_DIRECTOR', 'HR_MANAGER']}>
                      <RecruitmentPage />
                    </RoleProtectedRoute>
                  }
                />
                <Route path="/performance" element={<PerformancePage />} />
                <Route path="/assets" element={<AssetsPage />} />
                <Route path="/helpdesk" element={<HelpDeskPage />} />
                <Route
                  path="/organization"
                  element={
                    <RoleProtectedRoute allowedRoles={['HR_DIRECTOR', 'HR_MANAGER']}>
                      <OrganizationPage />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <RoleProtectedRoute allowedRoles={['HR_DIRECTOR', 'HR_MANAGER', 'PAYROLL_MANAGER', 'AUDITOR']}>
                      <ReportsPage />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/audit"
                  element={
                    <RoleProtectedRoute allowedRoles={['HR_DIRECTOR', 'AUDITOR']}>
                      <AuditPage />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/superadmin"
                  element={
                    <SuperAdminRoute>
                      <SuperAdminPage />
                    </SuperAdminRoute>
                  }
                />
              </Route>

              {/* Fallback unknown route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
