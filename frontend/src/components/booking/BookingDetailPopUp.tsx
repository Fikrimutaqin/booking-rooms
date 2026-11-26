import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBookingStatusVariant } from '@/utils/status';
import { formatSchedule } from '@/utils/date';
import { BookingDetailPopupProps } from '@/types/booking';
import { Calendar, Clock, MapPin, User, FileText, Hash } from 'lucide-react';

/**
 * Name Function: BookingDetailPopup
 * Description: Modal dialog displaying comprehensive room booking details, status, room info, reserving user, and scheduled timeframe.
 * Reason: Renders a read-only detailed view for a selected booking item without performing unnecessary additional network requests.
 **/
export default function BookingDetailPopup({
  booking,
  open,
  onOpenChange,
}: BookingDetailPopupProps) {
  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center justify-between pr-4">
            <DialogTitle className="text-lg font-semibold">Booking Details</DialogTitle>
            <Badge variant={getBookingStatusVariant(booking.status)}>
              {booking.status}
            </Badge>
          </div>
          <DialogDescription>
            Detailed reservation metadata and scheduled timeframe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title / Meeting Subject */}
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex items-start gap-2.5">
              <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Meeting Title</p>
                <p className="text-sm font-semibold text-foreground">
                  {booking.title || 'No Title'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Room Name & Location */}
            <div className="rounded-lg border border-border p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>Room</span>
              </div>
              <p className="text-sm font-medium text-foreground">
                {booking.room?.name || 'Standard Room'}
              </p>
              {booking.room?.location && (
                <p className="text-xs text-muted-foreground">{booking.room.location}</p>
              )}
            </div>

            {/* Reserved By */}
            <div className="rounded-lg border border-border p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span>Reserved By</span>
              </div>
              <p className="text-sm font-medium text-foreground">
                {booking.user?.name || 'User'}
              </p>
              {booking.user?.email && (
                <p className="text-xs text-muted-foreground truncate">{booking.user.email}</p>
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="rounded-lg border border-border p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Schedule</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span>{formatSchedule(booking.startAt, booking.endAt)}</span>
            </div>
          </div>

          {/* Booking ID */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3" /> Booking Reference
            </span>
            <span className="font-mono text-[11px]">{booking.id}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
