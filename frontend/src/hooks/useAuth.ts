import { useAuthContext } from '@/context/authContextDef';
import { useApi } from './useApi';
import type { LoginResponse } from '@/types/auth';

export type { LoginResponse };

/**
 * Name Function: useAuth
 * Description: Unified authentication hook exposing global session state, user profile, login, logout, and token refresh capabilities.
 * Reason: Bridges AuthContext with the useApi mutation hook for convenient consumption across views with reactive loading states.
 **/
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoadingSession,
    login: ctxLogin,
    logout,
    refresh,
  } = useAuthContext();

  const { loading: isMutating, error, reset } = useApi();

  /**
   * Name Function: login
   * Description: Authenticates user credentials against the backend and synchronizes session state and cookies.
   * Reason: Returns the LoginResponse promise allowing components like LoginForm to handle post-login route transitions.
   **/
  const login = async (email: string, password: string): Promise<LoginResponse> => {
    return ctxLogin(email, password);
  };

  return {
    user,
    isAuthenticated,
    isLoadingSession,
    login,
    logout,
    refresh,
    loading: isMutating,
    error,
    reset,
  };
}

export default useAuth;
