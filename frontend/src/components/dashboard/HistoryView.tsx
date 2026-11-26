import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CalendarDays,
    Clock,
    MoreHorizontal,
    Loader2,
    Plus,
    Search,
    CheckCircle2,
    XCircle,
    History,
    RotateCcw,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useMyBookings } from '@/hooks/useMyBookings';
import { getBookingStatusVariant } from '@/utils/status';
import { formatSchedule } from '@/utils/date';
import { ROUTES } from '@/constants/routes';
import BookingDetailPopup from '@/components/booking/BookingDetailPopUp';
import { BookingErrorDialog } from '@/components/booking/BookingErrorDialog';
import type { BookingApiItem } from '@/types/booking';
import { cn } from '@/lib/utils';

type HistoryStatusFilter = 'ALL' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

/**
 * Name Function: HistoryView
 * Description: Dedicated booking history view component displaying personal reservation logs fetched from GET /bookings/me.
 * Reason: Gives users an audit log of their personal room bookings with status metrics, real-time search, filters, details inspection, and cancellation.
 **/
export function HistoryView() {
    const navigate = useNavigate();
    const { bookings, loading, error, cancelBooking, refetch } = useMyBookings();

    const [searchQuery, setSearchQuery] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState<HistoryStatusFilter>('ALL');
    const [selectedBooking, setSelectedBooking] = React.useState<BookingApiItem | null>(null);
    const [showErrorDialog, setShowErrorDialog] = React.useState(false);

    // Automatically trigger error popup when error arises
    React.useEffect(() => {
        if (error) {
            setShowErrorDialog(true);
        }
    }, [error]);

    const nowMs = Date.now();

    // Dynamic Statistics computed from personal booking records
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(
        (b) => b.status === 'CONFIRMED' && new Date(b.endAt).getTime() >= nowMs
    ).length;
    const completedBookings = bookings.filter(
        (b) => b.status === 'CONFIRMED' && new Date(b.endAt).getTime() < nowMs
    ).length;
    const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED').length;

    // Filtered and searched records
    const filteredBookings = React.useMemo(() => {
        return bookings.filter((b) => {
            // Status filtering
            if (statusFilter === 'CONFIRMED') {
                if (b.status !== 'CONFIRMED' || new Date(b.endAt).getTime() < nowMs) return false;
            } else if (statusFilter === 'COMPLETED') {
                if (b.status !== 'CONFIRMED' || new Date(b.endAt).getTime() >= nowMs) return false;
            } else if (statusFilter === 'CANCELLED') {
                if (b.status !== 'CANCELLED') return false;
            }

            // Search query filtering (by title, room name, or booking ID)
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const titleMatch = b.title?.toLowerCase().includes(query);
                const roomMatch = b.room?.name?.toLowerCase().includes(query);
                const idMatch = b.id?.toLowerCase().includes(query);
                if (!titleMatch && !roomMatch && !idMatch) return false;
            }

            return true;
        });
    }, [bookings, statusFilter, searchQuery, nowMs]);

    return (
        <div className="space-y-6">
            {/* Summary Statistics Cards */}
            <section aria-label="Personal Booking Statistics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total History"
                    value={loading ? '...' : totalBookings}
                    description="Total reservations made"
                    icon={History}
                    className="border-border bg-card shadow-sm"
                />
                <StatCard
                    title="Upcoming"
                    value={loading ? '...' : activeBookings}
                    description="Active confirmed sessions"
                    icon={CalendarDays}
                    className="border-border bg-card shadow-sm"
                />
                <StatCard
                    title="Completed"
                    value={loading ? '...' : completedBookings}
                    description="Concluded meetings"
                    icon={CheckCircle2}
                    className="border-border bg-card shadow-sm"
                />
                <StatCard
                    title="Cancelled"
                    value={loading ? '...' : cancelledBookings}
                    description="Revoked bookings"
                    icon={XCircle}
                    className="border-border bg-card shadow-sm"
                />
            </section>

            {/* Main History Table Card */}
            <Card className="border-border bg-card shadow-sm">
                <CardHeader className="px-6 py-4 border-b border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-semibold">My Reservation History</CardTitle>
                            <CardDescription className="text-xs">
                                History and logs of room bookings created by your account (/bookings/me).
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetch()}
                                disabled={loading}
                                className="gap-1.5 h-8 text-xs shadow-sm"
                                title="Refresh history"
                            >
                                <RotateCcw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
                                <span>Refresh</span>
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => navigate(ROUTES.ADD_BOOKING)}
                                className="gap-1.5 h-8 text-xs shadow-sm"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>New Reservation</span>
                            </Button>
                        </div>
                    </div>

                    {/* Search Bar & Status Filter Pills */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 mt-1 border-t border-border">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by title, room, or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-9 text-xs"
                            />
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-lg border border-border self-start sm:self-auto overflow-x-auto text-xs">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('ALL')}
                                className={cn(
                                    'px-2.5 py-1 rounded-md font-medium transition-colors',
                                    statusFilter === 'ALL'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                All ({totalBookings})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('CONFIRMED')}
                                className={cn(
                                    'px-2.5 py-1 rounded-md font-medium transition-colors',
                                    statusFilter === 'CONFIRMED'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                Upcoming ({activeBookings})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('COMPLETED')}
                                className={cn(
                                    'px-2.5 py-1 rounded-md font-medium transition-colors',
                                    statusFilter === 'COMPLETED'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                Completed ({completedBookings})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('CANCELLED')}
                                className={cn(
                                    'px-2.5 py-1 rounded-md font-medium transition-colors',
                                    statusFilter === 'CANCELLED'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                Cancelled ({cancelledBookings})
                            </button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Table>
                        <caption className="sr-only">List of your personal room reservations</caption>
                        <TableHeader>
                            <TableRow>
                                <TableHead scope="col" className="w-[120px]">Booking ID</TableHead>
                                <TableHead scope="col">Meeting Title</TableHead>
                                <TableHead scope="col">Room & Location</TableHead>
                                <TableHead scope="col">Schedule Time</TableHead>
                                <TableHead scope="col">Status</TableHead>
                                <TableHead scope="col" className="text-right w-[80px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                            <span className="text-xs">Loading personal booking history...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2 py-4">
                                            <History className="h-8 w-8 text-muted-foreground/50" />
                                            <p className="font-medium text-foreground text-sm">
                                                {searchQuery || statusFilter !== 'ALL'
                                                    ? 'No matching reservations found'
                                                    : 'No booking history found'}
                                            </p>
                                            <p className="text-xs text-muted-foreground max-w-sm">
                                                {searchQuery || statusFilter !== 'ALL'
                                                    ? 'Try adjusting your search keywords or filter criteria to see your booking records.'
                                                    : 'You haven\'t made any room reservations yet. Click the button below to schedule your first meeting.'}
                                            </p>
                                            {!searchQuery && statusFilter === 'ALL' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(ROUTES.ADD_BOOKING)}
                                                    className="mt-2 gap-1.5 shadow-sm"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                    <span>Reserve a Room</span>
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBookings.map((booking) => {
                                    const isPast = new Date(booking.endAt).getTime() < nowMs;
                                    const isCancelled = booking.status === 'CANCELLED';

                                    return (
                                        <TableRow key={booking.id} className="hover:bg-muted/40 transition-colors">
                                            {/* Booking ID */}
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {booking.id.length > 8 ? `${booking.id.slice(0, 8)}...` : booking.id}
                                            </TableCell>

                                            {/* Title */}
                                            <TableCell className="font-medium text-foreground">
                                                <span className="block truncate max-w-[220px]" title={booking.title}>
                                                    {booking.title || 'Untitled Meeting'}
                                                </span>
                                            </TableCell>

                                            {/* Room & Location */}
                                            <TableCell className="text-xs">
                                                <div className="space-y-0.5">
                                                    <p className="font-medium text-foreground">
                                                        {booking.room?.name || 'Meeting Room'}
                                                    </p>
                                                    {booking.room?.location && (
                                                        <p className="text-[11px] text-muted-foreground">
                                                            {booking.room.location}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Schedule */}
                                            <TableCell className="text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                    <span>{formatSchedule(booking.startAt, booking.endAt)}</span>
                                                </div>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell>
                                                {isCancelled ? (
                                                    <Badge variant="destructive" className="capitalize text-[11px]">
                                                        Cancelled
                                                    </Badge>
                                                ) : isPast ? (
                                                    <Badge variant="secondary" className="capitalize text-[11px]">
                                                        Completed
                                                    </Badge>
                                                ) : (
                                                    <Badge variant={getBookingStatusVariant(booking.status)} className="capitalize text-[11px]">
                                                        {booking.status.toLowerCase()}
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            {/* Action Menu */}
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
                                                        <DropdownMenuItem
                                                            onClick={() => setSelectedBooking(booking)}
                                                            className="gap-2 cursor-pointer"
                                                        >
                                                            Booking Details
                                                        </DropdownMenuItem>
                                                        {!isCancelled && !isPast && (
                                                            <DropdownMenuItem
                                                                onClick={() => cancelBooking(booking.id)}
                                                                className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                                                            >
                                                                Cancel Booking
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Booking Details Modal Popup */}
            <BookingDetailPopup
                booking={selectedBooking}
                open={Boolean(selectedBooking)}
                onOpenChange={(open) => {
                    if (!open) setSelectedBooking(null);
                }}
            />

            {/* Error Dialog Modal Popup */}
            <BookingErrorDialog
                open={showErrorDialog}
                onOpenChange={setShowErrorDialog}
                rawError={error}
            />
        </div>
    );
}

export default HistoryView;