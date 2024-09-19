import { OAuth2Client } from 'google-auth-library';
import { Body, Controller, Delete, Get, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { CalenderService } from './calender.service';
import { AuthGuard } from '../auth/auth.guard';
import { _OAuth2Client, _User } from '../auth/decorators';
import { EventResponse, RoomResponse } from './dto';
import { DeleteResponse } from './dto/delete.response';
import { BookRoomDto } from './dto/book-room.dto';
import { OAuthInterceptor } from 'src/auth/oauth.interceptor';

@Controller()
export class CalenderController {
  constructor(private readonly calenderService: CalenderService) {}

  @UseGuards(AuthGuard)
  @UseInterceptors(OAuthInterceptor)
  @Get('/rooms')
  async listRooms(
    @_OAuth2Client() client: OAuth2Client,
    @_User('domain') domain: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('timeZone') timeZone: string,
  ): Promise<RoomResponse[]> {
    return await this.calenderService.listRooms(client, domain, startTime, endTime, timeZone);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(OAuthInterceptor)
  @Post('/room')
  async bookRoom(@_OAuth2Client() client: OAuth2Client, @_User('domain') domain: string, @Body() bookRoomDto: BookRoomDto): Promise<EventResponse | null> {
    const { startTime, duration, seats, timeZone, createConference, title, floor, attendees } = bookRoomDto;

    // end time
    const startDate = new Date(startTime);
    startDate.setMinutes(startDate.getMinutes() + duration);
    const endTime = startDate.toISOString();

    const event = await this.calenderService.createEvent(client, domain, startTime, endTime, seats, timeZone, createConference, title, floor, attendees);
    return event;
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(OAuthInterceptor)
  @Put('/room')
  async updateRoom(
    @_OAuth2Client() client: OAuth2Client,
    @_User('domain') domain: string,
    @Body('eventId') eventId: string,
    @Body('roomId') roomId?: string,
    @Body('duration') duration?: number,
  ): Promise<EventResponse | null> {
    return await this.calenderService.updateEvent(client, domain, eventId, roomId, duration);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(OAuthInterceptor)
  @Delete('/room')
  async deleteRoom(@_OAuth2Client() client: OAuth2Client, @Body('id') eventId: string): Promise<DeleteResponse> {
    return await this.calenderService.deleteEvent(client, eventId);
  }

  @UseGuards(AuthGuard)
  @Get('/floors')
  async listFloors(@_User('domain') domain: string): Promise<string[]> {
    return await this.calenderService.listFloors(domain);
  }
}
