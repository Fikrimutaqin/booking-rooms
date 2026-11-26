import * as React from 'react';
import { useBookings } from './useBookings';
import { useRooms } from './useRooms';
import {
  formatDateToYMD,
  formatSelectedDate,
  calculateDurationMinutes,
  formatDurationLabel,
  isWeekend,
  getNextAvailableWeekday,
  WEEKDAYS,
  setTargetWeekday,
} from '@/utils/calendar';
import type { SuccessBookingData } from '@/types/booking';

/**
 * Name Function: useAddBooking
 * Description: Custom hook encapsulating reservation form state, room selection, time calculations, client-side validation, and API submission.
 * Reason: Keeps the AddBookingPage presentational and clean by abstracting all booking state orchestration, business rules, and dialog management.
 **/
export function useAddBooking() {
  const { bookings, createBooking, isMutating } = useBookings();
  const { rooms, loading: loadingRooms } = useRooms();

  // Selected calendar date (defaults to next available weekday)
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => {
    return getNextAvailableWeekday(new Date());
  });

  // Form input states
  const [title, setTitle] = React.useState('');
  const [roomId, setRoomId] = React.useState('');
  const [startTime, setStartTime] = React.useState('09:00');
  const [endTime, setEndTime] = React.useState('10:00');

  // Multiple Date Range booking states (endDate is null when single date is selected)
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [activeRangeField, setActiveRangeField] = React.useState<'start' | 'end' | null>(null);

  // Dynamic multi-date check: true whenever an endDate distinct from selectedDate is chosen
  const isMultiDate = React.useMemo(() => {
    return Boolean(endDate && formatDateToYMD(endDate) !== formatDateToYMD(selectedDate));
  }, [endDate, selectedDate]);

  // Safe date selection handler with automatic multi-date range detection
  const handleSelectDate = React.useCallback(
    (date: Date) => {
      if (isWeekend(date)) {
        setErrorDialogState({
          open: true,
          error:
            'Reservations cannot be made on weekends (Saturday and Sunday). All rooms are closed on non-working days.',
        });
        return;
      }

      // If user explicitly activated either the start or end date field
      if (activeRangeField === 'start') {
        setSelectedDate(date);
        if (endDate && date > endDate) {
          setEndDate(date);
        }
        setActiveRangeField('end');
        return;
      }

      if (activeRangeField === 'end') {
        if (date < selectedDate) {
          setSelectedDate(date);
          setActiveRangeField('end');
        } else {
          setEndDate(date);
          setActiveRangeField(null);
        }
        return;
      }

      // Default calendar interaction:
      // If currently in single-date mode:
      if (!endDate || formatDateToYMD(endDate) === formatDateToYMD(selectedDate)) {
        if (formatDateToYMD(date) === formatDateToYMD(selectedDate)) {
          // Clicked same date
          return;
        }
        if (date > selectedDate) {
          // Clicked a subsequent date -> creates multi-date range!
          setEndDate(date);
          setActiveRangeField(null);
        } else {
          // Clicked an earlier date -> moves selectedDate to the new date
          setSelectedDate(date);
          setEndDate(null);
          setActiveRangeField(null);
        }
        return;
      }

      // If already in multi-date mode and clicked any date on calendar:
      // Restart selection from this new date as single date (waiting for second date)
      setSelectedDate(date);
      setEndDate(null);
      setActiveRangeField(null);
    },
    [activeRangeField, selectedDate, endDate]
  );

  // Switch back to single date mode
  const handleResetToSingleDate = React.useCallback(() => {
    setEndDate(null);
    setActiveRangeField(null);
  }, []);

  // Recurring booking states
  const [isRecurring, setIsRecurring] = React.useState(false);
  const [recurrenceWeeks, setRecurrenceWeeks] = React.useState(4);

  // Toggle recurring and automatically shift away from weekends if currently on one
  const handleToggleRecurring = React.useCallback((enable: boolean) => {
    setIsRecurring(enable);
    if (enable) {
      setEndDate(null); // Mutually exclusive with date range mode
      setSelectedDate((prev) => {
        if (isWeekend(prev)) {
          return getNextAvailableWeekday(prev);
        }
        return prev;
      });
    }
  }, []);

  // Handler for directly switching the target recurring weekday (Monday to Friday only)
  const handleSelectRecurringDay = React.useCallback((dayIndex: number) => {
    setSelectedDate((prev) => setTargetWeekday(prev, dayIndex));
  }, []);

  // Popup Dialog States
  const [errorDialogState, setErrorDialogState] = React.useState<{
    open: boolean;
    error: string | null;
  }>({
    open: false,
    error: null,
  });

  const [successDialogState, setSuccessDialogState] = React.useState<{
    open: boolean;
    data: SuccessBookingData | null;
  }>({
    open: false,
    data: null,
  });

  // Automatically select the first available room once rooms list is fetched
  React.useEffect(() => {
    if (!roomId && rooms.length > 0) {
      const firstAvailable = rooms.find((r) => r.isAvailable) || rooms[0];
      if (firstAvailable) {
        setRoomId(firstAvailable.id);
      }
    }
  }, [rooms, roomId]);

  // Extract unique booked dates (YYYY-MM-DD) for calendar dot indicators
  const bookedDates = React.useMemo(() => {
    const set = new Set<string>();
    bookings.forEach((b) => {
      if (b.startAt && b.status !== 'CANCELLED') {
        const d = new Date(b.startAt);
        set.add(formatDateToYMD(d));
      }
    });
    return Array.from(set);
  }, [bookings]);

  // Selected date formatted strings
  const selectedDateStr = React.useMemo(() => {
    return formatDateToYMD(selectedDate);
  }, [selectedDate]);

  const selectedDateFormatted = React.useMemo(() => {
    return formatSelectedDate(selectedDate);
  }, [selectedDate]);

  // End date formatted strings for multi-date range
  const endDateStr = React.useMemo(() => {
    return endDate ? formatDateToYMD(endDate) : '';
  }, [endDate]);

  const endDateFormatted = React.useMemo(() => {
    return endDate ? formatSelectedDate(endDate) : '';
  }, [endDate]);

  // Compute preview and metrics for multiple date range
  const multiDatePreview = React.useMemo(() => {
    if (!isMultiDate || !endDate) return [];
    const list = [];
    const curr = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    while (curr.getTime() <= end.getTime()) {
      const dateStr = formatDateToYMD(curr);
      const dateFormatted = formatSelectedDate(curr);
      const dayName = curr.toLocaleDateString('en-US', { weekday: 'long' });
      const weekend = isWeekend(curr);

      const hasClash = bookings.some((b) => {
        if (!b.startAt || !b.endAt || b.roomId !== roomId || b.status === 'CANCELLED') return false;
        const bStart = new Date(b.startAt);
        if (formatDateToYMD(bStart) !== dateStr) return false;

        const occStartTime = new Date(`${dateStr}T${startTime}:00+07:00`).getTime();
        const occEndTime = new Date(`${dateStr}T${endTime}:00+07:00`).getTime();
        const bStartTime = bStart.getTime();
        const bEndTime = new Date(b.endAt).getTime();
        return occStartTime < bEndTime && occEndTime > bStartTime;
      });

      list.push({
        date: new Date(curr),
        dateStr,
        dateFormatted,
        dayName,
        isWeekend: weekend,
        hasConflict: weekend || hasClash,
        conflictReason: weekend
          ? 'Weekend / Holiday (Excluded)'
          : hasClash
            ? 'Room already booked'
            : undefined,
      });

      curr.setDate(curr.getDate() + 1);
    }
    return list;
  }, [isMultiDate, selectedDate, endDate, bookings, roomId, startTime, endTime]);

  const workingDaysCount = React.useMemo(() => {
    return multiDatePreview.filter((p) => !p.isWeekend).length;
  }, [multiDatePreview]);

  const weekendDaysCount = React.useMemo(() => {
    return multiDatePreview.filter((p) => p.isWeekend).length;
  }, [multiDatePreview]);

  // Active bookings on the selected date
  const dayBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      if (!b.startAt || b.status === 'CANCELLED') return false;
      const d = new Date(b.startAt);
      return formatDateToYMD(d) === selectedDateStr;
    });
  }, [bookings, selectedDateStr]);

  // Computed duration
  const durationMinutes = React.useMemo(() => {
    return calculateDurationMinutes(startTime, endTime);
  }, [startTime, endTime]);

  const durationLabel = React.useMemo(() => {
    return formatDurationLabel(durationMinutes);
  }, [durationMinutes]);

  // Compute preview for recurring weekly occurrences
  const recurringPreview = React.useMemo(() => {
    if (!isRecurring) return [];
    const previewList = [];
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const baseTime = selectedDate.getTime();

    for (let i = 0; i < recurrenceWeeks; i++) {
      const occurrenceDate = new Date(baseTime + i * oneWeekMs);
      const dateStr = formatDateToYMD(occurrenceDate);
      const dateFormatted = formatSelectedDate(occurrenceDate);
      const dayName = occurrenceDate.toLocaleDateString('en-US', { weekday: 'long' });
      const occurrenceIsWeekend = isWeekend(occurrenceDate);

      // Check for client-side clash on that date & room
      const hasClash = bookings.some((b) => {
        if (!b.startAt || !b.endAt || b.roomId !== roomId || b.status === 'CANCELLED') return false;
        const bStart = new Date(b.startAt);
        if (formatDateToYMD(bStart) !== dateStr) return false;

        const occStartTime = new Date(`${dateStr}T${startTime}:00+07:00`).getTime();
        const occEndTime = new Date(`${dateStr}T${endTime}:00+07:00`).getTime();
        const bStartTime = bStart.getTime();
        const bEndTime = new Date(b.endAt).getTime();
        return occStartTime < bEndTime && occEndTime > bStartTime;
      });

      const hasConflict = occurrenceIsWeekend || hasClash;
      const conflictReason = occurrenceIsWeekend
        ? 'Weekend / Holiday (Excluded)'
        : hasClash
          ? 'Room already booked'
          : undefined;

      previewList.push({
        week: i + 1,
        dateStr,
        dateFormatted,
        dayName,
        isWeekend: occurrenceIsWeekend,
        hasConflict,
        conflictReason,
      });
    }

    return previewList;
  }, [isRecurring, recurrenceWeeks, selectedDate, bookings, roomId, startTime, endTime]);

  // Close Dialog Handlers
  const closeErrorDialog = React.useCallback(() => {
    setErrorDialogState((prev) => ({ ...prev, open: false }));
  }, []);

  const closeSuccessDialog = React.useCallback(() => {
    setSuccessDialogState((prev) => ({ ...prev, open: false }));
  }, []);

  // Reset Form
  const handleResetForm = React.useCallback(() => {
    setTitle('');
    setStartTime('09:00');
    setEndTime('10:00');
    setSuccessDialogState({ open: false, data: null });
  }, []);

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 0. Weekend validation (Saturday and Sunday closed)
    if (!isMultiDate && isWeekend(selectedDate)) {
      setErrorDialogState({
        open: true,
        error: 'Reservations cannot be made on weekends (Saturday and Sunday). Meeting rooms are closed on non-working days.',
      });
      return;
    }

    // 0.1 Multiple date range validation
    if (isMultiDate && endDate) {
      if (endDate < selectedDate) {
        setErrorDialogState({
          open: true,
          error: 'End Date must be scheduled on or after the Start Date.',
        });
        return;
      }

      if (workingDaysCount === 0) {
        setErrorDialogState({
          open: true,
          error: 'The selected date range contains only weekends. Please include at least one weekday (Monday - Friday).',
        });
        return;
      }
    }

    // 1. Title validation
    if (!title.trim()) {
      setErrorDialogState({
        open: true,
        error: 'Please provide a title for the meeting (e.g. "Product Sync", "Board Meeting").',
      });
      return;
    }

    // 2. Room validation
    if (!roomId) {
      setErrorDialogState({
        open: true,
        error: 'Please select an available meeting room from the dropdown list.',
      });
      return;
    }

    // 3. Time comparison
    if (durationMinutes <= 0) {
      setErrorDialogState({
        open: true,
        error: 'The meeting end time must be scheduled after the start time.',
      });
      return;
    }

    // 4. Duration constraints (30 mins - 240 mins)
    if (durationMinutes < 30 || durationMinutes > 240) {
      setErrorDialogState({
        open: true,
        error: 'Booking duration must be between 30 minutes to 4 hours.',
      });
      return;
    }

    // 5. Working hours check (08:00 - 18:00 WIB)
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    if (startMins < 480 || endMins > 1080) {
      setErrorDialogState({
        open: true,
        error: 'Booking must be within working hours 08.00-18.00 WIB on the same day.',
      });
      return;
    }

    // 6. Past check
    const startDateTime = new Date(`${selectedDateStr}T${startTime}:00+07:00`);

    if (startDateTime.getTime() < Date.now()) {
      setErrorDialogState({
        open: true,
        error: "Can't order for past time. Please select an upcoming date and time.",
      });
      return;
    }

    try {
      let createdCount = 1;
      const skippedCount = 0;

      if (isMultiDate) {
        const targetDays = multiDatePreview.filter((p) => !p.isWeekend);
        if (targetDays.length === 0) {
          setErrorDialogState({
            open: true,
            error:
              'The selected date range contains only weekends. All rooms are closed on weekends.',
          });
          return;
        }

        const clashingDay = targetDays.find((p) => p.hasConflict);
        if (clashingDay) {
          setErrorDialogState({
            open: true,
            error: `Schedule conflict on ${clashingDay.dateFormatted}: ${clashingDay.conflictReason || 'Room already booked'
              }.`,
          });
          return;
        }

        // Create standard booking for each working day in the range without non-whitelisted properties
        await Promise.all(
          targetDays.map((day) => {
            const dayStartAt = new Date(
              `${day.dateStr}T${startTime}:00+07:00`
            );
            const dayEndAt = new Date(
              `${day.dateStr}T${endTime}:00+07:00`
            );

            return createBooking({
              roomId,
              title: title.trim(),
              startAt: dayStartAt.toISOString(),
              endAt: dayEndAt.toISOString(),
            });
          })
        );
        createdCount = targetDays.length;
      } else if (isRecurring) {
        const targetWeeks = recurringPreview.filter((p) => !p.isWeekend);
        if (targetWeeks.length === 0) {
          setErrorDialogState({
            open: true,
            error:
              'The selected recurring dates fall on weekends. All rooms are closed on weekends.',
          });
          return;
        }

        const clashingWeek = targetWeeks.find((p) => p.hasConflict);
        if (clashingWeek) {
          setErrorDialogState({
            open: true,
            error: `Schedule conflict on ${clashingWeek.dateFormatted}: ${
              clashingWeek.conflictReason || 'Room already booked'
            }.`,
          });
          return;
        }

        // Create standard booking for each recurring week without non-whitelisted properties
        await Promise.all(
          targetWeeks.map((week) => {
            const weekStartAt = new Date(
              `${week.dateStr}T${startTime}:00+07:00`
            );
            const weekEndAt = new Date(
              `${week.dateStr}T${endTime}:00+07:00`
            );

            return createBooking({
              roomId,
              title: title.trim(),
              startAt: weekStartAt.toISOString(),
              endAt: weekEndAt.toISOString(),
            });
          })
        );
        createdCount = targetWeeks.length;
      } else {
        const endDateTime = new Date(`${selectedDateStr}T${endTime}:00+07:00`);

        await createBooking({
          roomId,
          title: title.trim(),
          startAt: startDateTime.toISOString(),
          endAt: endDateTime.toISOString(),
        });
        createdCount = 1;
      }

      const selectedRoom = rooms.find((r) => r.id === roomId);

      setSuccessDialogState({
        open: true,
        data: {
          title: title.trim(),
          roomName: selectedRoom ? selectedRoom.name : 'Meeting Room',
          date: isMultiDate
            ? `${selectedDateFormatted} - ${endDateFormatted}`
            : isRecurring
              ? `${selectedDateFormatted} (${recurrenceWeeks} weeks recurring)`
              : selectedDateFormatted,
          time: `${startTime} - ${endTime} WIB`,
          isMultiDate,
          isRecurring: !isMultiDate && isRecurring,
          recurringSummary: isMultiDate
            ? `Multi-date reservation confirmed: ${workingDaysCount} working days scheduled (${weekendDaysCount} weekend days excluded).`
            : isRecurring
              ? `Weekly recurring reservation confirmed: ${createdCount} of ${recurrenceWeeks} sessions scheduled${skippedCount > 0 ? ` (${skippedCount} conflicts skipped)` : ''
              }.`
              : undefined,
        },
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create booking';
      setErrorDialogState({
        open: true,
        error: errorMessage,
      });
    }
  };

  return {
    selectedDate,
    setSelectedDate: handleSelectDate,
    title,
    setTitle,
    roomId,
    setRoomId,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    bookedDates,
    selectedDateStr,
    selectedDateFormatted,
    isMultiDate,
    endDate,
    setEndDate,
    endDateStr,
    endDateFormatted,
    activeRangeField,
    setActiveRangeField,
    handleResetToSingleDate,
    multiDatePreview,
    workingDaysCount,
    weekendDaysCount,
    dayBookings,
    durationMinutes,
    durationLabel,
    rooms,
    loadingRooms,
    isMutating,
    isRecurring,
    setIsRecurring: handleToggleRecurring,
    recurrenceWeeks,
    setRecurrenceWeeks,
    recurringPreview,
    handleSelectRecurringDay,
    currentDayIndex: selectedDate.getDay() === 0 ? 7 : selectedDate.getDay(),
    WEEKDAYS,
    errorDialogState,
    setErrorDialogState,
    closeErrorDialog,
    successDialogState,
    setSuccessDialogState,
    closeSuccessDialog,
    handleResetForm,
    handleSubmit,
  };
}
