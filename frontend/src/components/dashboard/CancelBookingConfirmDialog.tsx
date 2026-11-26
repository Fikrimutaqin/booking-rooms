import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatSchedule } from '@/utils/date';
import type { BookingApiItem } from '@/types/booking';

export interface CancelBookingConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingApiItem | null;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

/**
 * Name Function: CancelBookingConfirmDialog
 * Description: Accessible confirmation modal popup requesting user verification before soft-cancelling a meeting room reservation.
 * Reason: Prevents accidental booking cancellations by displaying explicit meeting metadata (room name, schedule, title) and requiring positive confirmation.
 **/
export function CancelBookingConfirmDialog({
  open,
  onOpenChange,
  booking,
  onConfirm,
  isLoading = false,
}: CancelBookingConfirmDialogProps) {
  if (!booking) return null;

  const roomName = booking.room?.name || 'Selected Room';
  const scheduleFormatted = formatSchedule(booking.startAt, booking.endAt);

  return (
    <Dialog open={open} onOpenChange={(val) => !isLoading && onOpenChange(val)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive sm:mx-0">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <DialogTitle className="text-lg font-semibold text-foreground">
              Cancel Room Reservation?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to cancel this booking? Once cancelled, the time slot will be released and made available for other team members.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Meeting Summary Card */}
        <div className="rounded-lg border border-border/80 bg-muted/30 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-muted-foreground">Meeting Title:</span>
            <span className="font-medium text-foreground text-right truncate max-w-[200px]">
              {booking.title || 'Untitled Meeting'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-muted-foreground">Room:</span>
            <span className="font-medium text-foreground text-right">{roomName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-muted-foreground">Schedule:</span>
            <span className="font-medium text-foreground text-right">{scheduleFormatted}</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="sm:mr-2"
          >
            No, Keep Reservation
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cancelling...</span>
              </>
            ) : (
              <span>Yes, Cancel Booking</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CancelBookingConfirmDialog;
