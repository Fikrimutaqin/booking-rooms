import { BookingStatus } from '@prisma/client';

export interface BookingRoomSummary {
  id: string;
  name: string;
  location?: string | null;
  capacity?: number;
}

export interface BookingUserSummary {
  id: string;
  name: string;
  email: string;
}

/**
 * Standard booking response with room summary
 */
export interface BookingWithRoom {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  startAt: Date;
  endAt: Date;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  room: BookingRoomSummary;
}

/**
 * Detailed booking response with room and user summary
 */
export interface BookingDetail extends BookingWithRoom {
  user: BookingUserSummary;
}

export interface RecurringConflictItem {
  week: number;
  date: string;
  startAt: string;
  endAt: string;
  clashTitle: string;
}

export interface RecurringBookingResponse {
  isRecurring: true;
  totalRequested: number;
  totalCreated: number;
  bookings: BookingWithRoom[];
  conflicts: RecurringConflictItem[];
}
