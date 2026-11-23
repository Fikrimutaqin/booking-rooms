// Core Nest and Other Core
import { OmitType, PartialType } from '@nestjs/mapped-types';

// Import DTOs
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email'] as const),
) {}
