import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { SIDEBAR_NAV_ITEMS } from '@/constants/navigation';
import type { SidebarProps } from '@/types/sidebar';

export type { SidebarProps };

/**
 * Name Function: Sidebar
 * Description: Vertical navigation sidebar component using official Shadcn UI primitives (SidebarMenu, SidebarMenuItem, SidebarMenuButton) with mobile drawer and desktop collapse support.
 * Reason: Provides smooth tab switching (Bookings, Rooms, Users) and logout action with accessible landmarks (aria-current, aria-label, tooltip collapse) and consistent styling.
 **/
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
        className={cn(
          'fixed inset-y-0 left-0 z-40 border-r border-border bg-card flex flex-col justify-between transition-all duration-300 ease-in-out md:static md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'w-64 md:w-16' : 'w-64',
          className
        )}
        aria-label="Application Sidebar"
      >
        {/* Top Section: Brand Header & Navigation Content */}
        <div className="flex flex-col flex-1 min-h-0">
          <SidebarHeader
            className={cn(
              'hidden md:flex h-16 justify-center transition-all',
              isCollapsed ? 'items-center px-2' : 'px-4'
            )}
          >
            <div
              className={cn(
                'flex items-center w-full',
                isCollapsed ? 'justify-center' : 'justify-between'
              )}
            >
              {!isCollapsed ? (
                <>
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="font-bold text-xl tracking-tight text-foreground whitespace-nowrap">
                      Booking Rooms
                    </span>
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
            </div>
          </SidebarHeader>

          {/* Shadcn UI Navigation Landmark */}
          <SidebarContent className="p-3">
            <nav aria-label="Main Navigation">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {SIDEBAR_NAV_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={isActive}
                            onClick={() => {
                              onTabChange(item.id);
                              onCloseMobile();
                            }}
                            aria-current={isActive ? 'page' : undefined}
                            tooltip={isCollapsed ? item.label : undefined}
                            className={cn(
                              'w-full transition-colors',
                              isCollapsed ? 'justify-center px-0' : 'justify-start gap-3 px-3'
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            {!isCollapsed ? (
                              <span>{item.label}</span>
                            ) : (
                              <span className="sr-only">{item.label}</span>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </nav>
          </SidebarContent>
        </div>

        {/* Bottom Section: Logout Footer with Shadcn UI Menu */}
        <SidebarFooter className="p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onLogout}
                tooltip={isCollapsed ? 'Logout' : undefined}
                className={cn(
                  'w-full transition-colors text-muted-foreground hover:bg-muted hover:text-foreground',
                  isCollapsed ? 'justify-center px-0' : 'justify-start gap-3 px-3'
                )}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {!isCollapsed ? (
                  <span>Logout</span>
                ) : (
                  <span className="sr-only">Logout</span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </aside>
    </>
  );
}

export default Sidebar;
