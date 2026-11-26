export interface CookieOptions {
  days?: number;
  maxAgeSeconds?: number;
  path?: string;
  sameSite?: 'Strict' | 'Lax' | 'None';
  secure?: boolean;
}

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Name Function: setCookie
 * Description: Persists a key-value string into the browser's document.cookie with security attributes (SameSite, Secure, Path, and Max-Age).
 * Reason: Protects token storage against CSRF vulnerabilities with SameSite=Lax and automatically turns on the Secure flag over HTTPS.
 **/
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  if (typeof document === 'undefined') return;

  const {
    days,
    maxAgeSeconds,
    path = '/',
    sameSite = 'Lax',
    secure = typeof window !== 'undefined' && window.location.protocol === 'https:',
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}; SameSite=${sameSite}`;

  if (maxAgeSeconds !== undefined) {
    cookieString += `; max-age=${maxAgeSeconds}`;
  } else if (days !== undefined) {
    cookieString += `; max-age=${days * 24 * 60 * 60}`;
  }

  if (secure) {
    cookieString += '; Secure';
  }

  document.cookie = cookieString;
}

/**
 * Name Function: getCookie
 * Description: Retrieves and decodes a specific cookie value from the browser's document.cookie by its name.
 * Reason: Parses raw cookie strings with semicolon delimitation and URI decoding to reliably extract complex token values.
 **/
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie ? document.cookie.split(';') : [];
  const targetName = encodeURIComponent(name).trim();

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(`${targetName}=`)) {
      return decodeURIComponent(cookie.substring(targetName.length + 1));
    }
  }

  return null;
}

/**
 * Name Function: removeCookie
 * Description: Deletes a cookie from the browser by expiring it immediately (epoch time 1970) and setting max-age=0.
 * Reason: Ensures the browser permanently removes cookie entries upon logout or when tokens are invalidated.
 **/
export function removeCookie(name: string, path = '/'): void {
  if (typeof document === 'undefined') return;

  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  document.cookie = `${encodeURIComponent(name)}=; path=${path}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${
    isSecure ? '; Secure' : ''
  }`;
}

/**
 * Name Function: setAuthCookies
 * Description: Stores access token (1-day duration) and refresh token (7-day duration) in browser cookies.
 * Reason: Segregates short-lived session access tokens from long-lived rotation tokens, and cleans legacy localStorage keys.
 **/
export function setAuthCookies(accessToken: string, refreshToken?: string): void {
  setCookie(TOKEN_KEY, accessToken, { days: 1 });

  if (refreshToken) {
    setCookie(REFRESH_TOKEN_KEY, refreshToken, { days: 7 });
  }

  // Clear legacy tokens from localStorage if previously stored
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

/**
 * Name Function: getAccessToken
 * Description: Retrieves the stored access token from browser cookies.
 * Reason: Used by HTTP clients (apiClient) to attach Authorization Bearer headers to authenticated requests.
 **/
export function getAccessToken(): string | null {
  return getCookie(TOKEN_KEY) || getCookie('token');
}

/**
 * Name Function: getRefreshToken
 * Description: Retrieves the stored refresh token from browser cookies.
 * Reason: Used to request renewed access tokens from POST /auth/refresh when the active access token expires.
 **/
export function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_KEY);
}

/**
 * Name Function: clearAuthCookies
 * Description: Clears all authentication credential cookies (accessToken and refreshToken) and purges legacy localStorage entries.
 * Reason: Guarantees no lingering session tokens remain in the browser upon logout or session termination.
 **/
export function clearAuthCookies(): void {
  removeCookie(TOKEN_KEY);
  removeCookie('token');
  removeCookie(REFRESH_TOKEN_KEY);

  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
