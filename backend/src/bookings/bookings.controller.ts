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

// Import Services
import { BookingsService } from './bookings.service';

// Import DTOs
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

// Import Interfaces and Types
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

// Import Others (Common etc)
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import {
  Paginate,
  PaginationParams,
} from '../common/decorators/paginate.decorator';

@Controller({
  path: 'bookings',
  version: '1',
})
export class BookingsController {
  // Constructor for booking services
  constructor(private readonly bookingsService: BookingsService) {}

  /**
   * Controller for creating booking
   * @param user JWT payload
   * @param dto Create booking DTO
   * @returns Created booking
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Booking successfully created')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.id, dto);
  }

  /**
   * Controller for finding booking of current user
   * @param user JWT payload
   * @param query Query filter parameters
   * @param pagination Pagination parameters
   * @returns List of booking of current user
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Successfully retrieved list of bookings')
  findBookingMe(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryBookingDto,
    @Paginate() pagination: PaginationParams,
  ) {
    return this.bookingsService.findBookingMe(user.id, query, pagination);
  }

  /**
   * Controller for finding booking by ID
   * @param id Booking ID
   * @param user JWT payload
   * @returns Booking details
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Successfully retrieved booking')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.bookingsService.findOne(id, user);
  }

  /**
   * Controller for updating / rescheduling booking
   * @param id Booking ID
   * @param user JWT payload
   * @param dto Update booking DTO
   * @returns Updated booking
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Booking successfully updated')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, user, dto);
  }

  /**
   * Controller for cancelling booking
   * @param id Booking ID
   * @param user JWT payload
   * @returns Message of booking cancellation
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Booking successfully cancelled')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.bookingsService.cancel(id, user);
  }
}
