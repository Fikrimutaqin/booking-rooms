import * as React from 'react';
import { useBookings } from './useBookings';
import { useRooms } from './useRooms';
import {
  formatDateToYMD,
  formatSelectedDate,
  calculateDurationMinutes,
  formatDurationLabel,
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

  // Selected calendar date
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Form input states
  const [title, setTitle] = React.useState('');
  const [roomId, setRoomId] = React.useState('');
  const [startTime, setStartTime] = React.useState('09:00');
  const [endTime, setEndTime] = React.useState('10:00');

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
    const endDateTime = new Date(`${selectedDateStr}T${endTime}:00+07:00`);

    if (startDateTime.getTime() < Date.now()) {
      setErrorDialogState({
        open: true,
        error: "Can't order for past time. Please select an upcoming date and time.",
      });
      return;
    }

    try {
      await createBooking({
        roomId,
        title: title.trim(),
        startAt: startDateTime.toISOString(),
        endAt: endDateTime.toISOString(),
      });

      const selectedRoom = rooms.find((r) => r.id === roomId);

      setSuccessDialogState({
        open: true,
        data: {
          title: title.trim(),
          roomName: selectedRoom ? selectedRoom.name : 'Meeting Room',
          date: selectedDateFormatted,
          time: `${startTime} - ${endTime} WIB`,
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
    setSelectedDate,
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
    dayBookings,
    durationMinutes,
    durationLabel,
    rooms,
    loadingRooms,
    isMutating,
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
