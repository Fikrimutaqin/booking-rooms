import { useFetch } from './useFetch';
import { useApi } from './useApi';
import { apiClient } from '@/lib/apiClient';

export interface UserApiItem {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

/**
 * Name Function: useUsers
 * Description: Custom hook for managing system users directory (querying user accounts, registering new members, and deleting accounts).
 * Reason: Simplifies user role administration and directory browsing with unified pagination handling and reactive mutation state.
 **/
export function useUsers() {
  const { data, loading, error, refetch, setData } = useFetch<
    UserApiItem[] | { data: UserApiItem[] }
  >('/users');
  const { execute: mutate, loading: isMutating, error: mutationError } = useApi();

  const users: UserApiItem[] = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { data: UserApiItem[] }).data)
      ? (data as { data: UserApiItem[] }).data
      : [];

  /**
   * Name Function: createUser
   * Description: Dispatches new user account data to POST /users and updates the local member directory state.
   * Reason: Eliminates UI delay by appending new accounts immediately after positive server acknowledgment.
   **/
  const createUser = async (payload: CreateUserPayload): Promise<UserApiItem> => {
    const newUser = await mutate<UserApiItem>(() =>
      apiClient.post<UserApiItem>('/users', payload)
    );
    setData((prev) => {
      if (Array.isArray(prev)) return [newUser, ...prev];
      if (prev && typeof prev === 'object' && 'data' in prev) {
        return { ...prev, data: [newUser, ...prev.data] };
      }
      return [newUser];
    });
    return newUser;
  };

  /**
   * Name Function: deleteUser
   * Description: Deletes a user account from the system via DELETE /users/:id.
   * Reason: Keeps UI tables in sync with PostgreSQL database deletions by filtering out deleted user records.
   **/
  const deleteUser = async (id: string): Promise<void> => {
    await mutate(() => apiClient.delete(`/users/${id}`));
    setData((prev) => {
      if (Array.isArray(prev)) return prev.filter((item) => item.id !== id);
      if (prev && typeof prev === 'object' && 'data' in prev) {
        return { ...prev, data: prev.data.filter((item) => item.id !== id) };
      }
      return [];
    });
  };

  return {
    users,
    loading,
    error: error || mutationError,
    isMutating,
    refetch,
    createUser,
    deleteUser,
  };
}
