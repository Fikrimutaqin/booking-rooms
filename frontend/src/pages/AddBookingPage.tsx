import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  DoorOpen,
  Calendar as CalendarIcon,
  CalendarDays,
  Info,
  Loader2,
  Repeat,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { BookingCalendar } from '@/components/booking/BookingCalendar';
import { BookingErrorDialog } from '@/components/booking/BookingErrorDialog';
import { BookingSuccessDialog } from '@/components/booking/BookingSuccessDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAddBooking } from '@/hooks/useAddBooking';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { formatSchedule } from '@/utils/date';
import { getBookingStatusVariant } from '@/utils/status';
import { isWeekend } from '@/utils/calendar';
import { cn } from '@/lib/utils';

/**
 * Name Function: AddBookingPage
 * Description: Dedicated room booking page featuring an interactive monthly calendar date picker, time slot selectors, multi-date range booking, weekly recurrence, conflict checks, and transparent error popup dialogs.
 * Reason: Keeps the component purely presentational by delegating form state, room selection, and validation to useAddBooking.
 **/
export function AddBookingPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const {
    selectedDate,
    setSelectedDate,
    title,
    setTitle,
    roomId,
    setRoomId,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    bookedDates,
    selectedDateFormatted,
    isMultiDate,
    endDate,
    endDateFormatted,
    activeRangeField,
    setActiveRangeField,
    handleResetToSingleDate,
    multiDatePreview,
    workingDaysCount,
    weekendDaysCount,
    dayBookings,
    durationMinutes,
    durationLabel,
    rooms,
    loadingRooms,
    isMutating,
    isRecurring,
    setIsRecurring,
    recurrenceWeeks,
    setRecurrenceWeeks,
    recurringPreview,
    handleSelectRecurringDay,
    currentDayIndex,
    WEEKDAYS,
    errorDialogState,
    closeErrorDialog,
    successDialogState,
    closeSuccessDialog,
    handleResetForm,
    handleSubmit,
  } = useAddBooking();

  return (
    <DashboardLayout
      activeTab="bookings"
      onTabChange={() => navigate(ROUTES.DASHBOARD)}
      onLogout={() => {
        logout();
        navigate(ROUTES.LOGIN);
      }}
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
    >
      <div className="space-y-6 max-w-6xl mx-auto pb-10">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.DASHBOARD)}
              className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground h-8 text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              New Room Reservation
            </h1>
            <p className="text-sm text-muted-foreground">
              Choose dates on the calendar or range, specify your meeting times, and confirm your reservation.
            </p>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Calendar & Day Schedule (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <BookingCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              bookedDates={bookedDates}
              isMultiDate={isMultiDate}
              endDate={endDate}
              activeRangeField={activeRangeField}
            />

            {/* Existing Bookings for Selected Date */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="py-3 px-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-semibold">
                      {isMultiDate
                        ? `Schedule Range: ${selectedDateFormatted} - ${endDateFormatted}`
                        : `Schedule on ${selectedDateFormatted}`}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {isMultiDate ? `${workingDaysCount} Working Days` : `${dayBookings.length} Booked`}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {isMultiDate
                    ? 'Review active schedule across the selected date range. Weekends are excluded.'
                    : 'Review occupied time slots to avoid overlapping reservations.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {dayBookings.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">All time slots available</p>
                    <p className="mt-0.5">No existing bookings on this date yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dayBookings.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/30 text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground">{b.title}</p>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span>{b.room?.name || 'Room'}</span>
                            <span>•</span>
                            <span>{formatSchedule(b.startAt, b.endAt)}</span>
                          </div>
                        </div>
                        <Badge variant={getBookingStatusVariant(b.status)} className="capitalize">
                          {b.status.toLowerCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Reservation Form (5 cols) */}
          <div className="lg:col-span-5">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg font-semibold">Reservation Details</CardTitle>
                <CardDescription className="text-xs">
                  Fill in the meeting requirements below.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5 px-3">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Reservation Date Section (Automatically switches between Single Date and First/Second Date) */}
                  {!isMultiDate ? (
                    <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Reservation Date</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">{selectedDateFormatted}</span>
                          {isWeekend(selectedDate) && (
                            <Badge variant="destructive" className="text-[10px]">
                              Weekend (Closed)
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1.5 border-t border-border/50">
                        <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>Click another date on the calendar to reserve across multiple dates.</span>
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border p-3.5 bg-card space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4 text-primary" />
                          <span className="text-xs font-semibold text-foreground">Reservation Dates (Date Range)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {workingDaysCount} Working Days
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleResetToSingleDate}
                            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                          >
                            Single Date
                          </Button>
                        </div>
                      </div>

                      {/* First Date & Second Date Display Cards */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        {/* First Date (Date Pertama) */}
                        <div
                          onClick={() => setActiveRangeField('start')}
                          role="button"
                          tabIndex={0}
                          className={cn(
                            'p-3 rounded-lg border text-left transition-all cursor-pointer space-y-1 select-none',
                            activeRangeField === 'start'
                              ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                              : 'border-border bg-muted/30 hover:border-primary/50'
                          )}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">First Date (Start)</span>
                            {activeRangeField === 'start' ? (
                              <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4">
                                Selecting...
                              </Badge>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">Click to change</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 pt-0.5">
                            <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-xs font-semibold text-foreground truncate">
                              {selectedDateFormatted}
                            </span>
                          </div>
                        </div>

                        {/* Second Date (Date Kedua) */}
                        <div
                          onClick={() => setActiveRangeField('end')}
                          role="button"
                          tabIndex={0}
                          className={cn(
                            'p-3 rounded-lg border text-left transition-all cursor-pointer space-y-1 select-none',
                            activeRangeField === 'end'
                              ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                              : 'border-border bg-muted/30 hover:border-primary/50'
                          )}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">Second Date (End)</span>
                            {activeRangeField === 'end' ? (
                              <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4">
                                Selecting...
                              </Badge>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">Click to change</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 pt-0.5">
                            <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-xs font-semibold text-foreground truncate">
                              {endDateFormatted}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Informative Guidance */}
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Info className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>
                          {activeRangeField === 'start'
                            ? 'Click any weekday on the calendar to change First Date.'
                            : activeRangeField === 'end'
                              ? 'Click any weekday on the calendar to change Second Date.'
                              : 'Click on the calendar to adjust the date range.'}
                        </span>
                      </div>

                      {/* Multi-Date Range Summary & Weekend Notice */}
                      <div className="rounded-md bg-muted/40 border border-border p-2.5 text-xs space-y-1">
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-foreground">Working Days Booked:</span>
                          <span className="text-primary font-bold">{workingDaysCount} days</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                          <span>Weekends Excluded (Office Closed):</span>
                          <span>{weekendDaysCount} days</span>
                        </div>
                        {workingDaysCount === 0 && (
                          <p className="text-[11px] text-destructive font-medium pt-1">
                            Selected range contains only weekend days. Please pick weekdays to reserve.
                          </p>
                        )}
                      </div>

                      {/* Multi-date occurrences preview */}
                      {multiDatePreview.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-muted-foreground">
                              Date Range Schedule:
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              {workingDaysCount} Active / {multiDatePreview.length} Total
                            </Badge>
                          </div>
                          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                            {multiDatePreview.map((item) => (
                              <div
                                key={item.dateStr}
                                className={cn(
                                  'flex items-center justify-between p-2 rounded-md border text-xs',
                                  item.isWeekend
                                    ? 'border-border/40 bg-muted/20 text-muted-foreground/60'
                                    : item.hasConflict
                                      ? 'border-destructive/30 bg-destructive/10 text-destructive'
                                      : 'border-border bg-muted/40 text-muted-foreground'
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  {item.isWeekend ? (
                                    <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                                  ) : item.hasConflict ? (
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                                  ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                  )}
                                  <div>
                                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                                      <span>{item.dayName}:</span>
                                      <span>{item.dateFormatted}</span>
                                    </div>
                                    {item.conflictReason && (
                                      <span className="text-[10px] text-destructive block">
                                        {item.conflictReason}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Badge
                                  variant={
                                    item.isWeekend
                                      ? 'outline'
                                      : item.hasConflict
                                        ? 'destructive'
                                        : 'secondary'
                                  }
                                  className="text-[10px] font-semibold"
                                >
                                  {item.isWeekend
                                    ? 'Weekend (Skipped)'
                                    : item.hasConflict
                                      ? 'Conflict'
                                      : 'Available'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Meeting Title Input */}
                  <div className="space-y-1.5">
                    <Label htmlFor="booking-title" className="text-xs font-semibold">
                      Meeting Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="booking-title"
                      name="title"
                      placeholder="e.g. Q4 Strategy Review"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isMutating}
                      required
                    />
                  </div>

                  {/* Room Selector */}
                  <div className="space-y-1.5">
                    <Label htmlFor="booking-room" className="text-xs font-semibold">
                      Select Meeting Room <span className="text-destructive">*</span>
                    </Label>
                    {loadingRooms ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading rooms...</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          id="booking-room"
                          name="roomId"
                          value={roomId}
                          onChange={(e) => setRoomId(e.target.value)}
                          disabled={isMutating || rooms.length === 0}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {rooms.map((r) => (
                            <option key={r.id} value={r.id} disabled={!r.isAvailable}>
                              {r.name} ({r.capacity} pax) - {r.location} {!r.isAvailable ? '[Maintenance]' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Time Range Pickers */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="booking-start" className="text-xs font-semibold">
                        Start Time (WIB)
                      </Label>
                      <Input
                        id="booking-start"
                        name="startTime"
                        type="time"
                        min="08:00"
                        max="17:30"
                        step="1800"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        disabled={isMutating}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="booking-end" className="text-xs font-semibold">
                        End Time (WIB)
                      </Label>
                      <Input
                        id="booking-end"
                        name="endTime"
                        type="time"
                        min="08:30"
                        max="18:00"
                        step="1800"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        disabled={isMutating}
                        required
                      />
                    </div>
                  </div>

                  {/* Duration & Policy Info Badge */}
                  <div className="rounded-lg border border-border p-3 bg-muted/20 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>Duration</span>
                      </span>
                      <span
                        className={
                          durationMinutes < 30 || durationMinutes > 240
                            ? 'font-bold text-destructive'
                            : 'font-semibold text-foreground'
                        }
                      >
                        {durationLabel}
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5 pt-1 border-t border-border text-[11px] leading-tight text-muted-foreground">
                      <Info className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                      <span>
                        Office hours: Mon - Fri, 08:00 - 18:00 WIB. Weekends (Sat - Sun) are closed.
                      </span>
                    </div>
                  </div>

                  {/* Recurring Booking Option (Only when not in Multiple Dates mode) */}
                  {!isMultiDate && (
                    <div className="rounded-lg border border-border p-3.5 bg-card space-y-3">
                      <div className="flex items-center justify-between">
                        <label htmlFor="recurring-checkbox" className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            id="recurring-checkbox"
                            type="checkbox"
                            checked={isRecurring}
                            onChange={(e) => setIsRecurring(e.target.checked)}
                            disabled={isMutating}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                              <Repeat className="h-3.5 w-3.5 text-primary" />
                              <span>Repeat Weekly</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Schedule recurring sessions on every {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                            </p>
                          </div>
                        </label>
                        {isRecurring && (
                          <Badge variant="secondary" className="text-[10px]">
                            {recurrenceWeeks} Weeks
                          </Badge>
                        )}
                      </div>

                      {isRecurring && (
                        <div className="space-y-3 pt-2 border-t border-border">
                          {/* Recurrence Duration Selector */}
                          <div className="space-y-1.5">
                            <Label htmlFor="recurrence-weeks" className="text-xs font-medium text-foreground">
                              Repeat Duration
                            </Label>
                            <select
                              id="recurrence-weeks"
                              value={recurrenceWeeks}
                              onChange={(e) => setRecurrenceWeeks(Number(e.target.value))}
                              disabled={isMutating}
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                              <option value={2}>2 Weeks (2 consecutive weeks)</option>
                              <option value={3}>3 Weeks (3 consecutive weeks)</option>
                              <option value={4}>4 Weeks (1 month - 4 meetings)</option>
                              <option value={6}>6 Weeks (6 consecutive weeks)</option>
                              <option value={8}>8 Weeks (2 months - 8 meetings)</option>
                              <option value={12}>12 Weeks (3 months - 12 meetings)</option>
                            </select>
                          </div>

                          {/* Day of Week Selector (Weekdays Only - Monday to Friday) */}
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-foreground block">
                              Repeat Day (Weekdays Only)
                            </Label>
                            <div className="grid grid-cols-5 gap-1.5">
                              {WEEKDAYS.map((w) => {
                                const isSelectedDay = currentDayIndex === w.dayIndex;
                                return (
                                  <button
                                    key={w.dayIndex}
                                    type="button"
                                    onClick={() => handleSelectRecurringDay(w.dayIndex)}
                                    disabled={isMutating}
                                    className={cn(
                                      'py-2 px-1 rounded-md border text-center transition-all flex flex-col items-center justify-center',
                                      isSelectedDay
                                        ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-sm'
                                        : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                                    )}
                                  >
                                    <span className="text-xs font-semibold">{w.shortName}</span>
                                    <span className="text-[10px] opacity-80">{w.fullName}</span>
                                  </button>
                                );
                              })}
                            </div>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-0.5">
                              <Info className="h-3 w-3 shrink-0 text-muted-foreground" />
                              <span>Weekends (Saturday & Sunday) are office holidays and are excluded automatically.</span>
                            </p>
                          </div>

                          {/* Schedule Preview List */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-muted-foreground">
                                Scheduled Occurrences Preview:
                              </span>
                              <Badge variant="outline" className="text-[10px]">
                                {recurringPreview.filter((p) => !p.isWeekend).length} Scheduled Weekdays
                              </Badge>
                            </div>
                            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                              {recurringPreview.map((item) => (
                                <div
                                  key={item.week}
                                  className={`flex items-center justify-between p-2 rounded-md border text-xs ${item.isWeekend
                                    ? 'border-destructive/30 bg-destructive/10 text-destructive'
                                    : item.hasConflict
                                      ? 'border-destructive/30 bg-destructive/10 text-destructive'
                                      : 'border-border bg-muted/40 text-muted-foreground'
                                    }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {item.isWeekend || item.hasConflict ? (
                                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                                    ) : (
                                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                    )}
                                    <div>
                                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                                        <span>Week {item.week}:</span>
                                        <span>{item.dateFormatted}</span>
                                      </div>
                                      {item.conflictReason && (
                                        <span className="text-[10px] text-muted-foreground block">
                                          {item.conflictReason}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <Badge
                                    variant={
                                      item.isWeekend
                                        ? 'destructive'
                                        : item.hasConflict
                                          ? 'destructive'
                                          : 'secondary'
                                    }
                                    className="text-[10px] font-semibold"
                                  >
                                    {item.isWeekend
                                      ? 'Weekend (Excluded)'
                                      : item.hasConflict
                                        ? 'Conflict'
                                        : 'Available'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={
                      isMutating ||
                      loadingRooms ||
                      rooms.length === 0 ||
                      (!isMultiDate && isWeekend(selectedDate)) ||
                      (isMultiDate && workingDaysCount === 0)
                    }
                    className="w-full gap-2 shadow-sm h-10 mt-2"
                  >
                    {isMutating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying & Booking...</span>
                      </>
                    ) : (
                      <>
                        <DoorOpen className="h-4 w-4" />
                        <span>Confirm Reservation</span>
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Error Popup Dialog */}
      <BookingErrorDialog
        open={errorDialogState.open}
        onOpenChange={(open) => !open && closeErrorDialog()}
        rawError={errorDialogState.error}
      />

      {/* Success Popup Dialog */}
      <BookingSuccessDialog
        open={successDialogState.open}
        onOpenChange={(open) => !open && closeSuccessDialog()}
        bookingData={successDialogState.data}
        onViewList={() => navigate(ROUTES.DASHBOARD)}
        onBookAnother={handleResetForm}
      />
    </DashboardLayout>
  );
}

export default AddBookingPage;
