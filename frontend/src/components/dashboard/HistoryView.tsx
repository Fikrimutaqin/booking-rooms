import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CalendarDays,
    Clock,
    MoreHorizontal,
    Loader2,
    Plus,
    CheckCircle2,
    History,
    RotateCcw,
    ChevronRight,
} from 'lucide-react';
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
import { useMyBookings } from '@/hooks/useMyBookings';
import { useRooms } from '@/hooks/useRooms';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/dashboard/TablePagination';
import { getBookingStatusVariant } from '@/utils/status';
import { formatSchedule, formatDateTime, formatDuration } from '@/utils/date';
import { ROUTES } from '@/constants/routes';
import { BookingErrorDialog } from '@/components/booking/BookingErrorDialog';
import { CancelBookingConfirmDialog } from '@/components/dashboard/CancelBookingConfirmDialog';
import type { BookingApiItem } from '@/types/booking';
import { cn } from '@/lib/utils';

/**
 * Name Function: HistoryView
 * Description: Dedicated booking history view component displaying personal reservation logs with expandable details and table pagination.
 * Reason: Gives users an audit log of their personal room bookings with status metrics, in-row expandable details, and cancellation.
 **/
export function HistoryView() {
    const navigate = useNavigate();
    const { bookings, loading, error, cancelBooking, refetch } = useMyBookings();
    const { rooms } = useRooms();

    const [showErrorDialog, setShowErrorDialog] = React.useState(false);
    const [expandedHistoryIds, setExpandedHistoryIds] = React.useState<Record<string, boolean>>({});
    const [bookingToCancel, setBookingToCancel] = React.useState<BookingApiItem | null>(null);
    const [isCancelling, setIsCancelling] = React.useState(false);

    const handleConfirmCancel = async () => {
        if (!bookingToCancel) return;
        try {
            setIsCancelling(true);
            await cancelBooking(bookingToCancel.id);
            setBookingToCancel(null);
        } catch {
            // Handled by useMyBookings error state
        } finally {
            setIsCancelling(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedHistoryIds((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Client-side pagination for personal booking records
    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalPages,
        totalItems,
        paginatedItems: paginatedBookings,
    } = usePagination(bookings, 10);

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
        (b) => b.status === 'BOOKED' && new Date(b.endAt).getTime() >= nowMs
    ).length;
    const completedBookings = bookings.filter(
        (b) => b.status === 'BOOKED' && new Date(b.endAt).getTime() < nowMs
    ).length;
    const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED').length;

    return (
        <div className="space-y-6">
            {/* Summary Statistics Cards */}
            <section aria-label="Personal Booking Statistics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-3">
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
                    description="Cancelled reservations"
                    icon={RotateCcw}
                    className="border-border bg-card shadow-sm"
                />
            </section>

            {/* History Table Card */}
            <Card className="border-border bg-card shadow-sm">
                <CardHeader className="px-4 py-4 border-b border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex flex-col gap-y-1">
                            <CardTitle className="text-base font-semibold">Booking History</CardTitle>
                            <CardDescription>
                                History and logs of room bookings created by your account (/bookings/me).
                            </CardDescription>
                        </div>

                        {/* Top-Right Action Controls */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetch()}
                                disabled={loading}
                                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                            >
                                <RotateCcw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
                                <span>Refresh</span>
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => navigate(ROUTES.ADD_BOOKING)}
                                className="gap-1.5 h-8 text-xs font-medium shadow-sm"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Reserve Room</span>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <caption className="sr-only">Personal room reservations audit list</caption>
                        <TableHeader>
                            <TableRow>
                                <TableHead scope="col" className="w-10">
                                    <span className="sr-only">Expand</span>
                                </TableHead>
                                <TableHead scope="col">Title</TableHead>
                                <TableHead scope="col">Room & Location</TableHead>
                                <TableHead scope="col">Schedule</TableHead>
                                <TableHead scope="col">Status</TableHead>
                                <TableHead scope="col" className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                            <span>Loading personal booking history...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : bookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <History className="h-8 w-8 text-muted-foreground/50" />
                                            <p className="font-medium text-foreground">No personal reservations recorded</p>
                                            <p className="text-xs text-muted-foreground max-w-sm">
                                                You haven&apos;t created any meeting room bookings yet. Click below to schedule your first room.
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(ROUTES.ADD_BOOKING)}
                                                className="mt-2 gap-1.5 shadow-sm"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                <span>Reserve a Room</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedBookings.map((booking) => {
                                    const isPast = new Date(booking.endAt).getTime() < nowMs;
                                    const isCancelled = booking.status === 'CANCELLED';
                                    const isExpanded = Boolean(expandedHistoryIds[booking.id]);
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
                                            <TableRow className={cn('hover:bg-muted/40 transition-colors', isExpanded && 'bg-muted/30')}>
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



                                                {/* Title */}
                                                <TableCell className="font-medium text-foreground">
                                                    <span className="block truncate max-w-[200px]" title={booking.title}>
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
                                                            {/* <DropdownMenuItem
                                                                onClick={() => toggleExpand(booking.id)}
                                                                className="gap-2 cursor-pointer"
                                                            >
                                                                {isExpanded ? 'Collapse Details' : 'Expand Details'}
                                                            </DropdownMenuItem> */}
                                                            {!isCancelled && !isPast && (
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
                                                    <TableCell colSpan={7} className="p-3.5 sm:px-6">
                                                        <div className="rounded-lg border border-border/80 bg-card p-3.5 space-y-3 shadow-xs">
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                                                {/* Meeting Subject & Duration */}
                                                                <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-border/60 pb-2.5 sm:pb-0 sm:pr-3">
                                                                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                                                        Meeting Subject
                                                                    </span>
                                                                    <span className="text-sm font-semibold text-foreground block">
                                                                        {booking.title || 'Untitled Meeting'}
                                                                    </span>
                                                                    <div className="pt-1.5 text-xs text-muted-foreground">
                                                                        <span className="text-[11px] block font-medium">Session Duration:</span>
                                                                        <p className="font-medium text-foreground">
                                                                            {formatDuration(booking.startAt, booking.endAt)}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Room Specifications & Facilities */}
                                                                <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-border/60 pb-2.5 sm:pb-0 sm:pr-3">
                                                                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                                                        Room Facilities & Specs
                                                                    </span>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Room Capacity:{' '}
                                                                        <span className="font-medium text-foreground">
                                                                            {matchedRoom?.capacity || booking.room?.capacity || '-'} People
                                                                        </span>
                                                                    </p>
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
                                                                            Standard amenities included
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Audit & Reference IDs */}
                                                                <div className="space-y-1.5 text-xs text-muted-foreground">
                                                                    <div>
                                                                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                                                            Full Reference ID
                                                                        </span>
                                                                        <span className="font-mono text-[11px] text-foreground select-all break-all">
                                                                            {booking.id}
                                                                        </span>
                                                                    </div>
                                                                    {booking.createdAt && (
                                                                        <div>
                                                                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                                                                Recorded Timestamp
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

            {/* Error Dialog Modal Popup */}
            <BookingErrorDialog
                open={showErrorDialog}
                onOpenChange={setShowErrorDialog}
                rawError={error}
            />
            {/* Cancel Booking Confirmation Popup */}
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

export default HistoryView;
