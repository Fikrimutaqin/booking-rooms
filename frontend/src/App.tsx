import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicOnlyRoute } from '@/components/auth/PublicOnlyRoute';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

/**
 * Name Function: LoginRoute
 * Description: Route wrapper for the login page that redirects users to the dashboard upon successful authentication.
 * Reason: Decouples post-login navigation logic from the pure LoginPage view component for testability and separation of concerns.
 **/
function LoginRoute() {
  const navigate = useNavigate();
  return <LoginPage onLogin={() => navigate(ROUTES.DASHBOARD)} />;
}

/**
 * Name Function: DashboardRoute
 * Description: Route wrapper for the dashboard page that clears session cookies and navigates back to login when logging out.
 * Reason: Connects the global useAuth hook with the dashboard logout event ensuring credentials and state are cleanly cleared.
 **/
function DashboardRoute() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return <DashboardPage onLogout={handleLogout} />;
}

/**
 * Name Function: App
 * Description: Root application component configuring the AuthProvider context and routing hierarchy for public and protected routes.
 * Reason: Encloses all application routes within BrowserRouter and AuthProvider so session protection and auto-refresh are globally accessible.
 **/
export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Default redirect to login */}
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />

          {/* Public login route with session guard */}
          <Route
            path={ROUTES.LOGIN}
            element={
              <PublicOnlyRoute>
                <LoginRoute />
              </PublicOnlyRoute>
            }
          />

          {/* Protected dashboard route with auto-refresh guard */}
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <DashboardRoute />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
