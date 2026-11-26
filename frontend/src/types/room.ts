/**
 * Name Interface: RoomApiItem
 * Description: Meeting room entity returned by the backend /rooms API.
 * Reason: Defines room properties including capacities, facilities list, location, and operational availability.
 **/
export interface RoomApiItem {
  id: string;
  name: string;
  description?: string | null;
  capacity: number;
  facilities?: string[] | null;
  location?: string | null;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Name Interface: CreateRoomPayload
 * Description: Data transfer payload for creating a new meeting room (POST /rooms).
 * Reason: Enforces validation boundaries matching NestJS CreateRoomDto.
 **/
export interface CreateRoomPayload {
  name: string;
  description?: string;
  capacity: number;
  facilities?: string[];
  location?: string;
  isAvailable?: boolean;
}
