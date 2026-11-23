// Core Nest and Other Core
import { Injectable } from '@nestjs/common';

// Import Services
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check application health status and database connectivity
   * @returns Health status object
   */
  async getHealth() {
    let database = 'connected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'disconnected';
    }

    return {
      status: 'ok',
      database,
      timestamp: new Date().toISOString(),
      uptime: `${process.uptime().toFixed(1)}s`,
    };
  }
}
