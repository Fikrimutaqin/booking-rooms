import { useFetch } from './useFetch';
import { useApi } from './useApi';
import { apiClient } from '@/lib/apiClient';
import type { BookingApiItem } from '@/types/booking';

/**
 * Name Function: useMyBookings
 * Description: Custom hook for retrieving and managing the authenticated user's personal booking history via GET /bookings/me.
 * Reason: Isolates personal reservation queries from organization-wide bookings, providing dedicated state updates and cancellation handling.
 **/
export function useMyBookings() {
  const { data, loading, error, refetch, setData } = useFetch<
    BookingApiItem[] | { data: BookingApiItem[]; meta?: { total: number; page: number; limit: number } }
  >('/bookings/me');

  const { execute: mutate, loading: isMutating, error: mutationError } = useApi();

  const bookings: BookingApiItem[] = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { data: BookingApiItem[] }).data)
      ? (data as { data: BookingApiItem[] }).data
      : [];

  const meta = data && typeof data === 'object' && 'meta' in data ? data.meta : undefined;

  /**
   * Name Function: cancelBooking
   * Description: Cancels an active reservation belonging to current user via PATCH /bookings/:id.
   * Reason: Soft-cancelling updates the booking status to CANCELLED in real-time without requiring a full refetch.
   **/
  const cancelBooking = async (id: string): Promise<BookingApiItem> => {
    const cancelled = await mutate<BookingApiItem>(() =>
      apiClient.patch<BookingApiItem>(`/bookings/${id}`, { status: 'CANCELLED' })
    );

    setData((prev) => {
      if (Array.isArray(prev)) {
        return prev.map((item) =>
          item.id === id ? { ...item, ...cancelled, status: 'CANCELLED' } : item
        );
      }
      if (prev && typeof prev === 'object' && 'data' in prev) {
        return {
          ...prev,
          data: prev.data.map((item) =>
            item.id === id ? { ...item, ...cancelled, status: 'CANCELLED' } : item
          ),
        };
      }
      return [{ ...cancelled, status: 'CANCELLED' }];
    });

    return cancelled;
  };

  return {
    bookings,
    meta,
    loading,
    error: error || mutationError,
    isMutating,
    refetch,
    cancelBooking,
  };
}

export default useMyBookings;
