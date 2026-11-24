import * as React from 'react';
import {
  CalendarDays,
  DoorOpen,
  Users,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabType } from '@/types/dashboard';

export interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  className?: string;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'bookings', label: 'Bookings', icon: CalendarDays },
  { id: 'rooms', label: 'Rooms', icon: DoorOpen },
  { id: 'users', label: 'Users', icon: Users },
];

export function Sidebar({
  activeTab,
  onTabChange,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  className,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside Landmark */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 border-r border-border bg-card flex flex-col justify-between transition-all duration-300 ease-in-out md:static md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isCollapsed ? 'w-64 md:w-16' : 'w-64'} ${className || ''}`}
        aria-label="Application Sidebar"
      >
        {/* Brand Header & Collapse Toggle */}
        <div>
          <header
            className={`hidden md:flex h-16 items-center border-b border-border transition-all ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
              }`}
          >
            {!isCollapsed ? (
              <>
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="flex flex-col whitespace-nowrap">
                    <span className="font-bold text-xl tracking-tight text-foreground">
                      Booking Rooms
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleCollapse}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            )}
          </header>

          {/* Navigation Landmark with List */}
          <nav className="p-3 space-y-1" aria-label="Main Menu">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onTabChange(item.id);
                        onCloseMobile();
                      }}
                      aria-current={isActive ? 'page' : undefined}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center rounded-md text-sm font-medium transition-colors ${isCollapsed
                          ? 'h-10 justify-center px-0'
                          : 'gap-3 px-3 py-2.5'
                        } ${isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed ? (
                        <span>{item.label}</span>
                      ) : (
                        <span className="sr-only">{item.label}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Sidebar Footer: Logout */}
        <footer className="border-t border-border p-3">
          <button
            type="button"
            onClick={onLogout}
            title={isCollapsed ? 'Logout' : undefined}
            className={`w-full flex items-center rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${isCollapsed ? 'h-10 justify-center px-0' : 'gap-3 px-3 py-2.5'
              }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed ? (
              <span>Logout</span>
            ) : (
              <span className="sr-only">Logout</span>
            )}
          </button>
        </footer>
      </aside>
    </>
  );
}
