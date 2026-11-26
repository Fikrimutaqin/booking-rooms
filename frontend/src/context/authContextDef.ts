import * as React from 'react';
import type { AuthUser, LoginResponse, RefreshTokenResponse } from '@/types/auth';

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  refresh: () => Promise<RefreshTokenResponse | null>;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

/**
 * Name Function: useAuthContext
 * Description: Custom hook providing direct access to the global authentication context state and actions (user, auth status, login, logout, refresh).
 * Reason: Guarantees consuming components are wrapped within an <AuthProvider> and provides explicit runtime error reporting when accessed out of context.
 **/
export function useAuthContext() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
