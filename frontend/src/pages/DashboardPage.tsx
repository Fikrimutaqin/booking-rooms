import * as React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { DashboardHeader } from '@/components/dashboard/Header';
import { BookingsView } from '@/components/dashboard/BookingsView';
import { RoomsView } from '@/components/dashboard/RoomsView';
import { UsersView } from '@/components/dashboard/UsersView';
import { TabType } from '@/types/dashboard';

export interface DashboardPageProps {
  onLogout?: () => void;
}

interface TabConfig {
  title: string;
  description: string;
  actionLabel: string;
  searchPlaceholder: string;
}

const TAB_CONFIG: Record<TabType, TabConfig> = {
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

export function DashboardPage({ onLogout }: DashboardPageProps) {
  const [activeTab, setActiveTab] = React.useState<TabType>('bookings');
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const currentConfig = TAB_CONFIG[activeTab];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      alert('Logout berhasil (Template Mock).');
    }
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
    >
      <DashboardHeader
        title={currentConfig.title}
        description={currentConfig.description}
        actionLabel={currentConfig.actionLabel}
        searchPlaceholder={currentConfig.searchPlaceholder}
        isSidebarCollapsed={isCollapsed}
        onExpandSidebar={() => setIsCollapsed(false)}
      />

      {activeTab === 'bookings' && <BookingsView />}
      {activeTab === 'rooms' && <RoomsView />}
      {activeTab === 'users' && <UsersView />}
    </DashboardLayout>
  );
}

export default DashboardPage;
