import { CheckCircle2, Calendar, Clock, DoorOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { BookingSuccessDialogProps } from '@/types/booking';

export type { BookingSuccessDialogProps };

/**
 * Name Function: BookingSuccessDialog
 * Description: Pop-up dialog confirming successful room reservation with meeting summary and action links to dashboard.
 * Reason: Gives immediate positive feedback and reassurance to the user that their room has been booked and recorded in the database.
 **/
export function BookingSuccessDialog({
  open,
  onOpenChange,
  bookingData,
  onViewList,
  onBookAnother,
}: BookingSuccessDialogProps) {
  if (!bookingData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md shadow-lg">
        <DialogHeader className="gap-2 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Booking Confirmed!
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Your room reservation has been successfully created.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Meeting Details Summary Card */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3 text-sm">
          <div className="border-b border-border pb-2">
            <span className="text-xs text-muted-foreground block">Meeting Title</span>
            <span className="font-semibold text-base text-foreground">
              {bookingData.title}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <span className="text-muted-foreground block">Room</span>
                <span className="font-medium text-foreground">{bookingData.roomName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <span className="text-muted-foreground block">Date</span>
                <span className="font-medium text-foreground">{bookingData.date}</span>
              </div>
            </div>

            <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-border">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <span className="text-muted-foreground block">Schedule Time</span>
                <span className="font-medium text-foreground">{bookingData.time}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBookAnother}
            className="w-full sm:w-auto"
          >
            Book Another Room
          </Button>
          <Button
            type="button"
            onClick={onViewList}
            className="w-full sm:w-auto shadow-sm"
          >
            View in Bookings List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BookingSuccessDialog;
