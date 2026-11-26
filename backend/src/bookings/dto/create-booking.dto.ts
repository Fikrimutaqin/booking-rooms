// Core Nest and Other Core
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// Import Others (Common etc)
import {
  HasValidDuration,
  IsAfterStart,
  IsNotInPast,
  IsWithinWorkingHours,
} from '../validators/booking-time.validators';
import { toDate } from '../../common/utils/to-date.util';

export enum RecurrenceFrequency {
  WEEKLY = 'WEEKLY',
}

export enum ConflictStrategy {
  ALL_OR_NOTHING = 'ALL_OR_NOTHING',
  SKIP_CONFLICTS = 'SKIP_CONFLICTS',
}

export class CreateBookingDto {
  /**
   * @description Room ID
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @IsUUID('all', { message: 'roomId must be a valid UUID' })
  roomId: string;

  /**
   * @description Start date
   * @example '2022-01-01T12:00:00Z'
   */
  @Transform(toDate)
  @IsDate({ message: 'startAt must be a valid ISO date' })
  @IsNotInPast()
  startAt: Date;

  /**
   * @description End date
   * @example '2022-01-01T12:00:00Z'
   */
  @Transform(toDate)
  @IsDate({ message: 'endAt must be a valid ISO date' })
  @IsAfterStart()
  @HasValidDuration()
  @IsWithinWorkingHours()
  endAt: Date;

  /**
   * @description Title
   * @example 'Meeting'
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  /**
   * @description Whether this is a recurring booking
   */
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  /**
   * @description Whether this booking spans across multiple dates
   */
  @IsOptional()
  @IsBoolean()
  isMultiDate?: boolean;

  /**
   * @description Range end date for multi-date bookings
   */
  @IsOptional()
  @Transform(toDate)
  @IsDate({ message: 'endDate must be a valid ISO date' })
  endDate?: Date;

  /**
   * @description Recurrence pattern frequency (currently WEEKLY)
   */
  @IsOptional()
  @IsEnum(RecurrenceFrequency)
  recurrenceFrequency?: RecurrenceFrequency;

  /**
   * @description Number of consecutive weeks to book (2-12 weeks)
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2)
  @Max(12)
  recurrenceWeeks?: number;

  /**
   * @description Conflict handling strategy (ALL_OR_NOTHING or SKIP_CONFLICTS)
   */
  @IsOptional()
  @IsEnum(ConflictStrategy)
  conflictStrategy?: ConflictStrategy;
}
