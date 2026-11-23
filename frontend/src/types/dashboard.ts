export type TabType = 'bookings' | 'rooms' | 'users';

export interface BookingItem {
  id: string;
  room: string;
  user: string;
  date: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
}

export interface RoomItem {
  id: string;
  name: string;
  capacity: string;
  location: string;
  facilities: string;
  status: 'Available' | 'In Use' | 'Maintenance';
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  status: 'Active' | 'Inactive';
  joined: string;
}

export interface StatItem {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}
