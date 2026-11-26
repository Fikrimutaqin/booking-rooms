import * as React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface BookingCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  bookedDates?: string[]; // YYYY-MM-DD strings
  className?: string;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Name Function: BookingCalendar
 * Description: Interactive monthly calendar component allowing users to browse months and select available dates for room reservations.
 * Reason: Visualizes available dates, highlights existing booking dots, and prevents past-date selection to ensure valid booking requests.
 **/
export function BookingCalendar({
  selectedDate,
  onSelectDate,
  bookedDates = [],
  className,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(() => {
    return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  });

  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    onSelectDate(now);
  };

  // Generate calendar days grid (Monday-indexed)
  const calendarDays = React.useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of current month
    const firstDay = new Date(year, month, 1);
    // 0 = Sun, 1 = Mon ... 6 = Sat -> convert to 0 = Mon ... 6 = Sun
    const firstDayIndex = (firstDay.getDay() + 6) % 7;

    // Total days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Days in previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      date: Date;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isPast: boolean;
      isSelected: boolean;
      hasBookings: boolean;
    }> = [];

    // Prev month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      d.setHours(0, 0, 0, 0);
      const dateStr = d.toISOString().slice(0, 10);
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

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      d.setHours(0, 0, 0, 0);
      const dateStr = d.toISOString().slice(0, 10);
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

    // Next month padding days to complete 35 or 42 cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i);
      d.setHours(0, 0, 0, 0);
      const dateStr = d.toISOString().slice(0, 10);
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
  }, [currentMonth, today, selectedDate, bookedDates]);

  return (
    <div className={cn('p-4 bg-card rounded-xl border border-border shadow-sm', className)}>
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold text-base text-foreground tracking-tight">
            {monthName}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToday}
            className="h-8 text-xs px-2.5 shadow-sm"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekdays Row */}
      <div className="grid grid-cols-7 gap-1 pt-3 pb-2 text-center text-xs font-semibold text-muted-foreground">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((item, idx) => {
          const isClickable = item.isCurrentMonth && !item.isPast;

          return (
            <button
              key={`${item.dateStr}-${idx}`}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onSelectDate(item.date)}
              className={cn(
                'relative flex flex-col items-center justify-center h-10 rounded-lg text-xs transition-colors',
                // Text colors for non-current month or past
                !item.isCurrentMonth && 'text-muted-foreground/40 pointer-events-none',
                item.isCurrentMonth && item.isPast && 'text-muted-foreground/50 cursor-not-allowed bg-muted/20',
                item.isCurrentMonth && !item.isPast && 'hover:bg-muted text-foreground cursor-pointer',
                // Today border
                item.isToday && !item.isSelected && 'border border-primary font-bold text-primary',
                // Selected state
                item.isSelected &&
                  'bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/95',
              )}
              aria-label={`Select ${item.dateStr}`}
              aria-pressed={item.isSelected}
            >
              <span>{item.date.getDate()}</span>

              {/* Indicator dot if date has bookings */}
              {item.hasBookings && (
                <span
                  className={cn(
                    'absolute bottom-1 h-1 w-1 rounded-full',
                    item.isSelected ? 'bg-primary-foreground' : 'bg-primary'
                  )}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Calendar Legend */}
      <div className="flex items-center justify-between pt-4 mt-3 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span>Has existing bookings</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-primary" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}

export default BookingCalendar;
