/**
 * Name Function: formatSchedule
 * Description: Formats a booking time range (startAt and endAt) into localized human-readable date and time strings (e.g. 'Nov 26, 2026, 09:00 - 11:00').
 * Reason: Provides clean and readable schedule representations while safely handling missing dates without throwing runtime exceptions.
 **/
export function formatSchedule(startAt?: string, endAt?: string): string {
  if (!startAt) return '-';
  try {
    const start = new Date(startAt);
    const dateStr = start.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const startTimeStr = start.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    if (!endAt) return `${dateStr}, ${startTimeStr}`;

    const end = new Date(endAt);
    const endTimeStr = end.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return `${dateStr}, ${startTimeStr} - ${endTimeStr}`;
  } catch {
    return `${startAt} - ${endAt || ''}`;
  }
}

/**
 * Name Function: formatDate
 * Description: Converts an ISO timestamp string into a localized formatted date string ('dd MMM yyyy').
 * Reason: Maintains consistent date presentation for audit logs, created timestamps, and member lists across the dashboard.
 **/
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Name Function: formatDateTime
 * Description: Formats an ISO date string into readable date and time (e.g., 'Nov 26, 2026, 14:30').
 * Reason: Used in expanded detail views for precise creation and update timestamps.
 **/
export function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    const dateStr = d.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${dateStr}, ${timeStr}`;
  } catch {
    return dateString;
  }
}

/**
 * Name Function: formatDuration
 * Description: Calculates and formats duration between startAt and endAt into hours and minutes (e.g. '1 hr 30 mins').
 * Reason: Displays human-friendly duration indicators in booking inspection panels.
 **/
export function formatDuration(startAt?: string, endAt?: string): string {
  if (!startAt || !endAt) return '-';
  try {
    const diffMs = new Date(endAt).getTime() - new Date(startAt).getTime();
    if (diffMs <= 0) return '-';
    const totalMinutes = Math.round(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0 && minutes > 0) return `${hours} hr ${minutes} mins`;
    if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
    return `${minutes} mins`;
  } catch {
    return '-';
  }
}
