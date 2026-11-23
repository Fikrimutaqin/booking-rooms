import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { QueryRoomDto } from './dto/query-room.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { CreateRoomDto } from './dto/room.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Paginate, PaginationParams } from 'src/common/decorators/paginate.decorator';

@Controller({
    path: 'rooms',
    version: '1'
})
export class RoomsController {
    constructor(private readonly rooms: RoomsService) { }

    /**
     * 
     * @param query - query parameters
     * @param pagination - pagination parameters
     * @returns 
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
     * @returns Promise<RoomAvailability>
     */
    @Public()
    @Get(':id/availability')
    @ResponseMessage('Successfully retrieved room availability')
    availability(
        @Param('id', ParseUUIDPipe) id: string,
        @Query() query: AvailabilityQueryDto,
    ) {
        return this.rooms.availability(id, query.date);
    }

    /**
     * Create room
     * @param user - Current user
     * @param dto - Room data
     * @returns Promise<Room>
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ResponseMessage('Successfully created room')
    @Roles(UserRole.ADMIN)
    create(@CurrentUser() user, @Body() dto: CreateRoomDto) {
        return this.rooms.create(user, dto);
    }

    /**
     * Update room
     * @param user - Current user
     * @param dto - Room data
     * @returns Promise<Room>
     */
    @Patch()
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Successfully updated room')
    @Roles(UserRole.ADMIN)
    update(@CurrentUser() user, @Body() dto: UpdateRoomDto) {
        return this.rooms.update(user, dto);
    }

}
