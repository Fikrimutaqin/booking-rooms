import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { DashboardHeader } from '@/components/dashboard/Header';
import { BookingsView } from '@/components/dashboard/BookingsView';
import { RoomsView } from '@/components/dashboard/RoomsView';
import { UsersView } from '@/components/dashboard/UsersView';
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
import { ROUTES } from '@/constants/routes';
import type { DashboardPageProps } from '@/types/dashboard';

export type { DashboardPageProps };

/**
 * Name Function: DashboardPage
 * Description: Main dashboard orchestrator page managing tab views (Bookings, Rooms, Users), dynamic header, and action dialog modals.
 * Reason: Follows a presentational component pattern by delegating state and configuration to useDashboardState, keeping the page focused on layout composition.
 **/
export function DashboardPage(props: DashboardPageProps) {
  const navigate = useNavigate();
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

  const handleAction = () => {
    if (activeTab === 'bookings') {
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
        actionLabel={currentConfig.actionLabel}
        onAction={handleAction}
        searchPlaceholder={currentConfig.searchPlaceholder}
        isSidebarCollapsed={isCollapsed}
        onExpandSidebar={expandSidebar}
      />

      {activeTab === 'bookings' && <BookingsView />}
      {activeTab === 'rooms' && <RoomsView />}
      {activeTab === 'users' && <UsersView />}

      {/* Shadcn UI Action Dialog */}
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
    </DashboardLayout>
  );
}

export default DashboardPage;
