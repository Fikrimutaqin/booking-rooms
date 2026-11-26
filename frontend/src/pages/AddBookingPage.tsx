import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, DoorOpen, Calendar as CalendarIcon, Info, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { BookingCalendar } from '@/components/booking/BookingCalendar';
import { BookingErrorDialog } from '@/components/booking/BookingErrorDialog';
import { BookingSuccessDialog } from '@/components/booking/BookingSuccessDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBookings } from '@/hooks/useBookings';
import { useRooms } from '@/hooks/useRooms';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { formatSchedule } from '@/utils/date';
import { getBookingStatusVariant } from '@/utils/status';

/**
 * Name Function: AddBookingPage
 * Description: Dedicated room booking page featuring an interactive monthly calendar date picker, time slot selectors, conflict checks, and transparent error popup dialogs.
 * Reason: Gives users an intuitive calendar overview of room schedules and provides friendly explanations when booking constraints or collisions occur.
 **/
export function AddBookingPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { bookings, createBooking, isMutating } = useBookings();
  const { rooms, loading: loadingRooms } = useRooms();

  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Form State
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [title, setTitle] = React.useState('');
  const [roomId, setRoomId] = React.useState('');
  const [startTime, setStartTime] = React.useState('09:00');
  const [endTime, setEndTime] = React.useState('10:00');

  // Popup Dialogs State
  const [errorDialogState, setErrorDialogState] = React.useState<{
    open: boolean;
    error: string | null;
  }>({
    open: false,
    error: null,
  });

  const [successDialogState, setSuccessDialogState] = React.useState<{
    open: boolean;
    data: {
      title: string;
      roomName: string;
      date: string;
      time: string;
    } | null;
  }>({
    open: false,
    data: null,
  });

  // Automatically select the first available room once rooms load
  React.useEffect(() => {
    if (!roomId && rooms.length > 0) {
      const firstAvailable = rooms.find((r) => r.isAvailable) || rooms[0];
      if (firstAvailable) {
        setRoomId(firstAvailable.id);
      }
    }
  }, [rooms, roomId]);

  // Extract unique booked dates (YYYY-MM-DD) for calendar dot indicators
  const bookedDates = React.useMemo(() => {
    const set = new Set<string>();
    bookings.forEach((b) => {
      if (b.startAt && b.status !== 'CANCELLED') {
        const d = new Date(b.startAt);
        set.add(d.toISOString().slice(0, 10));
      }
    });
    return Array.from(set);
  }, [bookings]);

  // Bookings on the currently selected date
  const selectedDateStr = React.useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  const selectedDateFormatted = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const dayBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      if (!b.startAt || b.status === 'CANCELLED') return false;
      const d = new Date(b.startAt);
      return d.toISOString().slice(0, 10) === selectedDateStr;
    });
  }, [bookings, selectedDateStr]);

  // Duration in minutes calculation
  const durationMinutes = React.useMemo(() => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    return endTotal - startTotal;
  }, [startTime, endTime]);

  const durationLabel = React.useMemo(() => {
    if (durationMinutes <= 0) return 'Invalid duration';
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    if (hours > 0 && mins > 0) return `${hours} hr ${mins} mins`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${mins} minutes`;
  }, [durationMinutes]);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Title validation
    if (!title.trim()) {
      setErrorDialogState({
        open: true,
        error: 'Please provide a title for the meeting (e.g. "Product Sync", "Board Meeting").',
      });
      return;
    }

    // 2. Room validation
    if (!roomId) {
      setErrorDialogState({
        open: true,
        error: 'Please select an available meeting room from the dropdown list.',
      });
      return;
    }

    // 3. Time comparison
    if (durationMinutes <= 0) {
      setErrorDialogState({
        open: true,
        error: 'The meeting end time must be scheduled after the start time.',
      });
      return;
    }

    // 4. Duration constraints (30 mins - 240 mins)
    if (durationMinutes < 30 || durationMinutes > 240) {
      setErrorDialogState({
        open: true,
        error: 'Booking duration must be between 30 minutes to 4 hours.',
      });
      return;
    }

    // 5. Working hours check (08:00 - 18:00 WIB)
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    if (startMins < 480 || endMins > 1080) {
      setErrorDialogState({
        open: true,
        error: 'Booking must be within working hours 08.00-18.00 WIB on the same day.',
      });
      return;
    }

    // 6. Past check
    const startDateTime = new Date(`${selectedDateStr}T${startTime}:00+07:00`);
    const endDateTime = new Date(`${selectedDateStr}T${endTime}:00+07:00`);

    if (startDateTime.getTime() < Date.now()) {
      setErrorDialogState({
        open: true,
        error: "Can't order for past time. Please select an upcoming date and time.",
      });
      return;
    }

    try {
      await createBooking({
        roomId,
        title: title.trim(),
        startAt: startDateTime.toISOString(),
        endAt: endDateTime.toISOString(),
      });

      const selectedRoom = rooms.find((r) => r.id === roomId);

      setSuccessDialogState({
        open: true,
        data: {
          title: title.trim(),
          roomName: selectedRoom ? selectedRoom.name : 'Meeting Room',
          date: selectedDateFormatted,
          time: `${startTime} - ${endTime} WIB`,
        },
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create booking';
      setErrorDialogState({
        open: true,
        error: errorMessage,
      });
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setStartTime('09:00');
    setEndTime('10:00');
    setSuccessDialogState({ open: false, data: null });
  };

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
              Choose a date on the calendar, specify your meeting times, and confirm your reservation.
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
            />

            {/* Existing Bookings for Selected Date */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="py-3 px-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-semibold">
                      Schedule on {selectedDateFormatted}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {dayBookings.length} Booked
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Review occupied time slots to avoid overlapping reservations.
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
              <CardContent className="pt-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Selected Date Indicator */}
                  <div className="rounded-lg bg-muted/40 border border-border p-3 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Reservation Date</span>
                    <span className="font-semibold text-foreground">{selectedDateFormatted}</span>
                  </div>

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
                        Office hours: 08:00 - 18:00 WIB. Minimum duration 30m, maximum 4h.
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isMutating || loadingRooms || rooms.length === 0}
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
        onOpenChange={(open) => setErrorDialogState((prev) => ({ ...prev, open }))}
        rawError={errorDialogState.error}
      />

      {/* Success Popup Dialog */}
      <BookingSuccessDialog
        open={successDialogState.open}
        onOpenChange={(open) => setSuccessDialogState((prev) => ({ ...prev, open }))}
        bookingData={successDialogState.data}
        onViewList={() => navigate(ROUTES.DASHBOARD)}
        onBookAnother={handleResetForm}
      />
    </DashboardLayout>
  );
}

export default AddBookingPage;
