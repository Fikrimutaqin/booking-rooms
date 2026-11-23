// Core Nest and Other Core
import { Module } from '@nestjs/common';

// Import Modules

// Import Controllers
import { RoomsController } from './rooms.controller';

// Import Services
import { RoomsService } from './rooms.service';

// Import Others (Common etc)

@Module({
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
