export interface WorkingHours {
  start: string;
  end: string;
  timezone: string;
}

export interface RoomBookingSlot {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
}

export interface RoomAvailability {
  room: { id: string };
  date: string;
  workingHours: WorkingHours;
  bookings: RoomBookingSlot[];
}
