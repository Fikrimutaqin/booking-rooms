// Core Prisma and NestJS
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Defined Logger for PrismaService and have any log from database connection
   */
  private readonly logger = new Logger(PrismaService.name);

  /**
   * Implement onModuleInit to connect to the database when the module is initialized
   */
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma connected successfully to PostgreSQL Database');
    } catch (error) {
      this.logger.warn(
        'Failed to auto-connect to database via Prisma on startup. Ensure DATABASE_URL is valid.',
        error,
      );
    }
  }

  /**
   * Implement onModuleDestroy to disconnect from the database when the module is destroyed
   */
  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from PostgreSQL Database');
  }
}
