import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('users')
  async getUsers() {
    return this.appService.getUsers();
  }

  @Post('users')
  async createUser(@Body() body: { email: string; name?: string }) {
    return this.appService.createUser(body);
  }

  @Get('rooms')
  async getRooms() {
    return this.appService.getRooms();
  }

  @Post('rooms')
  async createRoom(@Body() body: { name: string; capacity?: number; location?: string; description?: string }) {
    return this.appService.createRoom(body);
  }

  @Get('bookings')
  async getBookings() {
    return this.appService.getBookings();
  }
}
