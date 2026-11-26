export type StatusBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

/**
 * Name Function: getBookingStatusVariant
 * Description: Maps booking status ('CONFIRMED', 'PENDING', 'CANCELLED') to corresponding Shadcn Badge component variant styling ('default', 'secondary', 'outline').
 * Reason: Centralizes badge color mapping rules for booking statuses across tables and metric cards.
 **/
export function getBookingStatusVariant(status?: string): StatusBadgeVariant {
  switch (status) {
    case 'CONFIRMED':
      return 'default';
    case 'PENDING':
      return 'secondary';
    case 'CANCELLED':
      return 'outline';
    default:
      return 'outline';
  }
}

/**
 * Name Function: getRoomStatusVariant
 * Description: Maps room availability status ('Available', 'In Use', 'Maintenance') to corresponding Badge component variant styling.
 * Reason: Provides clear visual distinctions for available rooms (default), occupied rooms (secondary), or units in repair (outline).
 **/
export function getRoomStatusVariant(status?: string): StatusBadgeVariant {
  switch (status) {
    case 'Available':
      return 'default';
    case 'In Use':
      return 'secondary';
    case 'Maintenance':
      return 'outline';
    default:
      return 'outline';
  }
}

/**
 * Name Function: getUserRoleVariant
 * Description: Maps user access role ('ADMIN' vs 'EMPLOYEE') to Badge styling variant.
 * Reason: Highlights administrator accounts visually compared to standard employee accounts in user directories.
 **/
export function getUserRoleVariant(role?: string): StatusBadgeVariant {
  return role === 'ADMIN' ? 'default' : 'secondary';
}

/**
 * Name Function: getUserStatusVariant
 * Description: Maps user account status ('Active' vs 'Inactive') to Badge styling variant.
 * Reason: Provides visual clarity for account activity status during directory audits and access management.
 **/
export function getUserStatusVariant(status?: string): StatusBadgeVariant {
  return status === 'Active' ? 'default' : 'outline';
}
