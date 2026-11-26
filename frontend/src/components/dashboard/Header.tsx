import { Plus, Search, SlidersHorizontal, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { DashboardHeaderProps } from '@/types/header';

export type { DashboardHeaderProps };

/**
 * Name Function: DashboardHeader
 * Description: Dashboard header component rendering page titles, contextual descriptions, action modal triggers, search bar, and filter dropdowns.
 * Reason: Delivers consistent top-level navigation and actions per dashboard tab while providing a convenient sidebar expansion trigger when collapsed.
 **/
export function DashboardHeader({
  title,
  description,
  actionLabel,
  onAction,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  isSidebarCollapsed = false,
  onExpandSidebar,
  className,
}: DashboardHeaderProps) {
  return (
    <header className={cn('space-y-4 border-b border-border pb-5', className)}>
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
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 h-9 border-border bg-card"
          />
        </div>

        {/* Shadcn UI DropdownMenu for Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 shadow-sm">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filter</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">All Statuses</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Active / Available</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Pending Confirmation</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default DashboardHeader;
