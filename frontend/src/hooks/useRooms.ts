import { useFetch } from './useFetch';
import { useApi } from './useApi';
import { apiClient } from '@/lib/apiClient';

export interface RoomApiItem {
  id: string;
  name: string;
  description?: string | null;
  capacity: number;
  facilities: string[];
  location: string;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoomPayload {
  name: string;
  description?: string;
  capacity: number;
  facilities: string[];
  location: string;
  isAvailable?: boolean;
}

/**
 * Name Function: useRooms
 * Description: Custom hook for managing meeting room directory records (fetching rooms list, creating rooms, updating details, and deleting rooms).
 * Reason: Normalizes NestJS paginated responses ({ data, meta }) into a straightforward RoomApiItem[] array consumed by RoomsView tables.
 **/
export function useRooms() {
  const { data, loading, error, refetch, setData } = useFetch<
    RoomApiItem[] | { data: RoomApiItem[] }
  >('/rooms');
  const { execute: mutate, loading: isMutating, error: mutationError } = useApi();

  const rooms: RoomApiItem[] = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { data: RoomApiItem[] }).data)
      ? (data as { data: RoomApiItem[] }).data
      : [];

  /**
   * Name Function: createRoom
   * Description: Dispatches new room details to POST /rooms and prepends the returned room into local state.
   * Reason: Yields instant UI responsiveness in the rooms table without waiting for a full network reload.
   **/
  const createRoom = async (payload: CreateRoomPayload): Promise<RoomApiItem> => {
    const newRoom = await mutate<RoomApiItem>(() =>
      apiClient.post<RoomApiItem>('/rooms', payload)
    );
    setData((prev) => {
      if (Array.isArray(prev)) return [newRoom, ...prev];
      if (prev && typeof prev === 'object' && 'data' in prev) {
        return { ...prev, data: [newRoom, ...prev.data] };
      }
      return [newRoom];
    });
    return newRoom;
  };

  /**
   * Name Function: updateRoom
   * Description: Updates room specifications or availability status via PATCH /rooms/:id.
   * Reason: Applies partial updates into the local room state array matched by room ID.
   **/
  const updateRoom = async (
    id: string,
    payload: Partial<CreateRoomPayload>
  ): Promise<RoomApiItem> => {
    const updated = await mutate<RoomApiItem>(() =>
      apiClient.patch<RoomApiItem>(`/rooms/${id}`, payload)
    );
    setData((prev) => {
      if (Array.isArray(prev)) return prev.map((item) => (item.id === id ? updated : item));
      if (prev && typeof prev === 'object' && 'data' in prev) {
        return {
          ...prev,
          data: prev.data.map((item) => (item.id === id ? updated : item)),
        };
      }
      return [updated];
    });
    return updated;
  };

  /**
   * Name Function: deleteRoom
   * Description: Deletes a room record from the database via DELETE /rooms/:id and filters it out of local state.
   * Reason: Maintains UI table consistency by immediately removing the deleted row upon server confirmation.
   **/
  const deleteRoom = async (id: string): Promise<void> => {
    await mutate(() => apiClient.delete(`/rooms/${id}`));
    setData((prev) => {
      if (Array.isArray(prev)) return prev.filter((item) => item.id !== id);
      if (prev && typeof prev === 'object' && 'data' in prev) {
        return { ...prev, data: prev.data.filter((item) => item.id !== id) };
      }
      return [];
    });
  };

  return {
    rooms,
    loading,
    error: error || mutationError,
    isMutating,
    refetch,
    createRoom,
    updateRoom,
    deleteRoom,
  };
}
