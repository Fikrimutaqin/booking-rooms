// Core Nest and Other Core
import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, Prisma, Room } from '@prisma/client';

// Import Services
import { PrismaService } from '../prisma/prisma.service';

// Import DTOs
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { QueryRoomDto } from './dto/query-room.dto';

// Import Interfaces and Types
import { RoomAvailability } from './interfaces/room-availability.interface';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

// Import Others (Common etc)
import { startOfDayWib } from '../common/utils/time.util';
import { PaginationParams } from '../common/decorators/paginate.decorator';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find all rooms with query filters and pagination
   * @param query filter and sort query
   * @param pagination pagination query
   * @returns Paginated list of rooms
   */
  async findAll(
    query: QueryRoomDto,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Room>> {
    const where: Prisma.RoomWhereInput = {
      ...(query?.minCapacity !== undefined && {
        capacity: { gte: query.minCapacity },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.room.findMany({
        where,
        orderBy: query?.order ? { name: query.order } : { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit || 20,
      }),
      this.prisma.room.count({ where }),
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
   * Get room by ID
   * @param id Room ID
   * @returns Room details
   */
  async findOne(id: string): Promise<Room> {
    const room = await this.prisma.room.findUnique({
      where: { id },
    });

    if (!room) throw new NotFoundException('Room not found...');
    return room;
  }

  /**
   * Get room availability
   * @param roomId ID of the room
   * @param date Date in YYYY-MM-DD format
   * @returns Room availability and bookings
   */
  async availability(roomId: string, date: string): Promise<RoomAvailability> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true },
    });

    if (!room) throw new NotFoundException('Room not found...');

    const dayStart = startOfDayWib(date); // Get start of day WIB
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000); // Get end of day WIB

    // Find bookings that overlap with the given date
    const bookings = await this.prisma.booking.findMany({
      where: {
        roomId: roomId,
        startAt: { lt: dayEnd }, // Booking must start before day end
        endAt: { gt: dayStart }, // Booking must end after day start
        status: { not: BookingStatus.CANCELLED },
      },
      select: { id: true, title: true, startAt: true, endAt: true },
      orderBy: { startAt: 'desc' },
    });

    return {
      room,
      date: date,
      workingHours: { start: '08:00', end: '18:00', timezone: 'Asia/Jakarta' },
      bookings,
    };
  }

  /**
   * Create new room
   * @param dto Room data
   * @returns Created room
   */
  async create(dto: CreateRoomDto): Promise<Room> {
    return await this.prisma.room.create({ data: dto });
  }

  /**
   * Update room
   * @param id Room ID
   * @param dto Room data
   * @returns Updated room
   */
  async update(id: string, dto: UpdateRoomDto): Promise<Room> {
    const room = await this.prisma.room.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!room) throw new NotFoundException('Room not found...');

    return await this.prisma.room.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Remove room
   * @param id Room ID
   * @returns Deleted room
   */
  async remove(id: string): Promise<Room> {
    const room = await this.prisma.room.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!room) throw new NotFoundException('Room not found...');

    return await this.prisma.room.delete({
      where: { id },
    });
  }
}
