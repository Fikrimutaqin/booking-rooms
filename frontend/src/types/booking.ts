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
  isWeekend: boolean;
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
  isMultiDate?: boolean;
  endDate?: Date | null;
  activeRangeField?: 'start' | 'end' | null;
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
  isRecurring?: boolean;
  recurringSummary?: string;
  isMultiDate?: boolean;
}

/**
 * Name Interface: RecurringConflictItem
 * Description: Data contract representing an individual recurring booking week conflict.
 * Reason: Identifies specific week index, date, time slot, and clashing booking reason.
 **/
export interface RecurringConflictItem {
  week: number;
  date: string;
  startAt: string;
  endAt: string;
  clashTitle: string;
}

/**
 * Name Interface: RecurringBookingResult
 * Description: Response contract returned by backend when recurring reservations are processed.
 * Reason: Contains aggregated metrics, successfully created booking rows, and skipped conflict records.
 **/
export interface RecurringBookingResult {
  isRecurring: true;
  totalRequested: number;
  totalCreated: number;
  bookings: BookingApiItem[];
  conflicts: RecurringConflictItem[];
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

/**
 * Name Interface: BookingApiItem
 * Description: Data contract representing a single booking record from the backend.
 * Reason: Defines the structure for individual booking details returned by the API.
 */
export interface BookingApiItem {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  startAt: string;
  endAt: string;
  status: 'CONFIRMED' | 'BOOKED' | 'CANCELLED';
  createdAt?: string;
  updatedAt?: string;
  room?: {
    id: string;
    name: string;
    location: string;
    capacity?: number;
    facilities?: string[] | string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Name Interface: CreateBookingPayload
 * Description: Data contract representing a single booking record from the backend.
 * Reason: Defines the structure for individual booking details returned by the API.
 */
export interface CreateBookingPayload {
  roomId: string;
  title: string;
  startAt: string;
  endAt: string;
  isRecurring?: boolean;
  recurrenceFrequency?: 'WEEKLY';
  recurrenceWeeks?: number;
  conflictStrategy?: 'ALL_OR_NOTHING' | 'SKIP_CONFLICTS';
}

/**
 * Name Interface: BookingDetailPopupProps
 * Description: Props contract for the BookingDetailPopup modal dialog component.
 * Reason: Defines visibility state, change handler callback, and the target reservation entity to display.
 **/
export interface BookingDetailPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingApiItem | null;
}

