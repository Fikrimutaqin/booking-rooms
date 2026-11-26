import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

/**
 * Name Function: PublicOnlyRoute
 * Description: Public route guard component redirecting already authenticated users away from public pages like /login.
 * Reason: Prevents displaying the login form to users who already possess active credentials and valid session cookies.
 **/
export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoadingSession } = useAuth();

  if (isLoadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}

export default PublicOnlyRoute;
