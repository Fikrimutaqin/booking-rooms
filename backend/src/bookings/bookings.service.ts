import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { BookingStatus, Role } from '@prisma/client';
import { isOverlapError } from './utils/overlap-booking.util';
import { conflict } from './utils/conflict-booking.util';
import { PaginationParams } from 'src/common/decorators/paginate.decorator';

@Injectable()
export class BookingsService {
    // Constructor for prisma service
    constructor(private prisma: PrismaService) { }

    /**
     * @description Create a new booking
     * @param userId 
     * @param dto 
     * @returns 
     */
    async create(userId: string, dto: CreateBookingDto) {
        // Find room is exist
        const room = await this.prisma.room.findUnique({
            where: { id: dto.roomId }
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
            select: { id: true }
        });

        if (clash) throw conflict('The room has already been booked for that time period.');

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
                include: { room: { select: { id: true, name: true } } }
            })
        } catch (error) {
            // If overlap error, throw conflict
            if (isOverlapError(error)) throw conflict('The room has already been booked for that time period.');
            throw error;
        }
    }

    /**
     * @description Find all bookings by user with pagination
     * @param userId User ID
     * @param pagination Pagination parameters (page, limit, skip)
     * @returns Paginated result of bookings
     */
    async findBookingMe(userId: string, pagination?: PaginationParams) {
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 20;
        const skip = pagination?.skip ?? (page - 1) * limit;

        const where = { userId };

        const [data, total] = await Promise.all([
            this.prisma.booking.findMany({
                where,
                include: { room: { select: { id: true, name: true, location: true } } },
                orderBy: { startAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.booking.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
            },
        };
    }

    /**
     * @description Cancel a booking by updating status to CANCELLED
     * @param id Booking ID
     * @param user User payload
     */
    async cancel(id: string, user: JwtPayload) {
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
            throw new ForbiddenException('You do not have the right to cancel this booking');
        }

        // Update status to CANCELLED
        return await this.prisma.booking.update({
            where: { id },
            data: { status: BookingStatus.CANCELLED },
        });
    }
}
