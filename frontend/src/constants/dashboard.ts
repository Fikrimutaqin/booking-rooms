import type { TabConfig, TabType } from '@/types/dashboard';

export const TAB_CONFIG: Record<TabType, TabConfig> = {
  bookings: {
    title: 'Bookings Management',
    description: 'Overview and schedule of room bookings across the organization.',
    actionLabel: 'Add Booking',
    searchPlaceholder: 'Search bookings...',
  },
  rooms: {
    title: 'Rooms Management',
    description: 'Manage meeting rooms, capacities, and facilities on premises.',
    actionLabel: 'Add Room',
    searchPlaceholder: 'Search rooms...',
  },
  users: {
    title: 'Users Management',
    description: 'Manage organization member accounts and system permissions.',
    actionLabel: 'Add User',
    searchPlaceholder: 'Search users...',
  },
};
