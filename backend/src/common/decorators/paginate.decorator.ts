import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Decorator to extract pagination parameters from query string.
 * Default: page = 1, limit = 20
 */
export const Paginate = createParamDecorator(
  (defaultLimit = 20, ctx: ExecutionContext): PaginationParams => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const page = Math.max(1, parseInt(request.query.page as string, 10) || 1);
    const limit = Math.max(
      1,
      Math.min(
        100,
        parseInt(request.query.limit as string, 10) || defaultLimit,
      ),
    );
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  },
);
