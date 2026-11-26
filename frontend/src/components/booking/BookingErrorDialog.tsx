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

export interface BookingErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rawError: string | null;
}

interface ParsedError {
  title: string;
  description: string;
  suggestion: string;
  iconType: 'conflict' | 'hours' | 'duration' | 'past' | 'general';
}

/**
 * Parses raw server or client error strings into human-friendly explanations with actionable suggestions.
 */
function parseBookingError(rawError: string | null): ParsedError {
  if (!rawError) {
    return {
      title: 'Booking Request Failed',
      description: 'An unexpected error occurred while processing your room reservation.',
      suggestion: 'Please verify your inputs and try submitting again.',
      iconType: 'general',
    };
  }

  const lower = rawError.toLowerCase();

  // 1. Conflict / Overlap
  if (
    lower.includes('already been booked') ||
    lower.includes('conflict') ||
    lower.includes('overlap') ||
    lower.includes('bentrok')
  ) {
    return {
      title: 'Schedule Conflict Detected',
      description:
        'The selected meeting room is already reserved by another user during this time slot.',
      suggestion:
        'Please choose an earlier or later time slot, or select a different meeting room that is available.',
      iconType: 'conflict',
    };
  }

  // 2. Working hours (08:00 - 18:00 WIB)
  if (
    lower.includes('working hours') ||
    lower.includes('08.00-18.00') ||
    lower.includes('08:00') ||
    lower.includes('jam kerja')
  ) {
    return {
      title: 'Outside Operating Hours',
      description:
        'Meeting room reservations can only be scheduled within office working hours: 08:00 to 18:00 WIB on the same day.',
      suggestion:
        'Please adjust your start and end times to fall between 08:00 and 18:00 WIB.',
      iconType: 'hours',
    };
  }

  // 3. Duration constraint (30 mins - 4 hours)
  if (
    lower.includes('duration') ||
    lower.includes('30 minutes') ||
    lower.includes('4 hours') ||
    lower.includes('durasi')
  ) {
    return {
      title: 'Invalid Meeting Duration',
      description:
        'Booking durations must be at least 30 minutes and no longer than 4 hours.',
      suggestion:
        'Please adjust your end time so the meeting duration is between 30 minutes and 4 hours.',
      iconType: 'duration',
    };
  }

  // 4. Past time
  if (
    lower.includes('past') ||
    lower.includes('masa lalu') ||
    lower.includes('passed')
  ) {
    return {
      title: 'Cannot Book for Past Time',
      description:
        'You cannot create a reservation for a date or time that has already passed.',
      suggestion:
        'Please select today with an upcoming time slot, or choose a future date on the calendar.',
      iconType: 'past',
    };
  }

  // 5. End time before start time
  if (
    lower.includes('after start') ||
    lower.includes('selesai') ||
    lower.includes('endat')
  ) {
    return {
      title: 'Invalid Time Range',
      description:
        'The meeting end time must be scheduled after the start time.',
      suggestion:
        'Please verify that your end time is later than your start time.',
      iconType: 'duration',
    };
  }

  // 6. Generic or fallback error
  return {
    title: 'Unable to Complete Reservation',
    description: rawError,
    suggestion:
      'Please check your meeting details (title, room, date, and time range) and try again.',
    iconType: 'general',
  };
}

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
