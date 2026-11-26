import type { CalendarDayItem } from '@/types/booking';

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Name Function: formatDateToYMD
 * Description: Converts a Date instance into a normalized 'YYYY-MM-DD' calendar date string.
 * Reason: Provides a consistent string format for comparing calendar days and indexing booked dates.
 **/
export function formatDateToYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Name Function: formatSelectedDate
 * Description: Formats a Date object into a readable localized string (e.g. 'Thursday, Nov 26, 2026').
 * Reason: Presents the active reservation date clearly in the header, form badge, and success dialog.
 **/
export function formatSelectedDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Name Function: calculateDurationMinutes
 * Description: Computes the difference in minutes between two 'HH:mm' time strings.
 * Reason: Enables instant client-side calculation to validate the 30-minute to 4-hour meeting policy.
 **/
export function calculateDurationMinutes(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  return endTotal - startTotal;
}

/**
 * Name Function: formatDurationLabel
 * Description: Converts duration minutes into a human-friendly string (e.g. '1 hr 30 mins' or '45 minutes').
 * Reason: Gives instant visual feedback to users confirming their scheduled meeting length.
 **/
export function formatDurationLabel(durationMinutes: number): string {
  if (durationMinutes <= 0) return 'Invalid duration';
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  if (hours > 0 && mins > 0) return `${hours} hr ${mins} mins`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${mins} minutes`;
}

/**
 * Name Function: generateCalendarDays
 * Description: Builds the complete 35-to-42 cell calendar grid for a given month with padding days and flags.
 * Reason: Separates complex date matrix calculation from component rendering for modularity and unit testability.
 **/
export function generateCalendarDays(
  currentMonth: Date,
  today: Date,
  selectedDate: Date,
  bookedDates: string[] = []
): CalendarDayItem[] {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // First day of current month
  const firstDay = new Date(year, month, 1);
  // 0 = Sun, 1 = Mon ... 6 = Sat -> convert to Monday-indexed: 0 = Mon ... 6 = Sun
  const firstDayIndex = (firstDay.getDay() + 6) % 7;

  // Total days in current and previous months
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: CalendarDayItem[] = [];

  // Previous month padding days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrevMonth - i);
    d.setHours(0, 0, 0, 0);
    const dateStr = formatDateToYMD(d);
    days.push({
      date: d,
      dateStr,
      isCurrentMonth: false,
      isToday: d.getTime() === today.getTime(),
      isPast: d.getTime() < today.getTime(),
      isSelected: false,
      hasBookings: bookedDates.includes(dateStr),
    });
  }

  // Current month active days
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const d = new Date(year, month, dayNum);
    d.setHours(0, 0, 0, 0);
    const dateStr = formatDateToYMD(d);
    const isSelected =
      selectedDate.getFullYear() === d.getFullYear() &&
      selectedDate.getMonth() === d.getMonth() &&
      selectedDate.getDate() === d.getDate();

    days.push({
      date: d,
      dateStr,
      isCurrentMonth: true,
      isToday: d.getTime() === today.getTime(),
      isPast: d.getTime() < today.getTime(),
      isSelected,
      hasBookings: bookedDates.includes(dateStr),
    });
  }

  // Next month padding days to complete a uniform 7-column row
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i);
    d.setHours(0, 0, 0, 0);
    const dateStr = formatDateToYMD(d);
    days.push({
      date: d,
      dateStr,
      isCurrentMonth: false,
      isToday: d.getTime() === today.getTime(),
      isPast: d.getTime() < today.getTime(),
      isSelected: false,
      hasBookings: bookedDates.includes(dateStr),
    });
  }

  return days;
}
