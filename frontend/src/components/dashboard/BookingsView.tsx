import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, AlertCircle, MoreHorizontal, Loader2, Trash2, Plus } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { getBookingStatusVariant } from '@/utils/status';
import { formatSchedule } from '@/utils/date';
import { ROUTES } from '@/constants/routes';

/**
 * Name Function: BookingsView
 * Description: Room reservations list view component displaying dynamic statistics, active bookings from the server, and cancellation dropdown actions.
 * Reason: Renders real-time reservation data via useBookings, handling loading skeletons, error states, and empty states when no records exist.
 **/
export function BookingsView() {
  const navigate = useNavigate();
  const { bookings, loading, error, cancelBooking } = useBookings();

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Dynamic Statistics Cards */}
      <section aria-label="Bookings Statistics" className="grid gap-4 sm:grid-cols-3">
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
          title="Pending Approval"
          value={loading ? '...' : pendingBookings}
          description="Awaiting admin confirmation"
          icon={AlertCircle}
          className="border-border bg-card"
        />
      </section>

      {/* Bookings Table Card */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="px-6 py-4 border-b border-border">
          <CardTitle className="text-base font-semibold">Room Bookings List</CardTitle>
          <CardDescription>
            Active room reservations and schedule history in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <caption className="sr-only">Recent room reservations list</caption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Booking ID</TableHead>
                <TableHead scope="col">Room</TableHead>
                <TableHead scope="col">Reserved By</TableHead>
                <TableHead scope="col">Schedule</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col" className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span>Loading bookings data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="font-medium text-foreground">No room bookings found</p>
                      <p className="text-xs text-muted-foreground">
                        Created bookings will appear in this table automatically.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(ROUTES.ADD_BOOKING)}
                        className="mt-1 gap-1.5 shadow-sm"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add First Booking</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs">
                      {booking.id.length > 8 ? `${booking.id.slice(0, 8)}...` : booking.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {booking.room?.name || booking.title || 'Meeting Room'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {booking.user?.name || booking.user?.email || 'User'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatSchedule(booking.startAt, booking.endAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBookingStatusVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
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
                          {booking.status !== 'CANCELLED' && (
                            <DropdownMenuItem
                              onClick={() => cancelBooking(booking.id)}
                              className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" /> Cancel Booking
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default BookingsView;
