// Core Nest and Other Core
import { PartialType, OmitType } from '@nestjs/mapped-types';

// Import DTOs
import { CreateBookingDto } from './create-booking.dto';

export class UpdateBookingDto extends PartialType(
  OmitType(CreateBookingDto, ['roomId'] as const),
) {}
