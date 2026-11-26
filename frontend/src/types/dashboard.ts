import type * as React from 'react';

/**
 * Name Type: TabType
 * Description: String literal union type for active dashboard navigation tabs ('bookings', 'rooms', 'users', 'history').
 * Reason: Enforces type safety ensuring tab values are strictly recognized and mapped in TAB_CONFIG.
 **/
export type TabType = 'bookings' | 'rooms' | 'users' | 'history';

/**
 * Name Interface: BookingItem
 * Description: Booking record entity representation for dashboard data tables.
 * Reason: Standardizes booking attributes (id, room name, user name, date range, status) rendered in UI tables.
 **/
export interface BookingItem {
  id: string;
  room: string;
  user: string;
  date: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
}

/**
 * Name Interface: RoomItem
 * Description: Meeting room record entity representation for dashboard data tables.
 * Reason: Stores room specification details (name, capacity, location, facilities, availability status).
 **/
export interface RoomItem {
  id: string;
  name: string;
  capacity: string;
  location: string;
  facilities: string;
  status: 'Available' | 'In Use' | 'Maintenance';
}

/**
 * Name Interface: UserItem
 * Description: User directory record entity representation for dashboard member tables.
 * Reason: Stores member profile data (name, email, role, active status, joined date).
 **/
export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  status: 'Active' | 'Inactive';
  joined: string;
}

/**
 * Name Interface: StatItem
 * Description: Configuration structure for summary metric cards (StatCard).
 * Reason: Groups title, metric value, description, and Lucide icon component into a structured format.
 **/
export interface StatItem {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Name Interface: TabConfig
 * Description: Metadata configuration for dashboard tabs (title, description, action button label, search placeholder).
 * Reason: Simplifies extensibility and centralizes header text metadata when switching dashboard sections.
 **/
export interface TabConfig {
  title: string;
  description: string;
  actionLabel: string;
  searchPlaceholder: string;
}

/**
 * Name Interface: DashboardPageProps
 * Description: Props contract for the DashboardPage component.
 * Reason: Provides an optional onLogout event handler for integration with top-level routing.
 **/
export interface DashboardPageProps {
  onLogout?: () => void;
}

/**
 * Name Interface: StatCardProps
 * Description: Props contract for the StatCard metric component.
 * Reason: Defines metric attributes to be presented in a styled card.
 **/
export interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}
