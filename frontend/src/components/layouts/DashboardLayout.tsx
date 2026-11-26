import * as React from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { cn } from '@/lib/utils';
import type { DashboardLayoutProps } from '@/types/layout';

export type { DashboardLayoutProps };

/**
 * Name Function: DashboardLayout
 * Description: Primary dashboard shell wrapping desktop/mobile sidebar navigation and the main scrollable content area.
 * Reason: Isolates mobile navbar management and sidebar collapse state synchronization so child views transition smoothly without unmounting the layout.
 **/
export function DashboardLayout({
  children,
  activeTab,
  onTabChange,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  className,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div
      className={cn(
        'min-h-screen bg-background text-foreground flex flex-col md:flex-row antialiased',
        className
      )}
    >
      {/* Skip Link for Accessibility */}
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-md"
      >
        Skip to main content
      </a>

      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight text-foreground">
            Booking Rooms
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Reusable Sidebar Component */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        onLogout={onLogout}
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area Landmark */}
      <main id="dashboard-main" className="flex-1 overflow-y-auto p-6 max-h-[100dvh]">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
