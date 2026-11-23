import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

// Variable fo Role
export const ROLES_KEY = 'roles';
// Decorator to set roles
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);