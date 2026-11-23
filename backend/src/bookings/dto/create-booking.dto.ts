import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import {
    HasValidDuration,
    IsAfterStart,
    IsNotInPast,
    IsWithinWorkingHours,
} from '../validators/booking-time.validators';
import { toDate } from '../../common/utils/to-date.util';

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
}