// Core Nest and Other Core
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

// Import Others (Common etc)
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Contructor for reflector
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Validate request if it is public or not
   * @param context
   * @returns Boolean
   */
  canActivate(context: ExecutionContext) {
    // isPublic it's mean handler or controller not require authentication
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // handle public routes
    if (isPublic) return true;

    // handle protected routes
    return super.canActivate(context);
  }
}
