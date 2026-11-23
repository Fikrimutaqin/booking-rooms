import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { Paginate, PaginationParams } from 'src/common/decorators/paginate.decorator';

@Controller({
    path: 'bookings',
    version: '1'
})
export class BookingsController {
    // Constructor for booking services
    constructor(private readonly bookingsService: BookingsService) { }

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
     * @returns List of booking of current user
     */
    @Get('me')
    @ResponseMessage('List of booking successfully retrieved')
    findBookingMe(
        @CurrentUser() user: JwtPayload,
        @Paginate() pagination: PaginationParams,
    ) {
        return this.bookingsService.findBookingMe(user.id, pagination);
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
