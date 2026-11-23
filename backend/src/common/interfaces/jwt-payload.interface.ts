import { Role } from '@prisma/client';

export interface JwtPayload {
    id: string;
    email: string;
    name: string;
    role: Role;
    refreshToken?: string;
}