import * as React from 'react';
import { apiClient, ApiError } from '@/lib/apiClient';
import {
  getAccessToken,
  getRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from '@/lib/cookies';
import type { RefreshTokenResponse, UseRefreshTokenOptions } from '@/types/auth';

export type { RefreshTokenResponse, UseRefreshTokenOptions };

/**
 * Name Function: useRefreshToken
 * Description: Custom hook managing manual or scheduled access token refreshes using stored refreshToken cookies.
 * Reason: Preserves uninterrupted user sessions without forced re-logins and purges credentials if the server revokes the refresh token (401/403).
 **/
export function useRefreshToken(options: UseRefreshTokenOptions = {}) {
  const {
    autoRefresh = false,
    intervalMs = 14 * 60 * 1000,
    onRefreshSuccess,
    onRefreshError,
  } = options;

  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Name Function: refresh
   * Description: Reads refreshToken from cookies, dispatches POST /auth/refresh, and persists updated token pairs.
   * Reason: Returns a RefreshTokenResponse promise enabling consumers to monitor session rotation status in real time.
   **/
  const refresh = React.useCallback(
    async (tokenToRefresh?: string): Promise<RefreshTokenResponse | null> => {
      // 1. Retrieve refreshToken from argument or browser cookies
      const storedRefreshToken = tokenToRefresh || getRefreshToken();

      if (!storedRefreshToken) {
        const errMsg = 'No refreshToken found in cookies';
        setError(errMsg);
        onRefreshError?.(errMsg);
        return null;
      }

      setIsRefreshing(true);
      setError(null);

      try {
        const result = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
          refreshToken: storedRefreshToken,
        });

        if (result?.accessToken) {
          // 2. Persist renewed tokens into cookies
          setAuthCookies(result.accessToken, result.refreshToken);
          onRefreshSuccess?.(result);
          return result;
        }

        throw new Error('Server returned invalid tokens');
      } catch (err: unknown) {
        const errMsg =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Failed to refresh session tokens';

        setError(errMsg);

        // Jika refreshToken kadaluarsa / revoked (401/403), hapus cookie otentikasi
        if (
          err instanceof ApiError &&
          (err.statusCode === 401 || err.statusCode === 403)
        ) {
          clearAuthCookies();
        }

        onRefreshError?.(errMsg);
        return null;
      } finally {
        setIsRefreshing(false);
      }
    },
    [onRefreshSuccess, onRefreshError]
  );

  // Auto refresh interval jika opsi autoRefresh diaktifkan
  React.useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      const token = getAccessToken();
      if (token) {
        refresh();
      }
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [autoRefresh, intervalMs, refresh]);

  return {
    refresh,
    isRefreshing,
    error,
  };
}

export default useRefreshToken;
