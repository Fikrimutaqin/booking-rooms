/**
 * Name Interface: DashboardHeaderProps
 * Description: Props contract for the DashboardHeader component.
 * Reason: Provides dynamic controls for title, description, create action trigger, search input, filter toggle, and sidebar expand handler.
 **/
export interface DashboardHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  isSidebarCollapsed?: boolean;
  onExpandSidebar?: () => void;
  className?: string;
}
