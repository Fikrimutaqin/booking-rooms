import * as React from 'react';
import { apiClient, ApiError, RequestOptions } from '@/lib/apiClient';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Name Function: useApi
 * Description: Custom hook for imperatively executing API mutations (POST, PUT, PATCH, DELETE) with synchronized state for data, loading, and errors.
 * Reason: Eliminates boilerplate try-catch logic and manual state orchestration across forms and action components, providing clean reset functionality.
 **/
export function useApi<T = unknown>() {
  const [state, setState] = React.useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  /**
   * Name Function: execute
   * Description: Executes asynchronous API mutation requests via string endpoint or custom callback promise.
   * Reason: Grants callers flexibility to invoke apiClient directly or execute custom promise closures with strong generic typing.
   **/
  const execute = React.useCallback(
    async <R = T>(
      endpointOrAction: string | (() => Promise<R>),
      options?: RequestOptions
    ): Promise<R> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        let result: R;
        if (typeof endpointOrAction === 'string') {
          result = await apiClient.request<R>(endpointOrAction, options);
        } else {
          result = await endpointOrAction();
        }
        setState({ data: result as unknown as T, loading: false, error: null });
        return result;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'An unexpected server error occurred';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw err;
      }
    },
    []
  );

  /**
   * Name Function: reset
   * Description: Resets mutation state (data, loading, error) back to initial default values.
   * Reason: Allows components to clear stale error notifications when users re-enter inputs or reopen action modals.
   **/
  const reset = React.useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
