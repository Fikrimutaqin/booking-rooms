import { useFetch } from './useFetch';
import { useApi } from './useApi';
import { apiClient } from '@/lib/apiClient';

export interface BookingApiItem {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  startAt: string;
  endAt: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  room?: {
    id: string;
    name: string;
    location: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateBookingPayload {
  roomId: string;
  title: string;
  startAt: string;
  endAt: string;
}

/**
 * Name Function: useBookings
 * Description: Custom hook for managing meeting room reservations (fetching booking list, creating reservations, and cancelling bookings).
 * Reason: Integrates declarative data querying (useFetch) with imperative actions (useApi) to enable instant local state synchronization without full refetches.
 **/
export function useBookings() {
  const { data, loading, error, refetch, setData } = useFetch<
    BookingApiItem[] | { data: BookingApiItem[] }
  >('/bookings');
  const { execute: mutate, loading: isMutating, error: mutationError } = useApi();

  const bookings: BookingApiItem[] = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { data: BookingApiItem[] }).data)
      ? (data as { data: BookingApiItem[] }).data
      : [];

  /**
   * Name Function: createBooking
   * Description: Dispatches new booking data to POST /bookings and prepends the returned record to the local bookings array.
   * Reason: Provides fast UI feedback by updating the bookings state directly without waiting for a second network query.
   **/
  const createBooking = async (payload: CreateBookingPayload): Promise<BookingApiItem> => {
    const newBooking = await mutate<BookingApiItem>(() =>
      apiClient.post<BookingApiItem>('/bookings', payload)
    );
    setData((prev) => {
      if (Array.isArray(prev)) return [newBooking, ...prev];
      if (prev && typeof prev === 'object' && 'data' in prev) {
        return { ...prev, data: [newBooking, ...prev.data] };
      }
      return [newBooking];
    });
    return newBooking;
  };

  /**
   * Name Function: cancelBooking
   * Description: Dispatches a booking cancellation request to PATCH /bookings/:id setting status to CANCELLED.
   * Reason: Updates reservation status on the server and synchronizes the table row locally to immediately reflect the cancelled badge.
   **/
  const cancelBooking = async (id: string): Promise<BookingApiItem> => {
    const cancelled = await mutate<BookingApiItem>(() =>
      apiClient.patch<BookingApiItem>(`/bookings/${id}`, { status: 'CANCELLED' })
    );
    setData((prev) => {
      if (Array.isArray(prev)) return prev.map((item) => (item.id === id ? cancelled : item));
      if (prev && typeof prev === 'object' && 'data' in prev) {
        return {
          ...prev,
          data: prev.data.map((item) => (item.id === id ? cancelled : item)),
        };
      }
      return [cancelled];
    });
    return cancelled;
  };

  return {
    bookings,
    loading,
    error: error || mutationError,
    isMutating,
    refetch,
    createBooking,
    cancelBooking,
  };
}
