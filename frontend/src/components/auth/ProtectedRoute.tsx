import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

/**
 * Name Function: ProtectedRoute
 * Description: Route guard component verifying user session authentication before permitting access to private routes like the Dashboard.
 * Reason: Renders a loading spinner while session recovery or token refresh runs, redirecting unauthenticated users to /login.
 **/
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoadingSession } = useAuth();

  if (isLoadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-foreground" />
          <span className="text-sm text-muted-foreground font-medium">
            Verifying user session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
