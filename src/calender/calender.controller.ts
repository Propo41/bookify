import { OAuth2Client } from 'google-auth-library';
import { Body, Controller, Delete, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CalenderService } from './calender.service';
import { AuthGuard } from '../auth/auth.guard';
import { _OAuth2Client, _User } from '../auth/decorators';
import { EventResponse, RoomResponse } from './dto';
import { DeleteResponse } from './dto/delete.response';

@Controller()
export class CalenderController {
  constructor(private readonly calenderService: CalenderService) {}

  @UseGuards(AuthGuard)
  @Get('/rooms')
  async listRooms(
    @_OAuth2Client() client: OAuth2Client,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('timeZone') timeZone: string,
  ): Promise<RoomResponse[]> {
    return await this.calenderService.listRooms(client, startTime, endTime, timeZone);
  }

  @UseGuards(AuthGuard)
  @Post('/room')
  async bookRoom(
    @_OAuth2Client() client: OAuth2Client,
    @_User('domain') domain: string,
    @Body('startTime') startTime: string, // A combined date-time value (formatted according to RFC3339A). Time zone offset is required
    @Body('duration') durationInMins: number,
    @Body('seats') seats: number,
    @Body('timeZone') timeZone: string,
    @Body('createConference') createConference?: boolean,
    @Body('title') title?: string,
    @Body('floor') floor?: string,
    @Body('attendees') attendees?: string[],
  ): Promise<EventResponse | null> {
    // end time
    const startDate = new Date(startTime);
    startDate.setMinutes(startDate.getMinutes() + durationInMins);
    const endTime = startDate.toISOString();

    const event = await this.calenderService.createEvent(client, domain, startTime, endTime, seats, timeZone, createConference, title, floor, attendees);
    return event;
  }

  @UseGuards(AuthGuard)
  @Put('/room')
  async updateRoom(
    @_OAuth2Client() client: OAuth2Client,
    @_User('domain') domain: string,
    @Body('eventId') eventId: string,
    @Body('roomId') roomId: string,
  ): Promise<EventResponse | null> {
    return await this.calenderService.updateEvent(client, domain, eventId, roomId);
  }

  @UseGuards(AuthGuard)
  @Delete('/room')
  async deleteRoom(@_OAuth2Client() client: OAuth2Client, @Body('id') eventId: string): Promise<DeleteResponse> {
    return await this.calenderService.deleteEvent(client, eventId);
  }
}
