import type { ParsedBookingError } from '@/types/booking';

/**
 * Name Function: parseBookingError
 * Description: Translates raw backend exceptions or validation messages into clear, friendly titles, explanations, and actionable guidance.
 * Reason: Centralizes error parsing logic away from view components, ensuring users always receive helpful feedback when reservations fail.
 **/
export function parseBookingError(rawError: string | null): ParsedBookingError {
  if (!rawError) {
    return {
      title: 'Booking Request Failed',
      description: 'An unexpected error occurred while processing your room reservation.',
      suggestion: 'Please verify your inputs and try submitting again.',
      iconType: 'general',
    };
  }

  const lower = rawError.toLowerCase();

  // 1. Conflict / Overlapping reservation
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

  // 2. Working hours constraint (08:00 - 18:00 WIB)
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

  // 3. Duration constraints (30 mins - 4 hours)
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

  // 4. Past time constraint
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

  // 5. End time before or equal to start time
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

  // 6. Fallback generic error
  return {
    title: 'Unable to Complete Reservation',
    description: rawError,
    suggestion:
      'Please check your meeting details (title, room, date, and time range) and try again.',
    iconType: 'general',
  };
}
