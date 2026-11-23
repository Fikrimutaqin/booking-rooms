// Core Nest and Other Core
import { PartialType } from '@nestjs/mapped-types';

// Import DTOs
import { CreateRoomDto } from './create-room.dto';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}
