import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHealth() {
    return {
      status: 'ok',
      service: 'Room Bookings NestJS Backend',
      timestamp: new Date().toISOString(),
      prismaReady: true,
    };
  }

  // --- Users ---
  async getUsers() {
    try {
      return await this.prisma.user.findMany({
        include: {
          bookings: {
            include: { room: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error: any) {
      return {
        warning: 'Belum terhubung ke database serverless atau belum menjalankan migrasi Prisma.',
        error: error.message,
        users: [],
      };
    }
  }

  async createUser(data: { email: string; name?: string }) {
    return this.prisma.user.create({ data });
  }

  // --- Rooms ---
  async getRooms() {
    try {
      return await this.prisma.room.findMany({
        orderBy: { name: 'asc' },
      });
    } catch (error: any) {
      return [];
    }
  }

  async createRoom(data: { name: string; capacity?: number; location?: string; description?: string }) {
    return this.prisma.room.create({
      data: {
        name: data.name,
        capacity: data.capacity || 4,
        location: data.location,
        description: data.description,
      },
    });
  }

  // --- Bookings ---
  async getBookings() {
    try {
      return await this.prisma.booking.findMany({
        include: {
          user: true,
          room: true,
        },
        orderBy: { startTime: 'desc' },
      });
    } catch (error: any) {
      return [];
    }
  }
}
