import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryRoomDto } from './dto/query-room.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { startOfDayWib } from 'src/common/utils/time.util';
import { CreateRoomDto } from './dto/room.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
    constructor(private prisma: PrismaService) { }

    /**
     * 
     * @param query - filter and sort query
     * @param pagination - pagination query
     * @returns 
     */
    async findAll(query: QueryRoomDto, pagination: { page: number; limit: number; skip: number }) {
        const [data, total] = await Promise.all([
            this.prisma.room.findMany({
                where: query.minCapacity !== undefined ? { capacity: { gte: query.minCapacity } } : undefined,
                orderBy: query.order ? { name: query.order } : { createdAt: 'desc' },
                skip: pagination.skip,
                take: pagination.limit || 20,
            }),
            this.prisma.room.count({ where: query.minCapacity !== undefined ? { capacity: { gte: query.minCapacity } } : undefined }),
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
     * Get room availability
     * @param roomId - ID of the room
     * @param date - Date in YYYY-MM-DD format
     * @returns Promise<Room Availability>
     */
    async availability(roomId: string, date: string) {
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            select: { id: true }
        })

        if (!room) throw new NotFoundException('Room Not Found...')

        const dayStart = startOfDayWib(date); // Get start of day WIB
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000); // Get end of day WIB

        // Find bookings that overlap with the given date
        const bookings = await this.prisma.booking.findMany({
            where: {
                roomId: roomId,
                startAt: { lt: dayEnd }, // Booking must start before day end
                endAt: { gt: dayStart }, // Booking must end after day start
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
     * @param dto - Room data
     * @returns Promise<Room>
     * @param user - Current user
     */
    async create(@CurrentUser() user, dto: CreateRoomDto) {
        // validate user role
        if (user.role !== UserRole.ADMIN) throw new ForbiddenException('You are not authorized to create room');
        return await this.prisma.room.create({ data: dto });
    }

    /**
     * Update room
     * @param user - Current user
     * @param dto - Room data
     * @returns Promise<Room>
     */
    async update(@CurrentUser() user, dto: UpdateRoomDto) {
        // validate user role
        if (user.role !== UserRole.ADMIN) throw new ForbiddenException('You are not authorized to update room');
        const room = await this.prisma.room.findUnique({
            where: { id: dto.id },
            select: { id: true }
        })
        // check room exist
        if (!room) throw new NotFoundException('Room Not Found...');
        // update room
        return await this.prisma.room.update({ where: { id: dto.id }, data: dto });
    }
}
