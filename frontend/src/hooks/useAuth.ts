import { useAuthContext } from '@/context/authContextDef';
import { useApi } from './useApi';
import type { LoginResponse, RegisterPayload, RegisterResponse } from '@/types/auth';

export type { LoginResponse, RegisterPayload, RegisterResponse };

/**
 * Name Function: useAuth
 * Description: Unified authentication hook exposing global session state, user profile, login, register, logout, and token refresh capabilities.
 * Reason: Bridges AuthContext with the useApi mutation hook for convenient consumption across views with reactive loading states.
 **/
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoadingSession,
    login: ctxLogin,
    register: ctxRegister,
    logout,
    refresh,
  } = useAuthContext();

  const { loading: isMutating, error, reset, execute } = useApi();

  /**
   * Name Function: login
   * Description: Authenticates user credentials against the backend and synchronizes session state and cookies.
   * Reason: Returns the LoginResponse promise allowing components like LoginForm to handle post-login route transitions.
   **/
  const login = async (email: string, password: string): Promise<LoginResponse> => {
    return execute(() => ctxLogin(email, password));
  };

  /**
   * Name Function: register
   * Description: Registers a new user account with the backend and establishes an authenticated session.
   * Reason: Manages mutation loading and error states for registration forms while auto-authenticating the new account.
   **/
  const register = async (payload: RegisterPayload): Promise<RegisterResponse> => {
    return execute(() => ctxRegister(payload));
  };

  return {
    user,
    isAuthenticated,
    isLoadingSession,
    login,
    register,
    logout,
    refresh,
    loading: isMutating,
    error,
    reset,
  };
}

export default useAuth;
