import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, MoreHorizontal, Loader2, Plus, Users, ChevronRight } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBookings } from '@/hooks/useBookings';
import { useRooms } from '@/hooks/useRooms';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/dashboard/TablePagination';
import { getBookingStatusVariant } from '@/utils/status';
import { formatSchedule, formatDateTime, formatDuration } from '@/utils/date';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import React from 'react';
import { BookingErrorDialog } from '../booking/BookingErrorDialog';
import { CancelBookingConfirmDialog } from '@/components/dashboard/CancelBookingConfirmDialog';
import { BookingApiItem } from '@/types/booking';

/**
 * Name Function: BookingsView
 * Description: Room reservations list view component displaying dynamic statistics, expandable reservation details, room capacity filter, table pagination, and cancellation dropdown actions.
 * Reason: Renders real-time reservation data with expandable in-row details to avoid redundant popups and paginates items cleanly.
 **/
export function BookingsView() {
  const navigate = useNavigate();
  const { bookings, loading, error, cancelBooking } = useBookings();
  const { rooms } = useRooms();

  const [capacityFilter, setCapacityFilter] = React.useState<string>('ALL');
  const [expandedBookingIds, setExpandedBookingIds] = React.useState<Record<string, boolean>>({});
  const [bookingToCancel, setBookingToCancel] = React.useState<BookingApiItem | null>(null);
  const [isCancelling, setIsCancelling] = React.useState(false);

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    try {
      setIsCancelling(true);
      await cancelBooking(bookingToCancel.id);
      setBookingToCancel(null);
    } catch {
      // Error is caught and surfaced via useBookings error state
    } finally {
      setIsCancelling(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedBookingIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Resolves room capacity from booking directly or by looking up room inventory
  const getBookingCapacity = React.useCallback(
    (booking: BookingApiItem): number | undefined => {
      if (booking.room?.capacity !== undefined) return booking.room.capacity;
      const matched = rooms.find((r) => r.id === booking.roomId);
      return matched?.capacity;
    },
    [rooms]
  );

  // Distinct room capacities available in rooms inventory or bookings
  const availableCapacities = React.useMemo(() => {
    const set = new Set<number>();
    rooms.forEach((r) => {
      if (typeof r.capacity === 'number') set.add(r.capacity);
    });
    bookings.forEach((b) => {
      const cap = getBookingCapacity(b);
      if (typeof cap === 'number') set.add(cap);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [rooms, bookings, getBookingCapacity]);

  // Filtered bookings based on selected capacity
  const filteredBookings = React.useMemo(() => {
    if (capacityFilter === 'ALL') return bookings;
    const targetCap = Number(capacityFilter);
    return bookings.filter((b) => getBookingCapacity(b) === targetCap);
  }, [bookings, capacityFilter, getBookingCapacity]);

  // Pagination hook for filtered bookings
  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedItems: paginatedBookings,
  } = usePagination(filteredBookings, 10);

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const totalCancelledBookings = bookings.filter((b) => b.status === 'CANCELLED').length;

  // State to control visibility of the error notification popup dialog
  const [showErrorDialog, setShowErrorDialog] = React.useState(false);

  // Automatically display the error popup dialog when an error occurs
  React.useEffect(() => {
    if (error) {
      setShowErrorDialog(true);
    }
  }, [error]);

  return (
    <div className="space-y-6">
      {/* Dynamic Statistics Cards */}
      <section aria-label="Bookings Statistics" className="grid gap-4 sm:grid-cols-3 mt-3">
        <StatCard
          title="Total Bookings"
          value={loading ? '...' : totalBookings}
          description="All registered reservations"
          icon={CalendarDays}
          className="border-border bg-card"
        />
        <StatCard
          title="Confirmed"
          value={loading ? '...' : activeBookings}
          description="Active confirmed bookings"
          icon={Clock}
          className="border-border bg-card"
        />
        <StatCard
          title="Canceled"
          value={loading ? '...' : totalCancelledBookings}
          description="Canceled bookings"
          icon={Clock}
          className="border-border bg-card"
        />
      </section>

      {/* Bookings Table Card */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="px-4 py-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col gap-y-1">
              <CardTitle className="text-base font-semibold">Room Bookings List</CardTitle>
              <CardDescription>
                Active room reservations and schedule history in the system
              </CardDescription>
            </div>

            {/* Filter by Room Capacity & Action Button */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <Label htmlFor="capacity-filter" className="text-xs font-medium cursor-pointer">
                  Capacity:
                </Label>
              </div>
              <select
                id="capacity-filter"
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
                className="flex h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              >
                <option value="ALL">All Capacities</option>
                {availableCapacities.map((cap) => (
                  <option key={cap} value={cap}>
                    {cap} People
                  </option>
                ))}
              </select>
              {capacityFilter !== 'ALL' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCapacityFilter('ALL')}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset
                </Button>
              )}

              <Button
                size="sm"
                onClick={() => navigate(ROUTES.ADD_BOOKING)}
                className="gap-1.5 h-8 text-xs font-medium shadow-sm ml-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Booking
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <caption className="sr-only">Recent room reservations list</caption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="w-10">
                  <span className="sr-only">Expand</span>
                </TableHead>
                <TableHead scope="col">Room & Capacity</TableHead>
                <TableHead scope="col">Schedule</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col" className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span>Loading bookings data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="font-medium text-foreground">
                        {capacityFilter !== 'ALL'
                          ? `No bookings found for rooms with ${capacityFilter} people capacity`
                          : 'No room bookings found'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {capacityFilter !== 'ALL'
                          ? 'Try choosing another capacity option or reset the filter.'
                          : 'Created bookings will appear in this table automatically.'}
                      </p>
                      {capacityFilter !== 'ALL' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCapacityFilter('ALL')}
                          className="mt-1 gap-1.5 shadow-sm"
                        >
                          <span>Show All Capacities</span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(ROUTES.ADD_BOOKING)}
                          className="mt-1 gap-1.5 shadow-sm"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add First Booking</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBookings.map((booking) => {
                  const capacity = getBookingCapacity(booking);
                  const isExpanded = Boolean(expandedBookingIds[booking.id]);
                  const matchedRoom = rooms.find(
                    (r) => r.id === (booking.room?.id || booking.roomId)
                  );
                  const facilitiesList: string[] = Array.isArray(matchedRoom?.facilities)
                    ? matchedRoom.facilities
                    : Array.isArray(booking.room?.facilities)
                      ? (booking.room.facilities as string[])
                      : typeof booking.room?.facilities === 'string'
                        ? booking.room.facilities.split(',').map((f) => f.trim())
                        : [];

                  return (
                    <React.Fragment key={booking.id}>
                      <TableRow className={cn('transition-colors', isExpanded && 'bg-muted/30')}>
                        {/* Expand Button */}
                        <TableCell className="w-10 px-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleExpand(booking.id)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            aria-label={isExpanded ? 'Collapse booking details' : 'Expand booking details'}
                          >
                            <ChevronRight
                              className={cn(
                                'h-4 w-4 transition-transform duration-200',
                                isExpanded && 'rotate-90 text-primary'
                              )}
                            />
                          </Button>
                        </TableCell>

                        {/* Room & Capacity */}
                        <TableCell className="text-xs">
                          <div className="space-y-0.5">
                            <p className="font-medium text-foreground">
                              {booking.room?.name || booking.title || 'Meeting Room'}
                            </p>
                            <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                              {capacity !== undefined && (
                                <span className="flex items-center gap-1 font-medium text-foreground/80">
                                  <Users className="h-3 w-3 text-muted-foreground" />
                                  <span>{capacity} People</span>
                                </span>
                              )}
                              {booking.room?.location && (
                                <>
                                  <span>•</span>
                                  <span>{booking.room.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Schedule */}
                        <TableCell className="text-xs text-muted-foreground">
                          {formatSchedule(booking.startAt, booking.endAt)}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge variant={getBookingStatusVariant(booking.status)}>
                            {booking.status}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                aria-label={`Booking options for ${booking.id}`}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {/* <DropdownMenuItem
                                onClick={() => toggleExpand(booking.id)}
                                className="gap-2 cursor-pointer"
                              >
                                {isExpanded ? 'Collapse Details' : 'Expand Details'}
                              </DropdownMenuItem> */}
                              {booking.status !== 'CANCELLED' && (
                                <DropdownMenuItem
                                  onClick={() => setBookingToCancel(booking)}
                                  className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                                >
                                  Cancel Booking
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>

                      {/* Expandable Non-Redundant Details Panel */}
                      {isExpanded && (
                        <TableRow className="bg-muted/20 border-b border-border/80 hover:bg-muted/20">
                          <TableCell colSpan={5} className="p-3.5 sm:px-6">
                            <div className="rounded-lg border border-border/80 bg-card p-3.5 space-y-3 shadow-xs">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                {/* Meeting Purpose & Creator */}
                                <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-border/60 pb-2.5 sm:pb-0 sm:pr-3">
                                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                    Meeting Title
                                  </span>
                                  <span className="text-sm font-semibold text-foreground block">
                                    {booking.title || 'Untitled Meeting'}
                                  </span>
                                  {booking.user ? (
                                    <div className="pt-1.5 text-xs text-muted-foreground space-y-0.5">
                                      <span className="text-[11px] block font-medium">Reserved By:</span>
                                      <p className="font-medium text-foreground">{booking.user.name}</p>
                                      {booking.user.email && (
                                        <p className="text-[11px] text-muted-foreground">{booking.user.email}</p>
                                      )}
                                    </div>
                                  ) : null}
                                </div>

                                {/* Room Facilities */}
                                <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-border/60 pb-2.5 sm:pb-0 sm:pr-3">
                                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                    Room Facilities
                                  </span>
                                  {facilitiesList.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 pt-1">
                                      {facilitiesList.map((facility: string, idx: number) => (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="text-[10px] font-normal px-2 py-0.5"
                                        >
                                          {facility}
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground italic block pt-1">
                                      Standard meeting facilities available
                                    </span>
                                  )}
                                </div>

                                {/* Duration & Audit Metadata */}
                                <div className="space-y-1.5 text-xs text-muted-foreground">
                                  <div>
                                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                      Duration
                                    </span>
                                    <span className="font-medium text-foreground">
                                      {formatDuration(booking.startAt, booking.endAt)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                      Booking Reference ID
                                    </span>
                                    <span className="font-mono text-[11px] text-foreground select-all break-all">
                                      {booking.id}
                                    </span>
                                  </div>
                                  {booking.createdAt && (
                                    <div>
                                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                        Created Timestamp
                                      </span>
                                      <span className="text-[11px] text-muted-foreground">
                                        {formatDateTime(booking.createdAt)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Table Pagination */}
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>
      <BookingErrorDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        rawError={error}
      />
      <CancelBookingConfirmDialog
        open={Boolean(bookingToCancel)}
        onOpenChange={(open) => !open && setBookingToCancel(null)}
        booking={bookingToCancel}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
      />
    </div>
  );
}

export default BookingsView;
