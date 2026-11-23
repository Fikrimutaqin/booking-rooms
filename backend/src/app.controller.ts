// Core Nest and Other Core
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  VERSION_NEUTRAL,
} from '@nestjs/common';

// Import Services
import { AppService } from './app.service';

// Import Others (Common etc)
import { Public } from '@common/decorators/public.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';

@Controller({
  path: 'health',
  version: ['1', VERSION_NEUTRAL],
})
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint
   * Accessible publicly via GET /v1/health or GET /health
   */
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Service is healthy')
  healthCheck() {
    return this.appService.getHealth();
  }
}
