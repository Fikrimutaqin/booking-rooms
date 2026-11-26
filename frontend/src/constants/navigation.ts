import { CalendarDays, DoorOpen, Users, History } from 'lucide-react';
import type { NavItem } from '@/types/sidebar';

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  { id: 'bookings', label: 'Bookings', icon: CalendarDays },
  { id: 'rooms', label: 'Rooms', icon: DoorOpen },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'history', label: 'History Bookings', icon: History },
];