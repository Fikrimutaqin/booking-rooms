/**
 * Name Interface: LoginFormProps
 * Description: Props contract for the LoginForm component.
 * Reason: Provides an optional onLogin callback so parent components can initiate routing upon successful authentication.
 **/
export interface LoginFormProps {
  onLogin?: () => void;
}

/**
 * Name Interface: LoginPageProps
 * Description: Props contract for the LoginPage component.
 * Reason: Bridges top-level page router events to the child LoginForm component.
 **/
export interface LoginPageProps {
  onLogin?: () => void;
}

/**
 * Name Interface: AuthUser
 * Description: User profile entity type representing an authenticated user in the frontend state.
 * Reason: Maps safe user profile payload attributes (excluding password & sensitive tokens) received from the API.
 **/
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

/**
 * Name Interface: LoginResponse
 * Description: Response payload shape returned by the POST /auth/login endpoint.
 * Reason: Encapsulates accessToken, optional refreshToken, and user profile data for storage and state sync.
 **/
export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

/**
 * Name Interface: RefreshTokenResponse
 * Description: Response payload shape returned by the POST /auth/refresh endpoint.
 * Reason: Encapsulates rotated accessToken and refreshToken pairs received from the server.
 **/
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Name Interface: UseRefreshTokenOptions
 * Description: Configuration options for the useRefreshToken hook.
 * Reason: Configures periodic background refresh intervals and response callbacks for token rotation.
 **/
export interface UseRefreshTokenOptions {
  autoRefresh?: boolean;
  intervalMs?: number;
  onRefreshSuccess?: (tokens: RefreshTokenResponse) => void;
  onRefreshError?: (error: string) => void;
}
