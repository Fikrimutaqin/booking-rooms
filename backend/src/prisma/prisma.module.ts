// Core Nest and Other Core
import { Global, Module } from '@nestjs/common';

// Import Modules

// Import Controllers

// Import Services
import { PrismaService } from './prisma.service';

// Import Others (Common etc)

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
