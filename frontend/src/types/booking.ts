/**
 * Name Interface: CalendarDayItem
 * Description: Data contract representing an individual day cell in the booking calendar grid.
 * Reason: Encapsulates day computation flags (past date, selected date, today, booking presence) for clean presentation rendering.
 **/
export interface CalendarDayItem {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isSelected: boolean;
  hasBookings: boolean;
}

/**
 * Name Interface: BookingCalendarProps
 * Description: Props contract for the interactive monthly BookingCalendar component.
 * Reason: Defines the contract for selected date binding, date change events, and booked date indicators.
 **/
export interface BookingCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  bookedDates?: string[];
  className?: string;
}

/**
 * Name Interface: ParsedBookingError
 * Description: Structured error details parsed from API or client validation for user-friendly error popups.
 * Reason: Provides a structured model separating title, descriptive text, actionable recommendation, and icon category.
 **/
export interface ParsedBookingError {
  title: string;
  description: string;
  suggestion: string;
  iconType: 'conflict' | 'hours' | 'duration' | 'past' | 'general';
}

/**
 * Name Interface: BookingErrorDialogProps
 * Description: Props contract for the BookingErrorDialog modal popup.
 * Reason: Controls dialog visibility state and injects the raw error string for runtime parsing.
 **/
export interface BookingErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rawError: string | null;
}

/**
 * Name Interface: SuccessBookingData
 * Description: Structured summary data of a newly confirmed room reservation.
 * Reason: Encapsulates meeting details required for rendering the success confirmation modal popup.
 **/
export interface SuccessBookingData {
  title: string;
  roomName: string;
  date: string;
  time: string;
}

/**
 * Name Interface: BookingSuccessDialogProps
 * Description: Props contract for the BookingSuccessDialog modal popup.
 * Reason: Controls dialog visibility, supplies confirmed reservation data, and provides navigation callbacks.
 **/
export interface BookingSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingData: SuccessBookingData | null;
  onViewList: () => void;
  onBookAnother: () => void;
}
