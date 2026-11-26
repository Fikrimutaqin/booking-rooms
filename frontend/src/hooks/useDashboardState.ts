import * as React from 'react';
import { TAB_CONFIG } from '@/constants/dashboard';
import type { TabType, DashboardPageProps } from '@/types/dashboard';

/**
 * Name Function: useDashboardState
 * Description: Custom hook managing dashboard UI state (active tab, sidebar collapse state, modal dialog visibility, and logout handling).
 * Reason: Keeps the DashboardPage component as a pure view layer without entanglement in state orchestration and metadata mapping.
 **/
export function useDashboardState(props: DashboardPageProps = {}) {
  const { onLogout } = props;
  const [activeTab, setActiveTab] = React.useState<TabType>('bookings');
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const currentConfig = TAB_CONFIG[activeTab];

  /**
   * Name Function: toggleCollapse
   * Description: Toggles dashboard sidebar visibility between full expanded mode and icon-only collapsed mode.
   * Reason: Uses React.useCallback to memoize handlers preventing unnecessary re-renders in Header and Sidebar components.
   **/
  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  /**
   * Name Function: expandSidebar
   * Description: Expands the sidebar into full width from a collapsed state.
   * Reason: Provided specifically for header expand triggers when the sidebar is minimized.
   **/
  const expandSidebar = React.useCallback(() => {
    setIsCollapsed(false);
  }, []);

  /**
   * Name Function: openDialog
   * Description: Opens the action modal dialog for creating records according to the active tab.
   * Reason: Enables imperative dialog triggering from the dashboard header action button.
   **/
  const openDialog = React.useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  /**
   * Name Function: closeDialog
   * Description: Closes the active record creation modal dialog.
   * Reason: Passed to cancel buttons or submit handlers to dismiss dialogs once actions conclude.
   **/
  const closeDialog = React.useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  /**
   * Name Function: handleLogout
   * Description: Handles logout triggers originating from sidebar navigation or dashboard layouts.
   * Reason: Ensures any onLogout callback injected from the router is safely executed.
   **/
  const handleLogout = React.useCallback(() => {
    if (onLogout) {
      onLogout();
    }
  }, [onLogout]);

  return {
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
  };
}
