import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { DashboardHeader } from '@/components/dashboard/Header';
import { BookingsView } from '@/components/dashboard/BookingsView';
import { RoomsView } from '@/components/dashboard/RoomsView';
import { UsersView } from '@/components/dashboard/UsersView';
import { HistoryView } from '@/components/dashboard/HistoryView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDashboardState } from '@/hooks/useDashboardState';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import type { DashboardPageProps } from '@/types/dashboard';

export type { DashboardPageProps };

/**
 * Name Function: DashboardPage
 * Description: Main dashboard orchestrator page managing tab views (Bookings, Rooms, Users, History), dynamic header, and action dialog modals with role-based access control.
 * Reason: Follows a presentational component pattern by delegating state and configuration to useDashboardState, keeping the page focused on layout composition and RBAC.
 **/
export function DashboardPage(props: DashboardPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const {
    activeTab,
    setActiveTab,
    isCollapsed,
    toggleCollapse,
    expandSidebar,
    currentConfig,
    handleLogout,
    isDialogOpen,
    setIsDialogOpen,
    openDialog,
    closeDialog,
  } = useDashboardState(props);

  // RBAC Guard: If employee tries to access users tab, redirect to bookings
  React.useEffect(() => {
    if (user && user.role !== 'ADMIN' && activeTab === 'users') {
      setActiveTab('bookings');
    }
  }, [user, activeTab, setActiveTab]);

  const handleAction = () => {
    if (activeTab === 'bookings' || activeTab === 'history') {
      navigate(ROUTES.ADD_BOOKING);
    } else {
      openDialog();
    }
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      isCollapsed={isCollapsed}
      onToggleCollapse={toggleCollapse}
    >
      <DashboardHeader
        title={currentConfig.title}
        description={currentConfig.description}
        actionLabel={activeTab === 'rooms' && !isAdmin ? undefined : currentConfig.actionLabel}
        onAction={handleAction}
        searchPlaceholder={currentConfig.searchPlaceholder}
        isSidebarCollapsed={isCollapsed}
        onExpandSidebar={expandSidebar}
      />

      {activeTab === 'bookings' && <BookingsView />}
      {activeTab === 'rooms' && (
        <RoomsView isAddOpen={isDialogOpen} onAddOpenChange={setIsDialogOpen} />
      )}
      {activeTab === 'users' && isAdmin && <UsersView />}
      {activeTab === 'history' && <HistoryView />}

      {/* Shadcn UI Action Dialog (Only for tabs without dedicated creation dialogs, e.g. users) */}
      {activeTab === 'users' && isAdmin && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentConfig.actionLabel}</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new record to {currentConfig.title}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="action-name">Name / Title</Label>
              <Input id="action-name" name="title" placeholder="Enter title or name..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="action-desc">Description / Notes</Label>
              <Input id="action-desc" name="notes" placeholder="Add a brief note..." />
            </div>
          </div>
          <DialogFooter className="flex sm:justify-end gap-2">
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={closeDialog}>
              Save Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
    </DashboardLayout>
  );
}

export default DashboardPage;
