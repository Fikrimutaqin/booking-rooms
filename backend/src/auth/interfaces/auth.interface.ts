import { Role } from '@prisma/client';

export interface UserSignToken {
  id: string;
  email: string;
  role: Role;
  createdAt?: Date;
  updatedAt?: Date;
  refreshToken?: string;
}
