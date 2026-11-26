import * as React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DAYS_OF_WEEK, generateCalendarDays } from '@/utils/calendar';
import type { BookingCalendarProps } from '@/types/booking';

export type { BookingCalendarProps };

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

  // Delegate day grid calculation to pure calendar utility
  const calendarDays = React.useMemo(() => {
    return generateCalendarDays(currentMonth, today, selectedDate, bookedDates);
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
                !item.isCurrentMonth && 'text-muted-foreground/40 pointer-events-none',
                item.isCurrentMonth && item.isPast && 'text-muted-foreground/50 cursor-not-allowed bg-muted/20',
                item.isCurrentMonth && !item.isPast && 'hover:bg-muted text-foreground cursor-pointer',
                item.isToday && !item.isSelected && 'border border-primary font-bold text-primary',
                item.isSelected &&
                  'bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/95'
              )}
              aria-label={`Select ${item.dateStr}`}
              aria-pressed={item.isSelected}
            >
              <span>{item.date.getDate()}</span>

              {/* Dot indicator if day has bookings */}
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
