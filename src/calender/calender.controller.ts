import { OAuth2Client } from 'google-auth-library';
import { Body, Controller, Delete, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { CalenderService } from './calender.service';
import { AuthGuard } from '../auth/auth.guard';
import { _OAuth2Client } from '../auth/decorators';
import { EventResponse, RoomResponse } from './dto';
import { DeleteResponse } from './dto/delete.response';

@Controller()
export class CalenderController {
  constructor(private readonly calenderService: CalenderService) {}

  @UseGuards(AuthGuard)
  @Get('/rooms')
  async listRooms(@_OAuth2Client() client: OAuth2Client): Promise<RoomResponse[]> {
    return await this.calenderService.listRooms(client);
  }

  @UseGuards(AuthGuard)
  @Post('/room')
  async bookRoom(
    @_OAuth2Client() client: OAuth2Client,
    @Body('startTime') startTime: string,
    @Body('duration') durationInMins: number,
    @Body('seats') seats: number,
    @Body('createConference') createConference?: boolean,
    @Body('title') title?: string,
    @Body('floor') floor?: number,
    @Body('attendees') attendees?: string[],
  ): Promise<EventResponse | null> {
    // end time
    const startDate = new Date(startTime);
    startDate.setMinutes(startDate.getMinutes() + durationInMins);
    const endTime = startDate.toISOString();

    const event = await this.calenderService.createEvent(client, startTime, endTime, seats, createConference, title, floor, attendees);
    return event;
  }

  @UseGuards(AuthGuard)
  @Patch('/room')
  async updateRoom(@_OAuth2Client() client: OAuth2Client): Promise<EventResponse | null> {
    const eventId = '4r4bddp2bfkgg1ric1lh84rit8';
    const end = '2024-08-31T10:30:00+06:00';
    return await this.calenderService.updateEvent(client, eventId, end);
  }

  @UseGuards(AuthGuard)
  @Delete('/room')
  async deleteRoom(@_OAuth2Client() client: OAuth2Client, @Body('id') eventId: string): Promise<DeleteResponse> {
    return await this.calenderService.deleteEvent(client, eventId);
  }
}
