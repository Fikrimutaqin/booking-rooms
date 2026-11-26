import type { ReactNode } from 'react';
import type { TabType } from './dashboard';

/**
 * Name Interface: DashboardLayoutProps
 * Description: Props contract for the main DashboardLayout component.
 * Reason: Links active tab navigation state, tab change callback, logout handler, sidebar collapse toggle, and view content children.
 **/
export interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

/**
 * Name Interface: AuthLayoutProps
 * Description: Props contract for the authentication layout wrapper (AuthLayout).
 * Reason: Accepts child nodes such as LoginForm and optional container styling classes.
 **/
export interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}
