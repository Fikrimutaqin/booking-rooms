import { IsEnum, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class QueryBookingDto {
  @IsOptional()
  @IsEnum(BookingStatus, { message: 'Status must be CONFIRMED or CANCELLED' })
  status?: BookingStatus;

  @IsOptional()
  @IsUUID('all', { message: 'roomId must be a valid UUID' })
  roomId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'from must be a valid ISO date string' })
  from?: string;

  @IsOptional()
  @IsDateString({}, { message: 'to must be a valid ISO date string' })
  to?: string;
}
