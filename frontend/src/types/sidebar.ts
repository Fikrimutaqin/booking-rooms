import type { ComponentType } from 'react';
import type { TabType } from './dashboard';

/**
 * Name Interface: NavItem
 * Description: Data structure defining each navigation menu item in the sidebar.
 * Reason: Associates TabType identifiers with user-facing labels and corresponding Lucide icon components.
 **/
export interface NavItem {
  id: TabType;
  label: string;
  icon: ComponentType<{ className?: string }>;
  roles?: Array<'ADMIN' | 'EMPLOYEE'>;
}

/**
 * Name Interface: SidebarProps
 * Description: Props contract for the Sidebar navigation component.
 * Reason: Controls active tab state, desktop collapse toggle, mobile drawer state, and logout actions.
 **/
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
