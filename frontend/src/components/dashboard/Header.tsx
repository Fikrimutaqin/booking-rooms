import { Plus, Search, SlidersHorizontal, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface DashboardHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  searchPlaceholder?: string;
  isSidebarCollapsed?: boolean;
  onExpandSidebar?: () => void;
}

export function DashboardHeader({
  title,
  description,
  actionLabel,
  onAction,
  searchPlaceholder = 'Search...',
  isSidebarCollapsed = false,
  onExpandSidebar,
}: DashboardHeaderProps) {
  return (
    <header className="space-y-4 border-b border-border pb-5">
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

        {actionLabel && (
          <div className="flex items-center gap-2">
            <Button onClick={onAction} className="h-9 gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              <span>{actionLabel}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-9 h-9 border-border bg-card"
          />
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-1.5 shadow-sm">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filter</span>
        </Button>
      </div>
    </header>
  );
}
