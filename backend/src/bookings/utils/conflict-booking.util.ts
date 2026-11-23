import { ConflictException } from '@nestjs/common';

export const conflict = (message: string) => new ConflictException(message);
