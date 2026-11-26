import * as React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DAYS_OF_WEEK, generateCalendarDays, getNextAvailableWeekday } from '@/utils/calendar';
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
  isMultiDate = false,
  endDate = null,
  activeRangeField,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(() => {
    return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  });
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null);

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
    onSelectDate(getNextAvailableWeekday(now));
  };

  // Delegate day grid calculation to pure calendar utility
  const calendarDays = React.useMemo(() => {
    return generateCalendarDays(currentMonth, today, selectedDate, bookedDates);
  }, [currentMonth, today, selectedDate, bookedDates]);

  return (
    <div className={cn('p-4 bg-card rounded-xl border border-border shadow-sm', className)}>
      {/* Month Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold text-base text-foreground tracking-tight">
            {monthName}
          </h2>
          {isMultiDate ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
              {activeRangeField === 'start'
                ? 'Select First Date'
                : activeRangeField === 'end'
                ? 'Select Second Date'
                : 'Date Range Selected'}
            </span>
          ) : (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-normal border border-border hidden sm:inline-block">
              Click another date for multi-date range
            </span>
          )}
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
          <div
            key={day}
            className={cn('py-1', (day === 'Sat' || day === 'Sun') && 'text-destructive/70 font-bold')}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1" onMouseLeave={() => setHoverDate(null)}>
        {calendarDays.map((item, idx) => {
          const isClickable = item.isCurrentMonth && !item.isPast && !item.isWeekend;

          const isSelectedStart =
            selectedDate.getFullYear() === item.date.getFullYear() &&
            selectedDate.getMonth() === item.date.getMonth() &&
            selectedDate.getDate() === item.date.getDate();

          const isSelectedEnd = Boolean(
            isMultiDate &&
              endDate &&
              endDate.getFullYear() === item.date.getFullYear() &&
              endDate.getMonth() === item.date.getMonth() &&
              endDate.getDate() === item.date.getDate()
          );

          const isHoveredRange = Boolean(
            hoverDate &&
              hoverDate > selectedDate &&
              item.date > selectedDate &&
              item.date <= hoverDate &&
              !item.isWeekend &&
              (!isMultiDate || activeRangeField === 'end')
          );

          const isInRange = Boolean(
            isMultiDate &&
              endDate &&
              item.date >= selectedDate &&
              item.date <= endDate &&
              !item.isWeekend
          );

          return (
            <button
              key={`${item.dateStr}-${idx}`}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onSelectDate(item.date)}
              onMouseEnter={() => isClickable && setHoverDate(item.date)}
              title={
                item.isWeekend
                  ? 'Weekends are closed (Saturday & Sunday)'
                  : item.isPast
                  ? 'Cannot book past date'
                  : undefined
              }
              className={cn(
                'relative flex flex-col items-center justify-center h-10 rounded-lg text-xs transition-colors',
                !item.isCurrentMonth && 'text-muted-foreground/40 pointer-events-none',
                item.isCurrentMonth && item.isPast && 'text-muted-foreground/50 cursor-not-allowed bg-muted/20',
                item.isCurrentMonth &&
                  !item.isPast &&
                  item.isWeekend &&
                  'text-muted-foreground/40 bg-muted/20 cursor-not-allowed border border-dashed border-border/40',
                item.isCurrentMonth && !item.isPast && !item.isWeekend && 'hover:bg-muted text-foreground cursor-pointer',
                (isInRange || isHoveredRange) && !isSelectedStart && !isSelectedEnd && 'bg-primary/15 text-primary font-medium rounded-md',
                item.isToday && !isSelectedStart && !isSelectedEnd && 'border border-primary font-bold text-primary',
                (isSelectedStart || isSelectedEnd) &&
                  'bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/95'
              )}
              aria-label={`Select ${item.dateStr}${item.isWeekend ? ' (Weekend - Closed)' : ''}`}
              aria-pressed={isSelectedStart || isSelectedEnd}
            >
              <span className="leading-none">{item.date.getDate()}</span>
              {isMultiDate && isSelectedStart && (
                <span className="text-[8px] leading-none opacity-90 mt-0.5">First Date</span>
              )}
              {isMultiDate && isSelectedEnd && (
                <span className="text-[8px] leading-none opacity-90 mt-0.5">Second Date</span>
              )}

              {/* Dot indicator if day has bookings */}
              {item.hasBookings && (
                <span
                  className={cn(
                    'absolute bottom-0.5 h-1 w-1 rounded-full',
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
      <div className="flex flex-wrap items-center justify-between gap-2 pt-4 mt-3 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span>Has bookings</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-primary" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-destructive/60" />
          <span>Weekend (Closed)</span>
        </div>
      </div>
    </div>
  );
}

export default BookingCalendar;
