import { PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DashboardHeaderProps } from '@/types/header';

export type { DashboardHeaderProps };

/**
 * Name Function: DashboardHeader
 * Description: Dashboard header component rendering page titles, contextual descriptions, action modal triggers, and sidebar expansion toggle.
 * Reason: Delivers consistent top-level navigation and actions per dashboard tab while providing a convenient sidebar expansion trigger when collapsed.
 **/
export function DashboardHeader({
  title,
  description,
  isSidebarCollapsed = false,
  onExpandSidebar,
  className,
}: DashboardHeaderProps) {
  return (
    <header className={cn('border-b border-border pb-5', className)}>
      {/* Title & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {isSidebarCollapsed && onExpandSidebar && (
            <Button
              variant="outline"
              size="icon"
              onClick={onExpandSidebar}
              className="hidden md:flex h-9 w-9 text-muted-foreground hover:text-foreground shrink-0 shadow-sm"
              aria-label="Expand navigation sidebar"
              title="Expand navigation sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
