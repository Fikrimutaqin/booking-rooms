import * as React from 'react';
import { apiClient, ApiError, RequestOptions } from '@/lib/apiClient';

export interface UseFetchOptions extends RequestOptions {
  autoFetch?: boolean;
}

/**
 * Name Function: useFetch
 * Description: Declarative custom hook executing HTTP GET requests with synchronized data state, loading indicators, error tracking, and refetch support.
 * Reason: Avoids repetitive useEffect boilerplates across view components and automatically reacts to query parameter changes via paramsRef.
 **/
export function useFetch<T = unknown>(
  endpoint: string | null,
  options: UseFetchOptions = {}
) {
  const { autoFetch = true, params, ...requestOptions } = options;
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState<boolean>(autoFetch && Boolean(endpoint));
  const [error, setError] = React.useState<string | null>(null);

  const paramsKey = React.useMemo(() => JSON.stringify(params), [params]);

  const paramsRef = React.useRef(params);
  paramsRef.current = params;

  const optionsRef = React.useRef(requestOptions);
  optionsRef.current = requestOptions;

  /**
   * Name Function: fetchData
   * Description: Core data fetching execution routine invoking apiClient.get.
   * Reason: Leverages memoized callbacks with fresh parameter references to prevent infinite loops and manage loading transitions deterministically.
   **/
  const fetchData = React.useCallback(async () => {
    if (!endpoint) return;
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<T>(endpoint, {
        params: paramsRef.current,
        ...optionsRef.current,
      });
      setData(result);
      return result;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to fetch data from the server';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  React.useEffect(() => {
    if (autoFetch && endpoint) {
      fetchData();
    }
  }, [fetchData, autoFetch, endpoint, paramsKey]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData,
  };
}
