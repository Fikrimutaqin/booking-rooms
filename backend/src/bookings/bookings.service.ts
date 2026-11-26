// Core Nest and Other Core
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Booking, BookingStatus, Prisma, Role } from '@prisma/client';

// Import Services
import { PrismaService } from '../prisma/prisma.service';

// Import DTOs
import {
  CreateBookingDto,
  ConflictStrategy,
} from './dto/create-booking.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

// Import Interfaces and Types
import {
  BookingDetail,
  BookingWithRoom,
  RecurringBookingResponse,
  RecurringConflictItem,
} from './interfaces/booking-response.interface';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

// Import Others (Common etc)
import { isOverlapError } from './utils/overlap-booking.util';
import { conflict } from './utils/conflict-booking.util';
import { PaginationParams } from '../common/decorators/paginate.decorator';

@Injectable()
export class BookingsService {
  // Constructor for prisma service
  constructor(private prisma: PrismaService) {}

  /**
   * @description Create a new single or recurring booking
   * @param userId User ID
   * @param dto Create booking DTO
   * @returns Created booking or recurring booking response
   */
  async create(
    userId: string,
    dto: CreateBookingDto,
  ): Promise<BookingWithRoom | RecurringBookingResponse> {
    // 1. Verify room exists
    const room = await this.prisma.room.findUnique({
      where: { id: dto.roomId },
    });

    if (!room) throw new NotFoundException('Room not found...');

    // 2. Handle Multi-date Range Booking (consecutive dates with weekends excluded)
    if (dto.isMultiDate && dto.endDate) {
      const dates: Date[] = [];
      const curr = new Date(dto.startAt);
      curr.setHours(0, 0, 0, 0);
      const endDay = new Date(dto.endDate);
      endDay.setHours(0, 0, 0, 0);

      if (endDay.getTime() < curr.getTime()) {
        throw new BadRequestException('End date must be on or after start date');
      }

      while (curr.getTime() <= endDay.getTime()) {
        const dayOfWeek = curr.getDay();
        // Exclude Saturday (6) and Sunday (0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          dates.push(new Date(curr));
        }
        curr.setDate(curr.getDate() + 1);
      }

      if (dates.length === 0) {
        throw conflict(
          'The selected date range contains only weekends (Saturday and Sunday). All rooms are closed on weekends.',
        );
      }

      const occurrences = dates.map((d, index) => {
        const dayStartAt = new Date(d);
        dayStartAt.setHours(
          dto.startAt.getHours(),
          dto.startAt.getMinutes(),
          dto.startAt.getSeconds(),
          0,
        );

        const dayEndAt = new Date(d);
        dayEndAt.setHours(
          dto.endAt.getHours(),
          dto.endAt.getMinutes(),
          dto.endAt.getSeconds(),
          0,
        );

        return {
          dayIndex: index + 1,
          startAt: dayStartAt,
          endAt: dayEndAt,
          dateStr: d.toISOString().split('T')[0],
        };
      });

      // Check each day against database clashes
      const conflicts: RecurringConflictItem[] = [];
      const availableOccurrences = [];

      for (const occ of occurrences) {
        const clash = await this.prisma.booking.findFirst({
          where: {
            roomId: dto.roomId,
            startAt: { lt: occ.endAt },
            endAt: { gt: occ.startAt },
            status: { not: BookingStatus.CANCELLED },
          },
          select: { id: true, title: true },
        });

        if (clash) {
          conflicts.push({
            week: occ.dayIndex,
            date: occ.dateStr,
            startAt: occ.startAt.toISOString(),
            endAt: occ.endAt.toISOString(),
            clashTitle: clash.title || 'Existing booking',
          });
        } else {
          availableOccurrences.push(occ);
        }
      }

      if (conflicts.length > 0) {
        const conflictDetails = conflicts
          .map((c) => `${c.date}: already booked for "${c.clashTitle}"`)
          .join('; ');
        throw conflict(
          `Date range conflict: ${conflictDetails}. No bookings were created because All-or-Nothing policy is active.`,
        );
      }

      try {
        const createdBookings = await this.prisma.$transaction(
          availableOccurrences.map((occ) =>
            this.prisma.booking.create({
              data: {
                roomId: dto.roomId,
                userId,
                title: dto.title,
                startAt: occ.startAt,
                endAt: occ.endAt,
              },
              include: {
                room: { select: { id: true, name: true, location: true, capacity: true } },
              },
            }),
          ),
        );

        return {
          isRecurring: true,
          totalRequested: occurrences.length,
          totalCreated: createdBookings.length,
          bookings: createdBookings,
          conflicts: [],
        };
      } catch (error) {
        if (isOverlapError(error)) {
          throw conflict(
            'One or more dates encountered a booking conflict during checkout. Please try again.',
          );
        }
        throw error;
      }
    }

    // 3. Handle non-recurring single booking
    if (!dto.isRecurring) {
      const startDay = dto.startAt.getDay();
      if (startDay === 0 || startDay === 6) {
        throw conflict(
          'Reservasi ruangan tidak dapat dijadwalkan pada hari Sabtu atau Minggu karena hari libur kantor.',
        );
      }

      const clash = await this.prisma.booking.findFirst({
        where: {
          roomId: dto.roomId,
          startAt: { lt: dto.endAt },
          endAt: { gt: dto.startAt },
          status: { not: BookingStatus.CANCELLED },
        },
        select: { id: true },
      });

      if (clash) {
        throw conflict('The room has already been booked for that time period.');
      }

      try {
        return await this.prisma.booking.create({
          data: {
            roomId: dto.roomId,
            userId,
            title: dto.title,
            startAt: dto.startAt,
            endAt: dto.endAt,
          },
          include: { room: { select: { id: true, name: true, location: true, capacity: true } } },
        });
      } catch (error) {
        if (isOverlapError(error)) {
          throw conflict(
            'The room has already been booked for that time period.',
          );
        }
        throw error;
      }
    }

    // 3. Handle recurring weekly booking
    const startDay = dto.startAt.getDay();
    if (startDay === 0 || startDay === 6) {
      throw conflict(
        'Reservasi berulang tidak dapat dijadwalkan pada hari Sabtu atau Minggu karena hari libur kantor.',
      );
    }

    const weeks =
      dto.recurrenceWeeks && dto.recurrenceWeeks >= 2 && dto.recurrenceWeeks <= 12
        ? dto.recurrenceWeeks
        : 4;
    const strategy = dto.conflictStrategy || ConflictStrategy.ALL_OR_NOTHING;

    interface OccurrencePlan {
      week: number;
      startAt: Date;
      endAt: Date;
      dateStr: string;
    }

    const occurrences: OccurrencePlan[] = [];
    const baseStartTime = dto.startAt.getTime();
    const baseEndTime = dto.endAt.getTime();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

    for (let i = 0; i < weeks; i++) {
      const occStart = new Date(baseStartTime + i * oneWeekMs);
      const occEnd = new Date(baseEndTime + i * oneWeekMs);
      occurrences.push({
        week: i + 1,
        startAt: occStart,
        endAt: occEnd,
        dateStr: occStart.toISOString().split('T')[0],
      });
    }

    // Detect conflicts across each week occurrence
    const conflicts: RecurringConflictItem[] = [];
    const availableOccurrences: OccurrencePlan[] = [];

    for (const occ of occurrences) {
      const clash = await this.prisma.booking.findFirst({
        where: {
          roomId: dto.roomId,
          startAt: { lt: occ.endAt },
          endAt: { gt: occ.startAt },
          status: { not: BookingStatus.CANCELLED },
        },
        select: { id: true, title: true },
      });

      if (clash) {
        conflicts.push({
          week: occ.week,
          date: occ.dateStr,
          startAt: occ.startAt.toISOString(),
          endAt: occ.endAt.toISOString(),
          clashTitle: clash.title || 'Existing booking',
        });
      } else {
        availableOccurrences.push(occ);
      }
    }

    // Determine behavior when a clash is detected
    if (conflicts.length > 0) {
      // Behavior 1: ALL_OR_NOTHING (Strict atomic rollback)
      if (strategy === ConflictStrategy.ALL_OR_NOTHING) {
        const conflictDetails = conflicts
          .map(
            (c) =>
              `Week ${c.week} (${c.date}) is already booked for "${c.clashTitle}"`,
          )
          .join('; ');
        throw conflict(
          `Recurring booking conflict: ${conflictDetails}. No bookings were created because All-or-Nothing policy is active.`,
        );
      }

      // Behavior 2: SKIP_CONFLICTS (Best-effort partial reservation)
      if (availableOccurrences.length === 0) {
        throw conflict(
          'All requested dates in this recurring schedule have conflicts. No bookings could be created.',
        );
      }
    }

    // Create available occurrences atomically in a Prisma transaction
    try {
      const createdBookings = await this.prisma.$transaction(
        availableOccurrences.map((occ) =>
          this.prisma.booking.create({
            data: {
              roomId: dto.roomId,
              userId,
              title: dto.title,
              startAt: occ.startAt,
              endAt: occ.endAt,
            },
            include: {
              room: { select: { id: true, name: true, location: true, capacity: true } },
            },
          }),
        ),
      );

      return {
        isRecurring: true,
        totalRequested: weeks,
        totalCreated: createdBookings.length,
        bookings: createdBookings,
        conflicts,
      };
    } catch (error) {
      if (isOverlapError(error)) {
        throw conflict(
          'One or more recurring dates encountered a booking conflict during checkout. Please try again.',
        );
      }
      throw error;
    }
  }

  /**
   * @description Find all bookings by user with filter and pagination
   * @param userId User ID
   * @param query Query booking filter
   * @param pagination Pagination parameters
   * @returns Paginated result of bookings
   */
  async findBookingMe(
    userId: string,
    query: QueryBookingDto,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<BookingWithRoom>> {
    const where: Prisma.BookingWhereInput = {
      userId,
      ...(query?.status && { status: query.status }),
      ...(query?.roomId && { roomId: query.roomId }),
      ...(query?.from && { startAt: { gte: new Date(query.from) } }),
      ...(query?.to && { endAt: { lte: new Date(query.to) } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: { room: { select: { id: true, name: true, location: true, capacity: true } } },
        orderBy: { startAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit || 20,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
      },
    };
  }

  /**
   * @description Find all bookings (Admin) with filter and pagination
   * @param query Query booking filter
   * @param pagination Pagination parameters
   * @returns Paginated result of bookings
   */
  async findAll(
    query: QueryBookingDto,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<BookingWithRoom>> {
    const where: Prisma.BookingWhereInput = {
      ...(query?.status && { status: query.status }),
      ...(query?.roomId && { roomId: query.roomId }),
      ...(query?.from && { startAt: { gte: new Date(query.from) } }),
      ...(query?.to && { endAt: { lte: new Date(query.to) } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          room: { select: { id: true, name: true, location: true, capacity: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { startAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit || 20,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
      },
    };
  }

  /**
   * @description Find booking by ID
   * @param id Booking ID
   * @param user User payload
   * @returns Booking details
   */
  async findOne(id: string, user: JwtPayload): Promise<BookingDetail> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        room: { select: { id: true, name: true, location: true, capacity: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found...');

    const isOwner = booking.userId === user.id;
    const isAdmin = user.role === Role.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You do not have the right to view this booking',
      );
    }

    return booking;
  }

  /**
   * @description Reschedule / Update a booking
   * @param id Booking ID
   * @param user User payload
   * @param dto Update booking DTO
   * @returns Updated booking with room summary
   */
  async update(
    id: string,
    user: JwtPayload,
    dto: UpdateBookingDto,
  ): Promise<BookingWithRoom> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        roomId: true,
        startAt: true,
        endAt: true,
        status: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found...');

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled booking');
    }

    const isOwner = booking.userId === user.id;
    const isAdmin = user.role === Role.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You do not have the right to update this booking',
      );
    }

    if (dto.status && dto.status !== booking.status) {
      if (!isAdmin && dto.status !== BookingStatus.CANCELLED) {
        throw new ForbiddenException(
          'You do not have permission to change booking status to this value',
        );
      }
    }

    const newStartAt = dto.startAt ?? booking.startAt;
    const newEndAt = dto.endAt ?? booking.endAt;

    if (newEndAt <= newStartAt) {
      throw new BadRequestException('endAt must be after startAt');
    }

    // Check if there are clashing bookings on the new time range
    if (dto.startAt || dto.endAt) {
      const clash = await this.prisma.booking.findFirst({
        where: {
          id: { not: id },
          roomId: booking.roomId,
          startAt: { lt: newEndAt },
          endAt: { gt: newStartAt },
          status: { not: BookingStatus.CANCELLED },
        },
        select: { id: true },
      });

      if (clash) {
        throw conflict(
          'The room has already been booked for that time period.',
        );
      }
    }

    try {
      return await this.prisma.booking.update({
        where: { id },
        data: {
          ...(dto.title && { title: dto.title }),
          ...(dto.startAt && { startAt: dto.startAt }),
          ...(dto.endAt && { endAt: dto.endAt }),
          ...(dto.status && { status: dto.status }),
        },
        include: { room: { select: { id: true, name: true, location: true, capacity: true } } },
      });
    } catch (error) {
      if (isOverlapError(error)) {
        throw conflict(
          'The room has already been booked for that time period.',
        );
      }
      throw error;
    }
  }

  /**
   * @description Cancel a booking by updating status to CANCELLED
   * @param id Booking ID
   * @param user User payload
   * @returns Cancelled booking
   */
  async cancel(id: string, user: JwtPayload): Promise<Booking> {
    // Find booking
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });
    if (!booking) throw new NotFoundException('Booking not found...');

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking has already been cancelled');
    }

    // Check if user is owner or admin
    const isOwner = booking.userId === user.id;
    // Check if user is admin
    const isAdmin = user.role === Role.ADMIN;
    // If user is not owner or admin, throw forbidden exception
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You do not have the right to cancel this booking',
      );
    }

    // Update status to CANCELLED
    return await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });
  }
}
