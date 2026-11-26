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
 * Name Interface: RegisterPayload
 * Description: Data transfer payload for user registration (POST /auth/register).
 * Reason: Matches backend RegisterDto requirements (name, email, password).
 **/
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

/**
 * Name Interface: RegisterResponse
 * Description: Response payload shape returned by the POST /auth/register endpoint.
 * Reason: Encapsulates created user profile and initial access token.
 **/
export interface RegisterResponse {
  user: AuthUser;
  accessToken: string;
}

/**
 * Name Interface: RegisterFormProps
 * Description: Props contract for the RegisterForm component.
 * Reason: Provides optional onRegister callback so parent components can initiate routing upon successful registration.
 **/
export interface RegisterFormProps {
  onRegister?: () => void;
}

/**
 * Name Interface: RegisterPageProps
 * Description: Props contract for the RegisterPage component.
 * Reason: Bridges top-level page router events to the child RegisterForm component.
 **/
export interface RegisterPageProps {
  onRegister?: () => void;
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
