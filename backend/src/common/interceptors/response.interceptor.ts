// Core Nest and Other Core
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { map, Observable } from 'rxjs';

// Import Interfaces and Types
import { ApiResponse } from '@common/interfaces/api-response.interface';

// Import Others (Common etc)
import { RESPONSE_MESSAGE_KEY } from '@common/decorators/response-message.decorator';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<unknown>
> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<unknown>> {
    const response = context.switchToHttp().getResponse<Response>();
    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'Success';

    return next.handle().pipe(
      map((result: any) => {
        const statusCode = response.statusCode;

        // Hasil pagination: { data, meta }
        if (
          result &&
          typeof result === 'object' &&
          'data' in result &&
          'meta' in result
        ) {
          return { statusCode, message, data: result.data, meta: result.meta };
        }

        return { statusCode, message, data: result ?? null };
      }),
    );
  }
}
