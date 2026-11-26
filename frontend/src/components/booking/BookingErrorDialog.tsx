import { AlertTriangle, Clock, CalendarX2, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { parseBookingError } from '@/utils/bookingError';
import type { BookingErrorDialogProps } from '@/types/booking';

export type { BookingErrorDialogProps };

/**
 * Name Function: BookingErrorDialog
 * Description: Pop-up alert dialog explaining booking validation errors or room conflicts with clear, friendly wording and actionable guidance.
 * Reason: Fulfills the requirement to display transparent error popups preventing user frustration when room collisions or duration constraints occur.
 **/
export function BookingErrorDialog({
  open,
  onOpenChange,
  rawError,
}: BookingErrorDialogProps) {
  const { title, description, suggestion, iconType } = parseBookingError(rawError);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-destructive/20 shadow-lg">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              {iconType === 'conflict' ? (
                <CalendarX2 className="h-5 w-5" />
              ) : iconType === 'hours' || iconType === 'duration' ? (
                <Clock className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {title}
              </DialogTitle>
              <span className="text-xs text-muted-foreground font-mono">
                Booking Notice
              </span>
            </div>
          </div>
          <DialogDescription className="text-sm text-foreground/90 pt-2 leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Suggestion Card */}
        <div className="rounded-lg border border-border bg-muted/40 p-3.5 text-xs text-muted-foreground space-y-1">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
            <span>Recommended Action</span>
          </div>
          <p className="leading-relaxed pl-5">{suggestion}</p>
        </div>

        <DialogFooter className="sm:justify-end gap-2 pt-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto shadow-sm"
          >
            Understood, Let Me Fix It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BookingErrorDialog;
