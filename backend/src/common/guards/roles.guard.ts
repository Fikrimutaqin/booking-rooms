import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  // Contructor for reflector
  constructor(private reflector: Reflector) { }

  /**
   * Can Active it's mean user active can access by roles
   * @param context 
   * @returns boolean
   */
  canActivate(context: ExecutionContext): boolean {
    // Get all roles
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Validation if not required return true
    if (!required) return true;

    // Get authenticated user
    const { user } = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();
    return required.includes(user.role);
  }
}