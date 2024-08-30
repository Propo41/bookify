import { OAuth2Client } from 'google-auth-library';
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CalenderService } from './calender.service';
import { AuthGuard } from '../auth/auth.guard';
import { _OAuth2Client } from '../auth/decorators';

@Controller()
export class CalenderController {
  constructor(private readonly calenderService: CalenderService) {}

  @UseGuards(AuthGuard)
  @Get('/rooms')
  async listRooms(@_OAuth2Client() client: OAuth2Client): Promise<any[]> {
    return this.calenderService.listRooms(client);
  }

  @UseGuards(AuthGuard)
  @Post('/room')
  async bookRoom(@_OAuth2Client() client: OAuth2Client): Promise<void> {
    const startTime = '2024-08-27T00:00:00+02:00';
    const endTime = '2024-09-27T23:59:59+02:00';
    const seats = 1;
    this.calenderService.createEvent(client, startTime, endTime, seats);
  }
}
