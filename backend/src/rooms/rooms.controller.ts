// Core Nest and Other Core
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';

// Import Services
import { RoomsService } from './rooms.service';

// Import DTOs
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { QueryRoomDto } from './dto/query-room.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';

// Import Interfaces and Types

// Import Others (Common etc)
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { Public } from '@common/decorators/public.decorator';
import {
  Paginate,
  PaginationParams,
} from '@common/decorators/paginate.decorator';

@Controller({
  path: 'rooms',
  version: '1',
})
export class RoomsController {
  constructor(private readonly rooms: RoomsService) {}

  /**
   * Get all rooms with pagination and filters
   * @param query - query parameters
   * @param pagination - pagination parameters
   * @returns Paginated list of rooms
   */
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Successfully retrieved list of rooms')
  findAll(
    @Query() query: QueryRoomDto,
    @Paginate() pagination: PaginationParams,
  ) {
    return this.rooms.findAll(query, pagination);
  }

  /**
   * Get room availability
   * @param id - Room ID
   * @param query - Availability query
   * @returns Room availability
   */
  @Public()
  @Get(':id/availability')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Successfully retrieved room availability')
  availability(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: AvailabilityQueryDto,
  ) {
    return this.rooms.availability(id, query.date);
  }

  /**
   * Get room by ID
   * @param id - Room ID
   * @returns Room details
   */
  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Successfully retrieved room')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rooms.findOne(id);
  }

  /**
   * Create room (Admin only)
   * @param dto - Room data
   * @returns Created room
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Successfully created room')
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateRoomDto) {
    return this.rooms.create(dto);
  }

  /**
   * Update room (Admin only)
   * @param id - Room ID
   * @param dto - Room data
   * @returns Updated room
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Successfully updated room')
  @Roles(Role.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoomDto) {
    return this.rooms.update(id, dto);
  }

  /**
   * Delete room (Admin only)
   * @param id - Room ID
   * @returns Deleted room
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Successfully deleted room')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rooms.remove(id);
  }
}
