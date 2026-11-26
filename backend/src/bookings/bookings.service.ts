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
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

// Import Interfaces and Types
import {
  BookingDetail,
  BookingWithRoom,
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
   * @description Create a new booking
   * @param userId User ID
   * @param dto Create booking DTO
   * @returns Created booking with room summary
   */
  async create(
    userId: string,
    dto: CreateBookingDto,
  ): Promise<BookingWithRoom> {
    // Find room is exist
    const room = await this.prisma.room.findUnique({
      where: { id: dto.roomId },
    });

    if (!room) throw new NotFoundException('Room not found...');

    // Check if room is clashing with another active booking
    const clash = await this.prisma.booking.findFirst({
      where: {
        roomId: dto.roomId,
        startAt: { lt: dto.endAt },
        endAt: { gt: dto.startAt },
        status: { not: BookingStatus.CANCELLED },
      },
      select: { id: true },
    });

    if (clash)
      throw conflict('The room has already been booked for that time period.');

    // Try to create booking
    try {
      return await this.prisma.booking.create({
        data: {
          roomId: dto.roomId,
          userId,
          title: dto.title,
          startAt: dto.startAt,
          endAt: dto.endAt,
        },
        include: { room: { select: { id: true, name: true, location: true } } },
      });
    } catch (error) {
      // If overlap error, throw conflict
      if (isOverlapError(error))
        throw conflict(
          'The room has already been booked for that time period.',
        );
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
        include: { room: { select: { id: true, name: true, location: true } } },
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
          room: { select: { id: true, name: true, location: true } },
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
        room: { select: { id: true, name: true, location: true } },
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
        },
        include: { room: { select: { id: true, name: true, location: true } } },
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
