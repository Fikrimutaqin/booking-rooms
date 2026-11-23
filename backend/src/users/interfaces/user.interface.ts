import { Role } from '@prisma/client';

/**
 * Public safe user representation (excludes password and refreshToken)
 */
export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User interface for internal domain / utilities (e.g. token generation)
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: Date;
  updatedAt?: Date;
}
