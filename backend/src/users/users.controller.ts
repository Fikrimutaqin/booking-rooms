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
import { UsersService } from './users.service';

// Import DTOs
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Import Interfaces and Types

// Import Others (Common etc)
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import {
  Paginate,
  PaginationParams,
} from '@common/decorators/paginate.decorator';

@Controller({
  path: 'users',
  version: '1',
})
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a new user (Admin only)
   * @param dto Create user DTO
   * @returns Created user
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('User successfully created')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  /**
   * Get all users (Admin only)
   * @param query Query user filter
   * @param pagination Pagination parameters
   * @returns List of users
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Successfully retrieved list of users')
  findAll(
    @Query() query: QueryUserDto,
    @Paginate() pagination: PaginationParams,
  ) {
    return this.usersService.findAll(query, pagination);
  }

  /**
   * Get user by ID (Admin only)
   * @param id User ID
   * @returns User details
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Successfully retrieved user')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Update user by ID (Admin only)
   * @param id User ID
   * @param dto Update user DTO
   * @returns Updated user
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User successfully updated')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  /**
   * Delete user by ID (Admin only)
   * @param id User ID
   * @returns Deleted user
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Successfully deleted user')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
