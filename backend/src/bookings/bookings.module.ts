// Core Nest and Other Core
import { Module } from '@nestjs/common';

// Import Modules

// Import Controllers
import { BookingsController } from './bookings.controller';

// Import Services
import { BookingsService } from './bookings.service';

// Import Others (Common etc)

@Module({
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
