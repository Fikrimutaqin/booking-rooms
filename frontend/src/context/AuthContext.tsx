import * as React from 'react';
import { apiClient } from '@/lib/apiClient';
import {
  getAccessToken,
  getRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from '@/lib/cookies';
import { AuthContext } from './authContextDef';
import type { AuthUser, LoginResponse, RefreshTokenResponse, RegisterPayload, RegisterResponse } from '@/types/auth';

/**
 * Name Function: AuthProvider
 * Description: Context provider component managing user session state, initial session recovery from cookies, and background token refresh.
 * Reason: Centralizes authentication state lifecycle and transparent access token refreshes across the entire application without full-page reloads.
 **/
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(() => {
    return Boolean(typeof window !== 'undefined' && getAccessToken());
  });
  const [isLoadingSession, setIsLoadingSession] = React.useState<boolean>(true);

  // Token refresh handler
  const refresh = React.useCallback(async (): Promise<RefreshTokenResponse | null> => {
    const storedRefreshToken = getRefreshToken();
    if (!storedRefreshToken) {
      clearAuthCookies();
      setIsAuthenticated(false);
      setUser(null);
      return null;
    }

    try {
      const result = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
        refreshToken: storedRefreshToken,
      });

      if (result?.accessToken) {
        setAuthCookies(result.accessToken, result.refreshToken);
        setIsAuthenticated(true);
        return result;
      }
      throw new Error('Invalid refresh response');
    } catch {
      clearAuthCookies();
      setIsAuthenticated(false);
      setUser(null);
      return null;
    }
  }, []);

  // Fetch current user profile
  const fetchProfile = React.useCallback(async () => {
    try {
      const profile = await apiClient.get<AuthUser>('/auth/me');
      if (profile) {
        setUser(profile);
      }
    } catch {
      // Silently ignore if session is not active
    }
  }, []);

  // Initialize session when application first loads
  React.useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (accessToken) {
        if (isMounted) setIsAuthenticated(true);
        await fetchProfile();
      } else if (refreshToken) {
        // If accessToken expired but refreshToken is present -> trigger automatic refresh
        const newTokens = await refresh();
        if (newTokens && isMounted) {
          setIsAuthenticated(true);
          await fetchProfile();
        }
      } else {
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
        }
      }

      if (isMounted) {
        setIsLoadingSession(false);
      }
    }

    initializeSession();

    return () => {
      isMounted = false;
    };
  }, [refresh, fetchProfile]);

  // Background periodic auto-refresh (every 10 minutes)
  React.useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(() => {
      if (getRefreshToken()) {
        refresh();
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, refresh]);

  // Global unauthorized event listener triggered by apiClient (401 with failed refresh)
  React.useEffect(() => {
    const handleUnauthorized = () => {
      clearAuthCookies();
      setIsAuthenticated(false);
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  // Login handler
  const login = React.useCallback(
    async (email: string, password: string): Promise<LoginResponse> => {
      const res = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      if (res?.accessToken) {
        setAuthCookies(res.accessToken, res.refreshToken);
        setIsAuthenticated(true);
        if (res.user) {
          setUser(res.user);
        } else {
          fetchProfile();
        }
      }

      return res;
    },
    [fetchProfile]
  );

  // Register handler
  const register = React.useCallback(
    async (payload: RegisterPayload): Promise<RegisterResponse> => {
      const res = await apiClient.post<RegisterResponse>('/auth/register', payload);
      if (payload.email && payload.password) {
        await login(payload.email, payload.password);
      }
      return res;
    },
    [login]
  );

  // Logout handler
  const logout = React.useCallback(() => {
    clearAuthCookies();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoadingSession,
      login,
      register,
      logout,
      refresh,
    }),
    [user, isAuthenticated, isLoadingSession, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
