// Core Nest and Other Core
import { Module } from '@nestjs/common';

// Import Modules

// Import Controllers
import { UsersController } from './users.controller';

// Import Services
import { UsersService } from './users.service';

// Import Others (Common etc)

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
