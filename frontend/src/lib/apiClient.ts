import {
  getAccessToken,
  getRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from './cookies';

/**
 * Name Function: resolveApiBaseUrl
 * Description: Resolves backend API base URL from environment variables (API_URL / VITE_API_URL) with fallback to proxy '/api/v1'.
 * Reason: Ensures deployment flexibility across local dev proxies, staging environments, and production reverse proxies without modifying client code.
 **/
function resolveApiBaseUrl(): string {
  const envUrl = import.meta.env.API_URL || import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl.trim() === '') {
    return '/api/v1';
  }
  return envUrl.trim().replace(/\/+$/, '');
}

export const API_BASE_URL: string = resolveApiBaseUrl();

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | null | undefined>;
  token?: string | null;
  _retry?: boolean;
}

export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

let refreshPromise: Promise<string | null> | null = null;

/**
 * Name Function: attemptTokenRefresh
 * Description: Dispatches a token refresh request to /auth/refresh using stored refreshToken cookies to obtain a new accessToken.
 * Reason: Implements Promise Deduplication so concurrent requests encountering 401s share a single server refresh call.
 **/
async function attemptTokenRefresh(): Promise<string | null> {
  const storedRefreshToken = getRefreshToken();
  if (!storedRefreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });

        if (!res.ok) {
          clearAuthCookies();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth:unauthorized'));
          }
          return null;
        }

        const json = await res.json();
        const payload =
          json && typeof json === 'object' && 'data' in json
            ? (json as { data: { accessToken: string; refreshToken?: string } }).data
            : (json as { accessToken: string; refreshToken?: string });

        if (payload?.accessToken) {
          setAuthCookies(payload.accessToken, payload.refreshToken);
          return payload.accessToken;
        }
        return null;
      } catch {
        clearAuthCookies();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

/**
 * Name Function: request
 * Description: Core HTTP client wrapper based on Fetch API managing query params, automated bearer auth headers, error parsing, and auto-retry on 401.
 * Reason: Centralizes HTTP abstraction with JSON deserialization, NestJS response normalization, and transparent access token rotation retry.
 **/
async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, token, headers = {}, _retry = false, ...customConfig } = options;

  let url = `${API_BASE_URL}/${endpoint.replace(/^\/+/, '')}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // Ambil accessToken dari cookie jika tidak di-pass manual
  const authToken = token ?? getAccessToken();

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(customConfig.body ? { 'Content-Type': 'application/json' } : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...customConfig,
    headers: requestHeaders,
  });

  // Handle 401 Unauthorized via transparent refresh token retry
  if (
    response.status === 401 &&
    !_retry &&
    !endpoint.includes('/auth/login') &&
    !endpoint.includes('/auth/refresh')
  ) {
    const newToken = await attemptTokenRefresh();
    if (newToken) {
      return request<T>(endpoint, {
        ...options,
        _retry: true,
        token: newToken,
      });
    }
  }

  if (response.status === 204) {
    return null as T;
  }

  let json: Record<string, unknown> | null = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      json = await response.json();
    } catch {
      json = null;
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    if (json) {
      if (Array.isArray(json.message)) {
        errorMessage = json.message.join(', ');
      } else if (typeof json.message === 'string') {
        errorMessage = json.message;
      } else if (typeof json.error === 'string') {
        errorMessage = json.error;
      }
    }
    throw new ApiError(errorMessage, response.status, json);
  }

  if (json && typeof json === 'object' && 'data' in json && 'statusCode' in json) {
    return json.data as T;
  }

  return json as T;
}

export const apiClient = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),

  put: <T = unknown>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),

  patch: <T = unknown>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  request,
  attemptTokenRefresh,
};
