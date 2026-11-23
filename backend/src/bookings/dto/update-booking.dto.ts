// Core Nest and Other Core
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// Import Others (Common etc)
import {
  HasValidDuration,
  IsAfterStart,
  IsNotInPast,
  IsWithinWorkingHours,
} from '../validators/booking-time.validators';
import { toDate } from '@common/utils/to-date.util';

export class UpdateBookingDto {
  @IsOptional()
  @Transform(toDate)
  @IsDate({ message: 'startAt must be a valid ISO date' })
  @IsNotInPast()
  startAt?: Date;

  @IsOptional()
  @Transform(toDate)
  @IsDate({ message: 'endAt must be a valid ISO date' })
  @IsAfterStart()
  @HasValidDuration()
  @IsWithinWorkingHours()
  endAt?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

