import { useFetch } from './useFetch';
import { useApi } from './useApi';
import { apiClient } from '@/lib/apiClient';
import {
  BookingApiItem,
  CreateBookingPayload,
  RecurringBookingResult,
} from '@/types/booking';

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
   * Description: Dispatches new single or recurring booking payload to POST /bookings and prepends returned records to local state.
   * Reason: Provides fast UI feedback by updating the bookings state directly without waiting for a second network query.
   **/
  const createBooking = async (
    payload: CreateBookingPayload,
  ): Promise<BookingApiItem | RecurringBookingResult> => {
    const result = await mutate<BookingApiItem | RecurringBookingResult>(() =>
      apiClient.post<BookingApiItem | RecurringBookingResult>('/bookings', payload),
    );
    setData((prev) => {
      const newItems: BookingApiItem[] =
        result && typeof result === 'object' && 'isRecurring' in result && Array.isArray(result.bookings)
          ? result.bookings
          : [result as BookingApiItem];

      if (Array.isArray(prev)) return [...newItems, ...prev];
      if (prev && typeof prev === 'object' && 'data' in prev) {
        return { ...prev, data: [...newItems, ...prev.data] };
      }
      return newItems;
    });
    return result;
  };

  /**
   * Name Function: cancelBooking
   * Description: Dispatches a booking status update to CANCELLED via PATCH /bookings/:id.
   * Reason: Soft-cancelling a reservation is a partial entity state modification, properly handled via PATCH in REST architecture.
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

  /**
   * Name Function: getBookingDetail
   * Description: Fetches specific reservation details from GET /bookings/:id.
   * Reason: Allows on-demand retrieval of full booking metadata when needed for inspection or edit forms.
   **/
  const getBookingDetail = async (id: string): Promise<BookingApiItem> => {
    const result = await mutate<BookingApiItem>(() =>
      apiClient.get<BookingApiItem>(`/bookings/${id}`)
    );
    return result;
  };

  return {
    bookings,
    loading,
    error: error || mutationError,
    isMutating,
    refetch,
    createBooking,
    cancelBooking,
    getBookingDetail,
  };
}

export { useMyBookings } from './useMyBookings';
