import { OAuth2Client } from 'google-auth-library';
import { Body, Controller, Delete, Get, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { CalenderService } from './calender.service';
import { AuthGuard } from '../auth/auth.guard';
import { _OAuth2Client, _User } from '../auth/decorators';
import { OAuthInterceptor } from '../auth/oauth.interceptor';
import { ApiResponse, BookRoomDto, DeleteResponse, EventResponse, EventUpdateResponse } from '@bookify/shared';

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
  ): Promise<ApiResponse<EventResponse[]>> {
    return await this.calenderService.listRooms(client, domain, startTime, endTime, timeZone);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(OAuthInterceptor)
  @Post('/room')
  async bookRoom(
    @_OAuth2Client() client: OAuth2Client,
    @_User('domain') domain: string,
    @Body() bookRoomDto: BookRoomDto,
  ): Promise<ApiResponse<EventResponse>> {
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
  @Put('/room/id')
  async updateEventRoom(
    @_OAuth2Client() client: OAuth2Client,
    @_User('domain') domain: string,
    @Body('eventId') eventId: string,
    @Body('roomId') roomId?: string,
  ): Promise<ApiResponse<EventResponse>> {
    return await this.calenderService.updateEventRoom(client, domain, eventId, roomId);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(OAuthInterceptor)
  @Put('/room/duration')
  async updateEventDuration(
    @_OAuth2Client() client: OAuth2Client,
    @Body('eventId') eventId: string,
    @Body('roomId') roomId?: string,
    @Body('duration') duration?: number, // in mins
  ): Promise<ApiResponse<EventUpdateResponse>> {
    return await this.calenderService.updateEventDuration(client, eventId, roomId, duration);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(OAuthInterceptor)
  @Delete('/room')
  async deleteRoom(@_OAuth2Client() client: OAuth2Client, @Body('id') eventId: string): Promise<ApiResponse<DeleteResponse>> {
    return await this.calenderService.deleteEvent(client, eventId);
  }

  @UseGuards(AuthGuard)
  @Get('/floors')
  async listFloors(@_User('domain') domain: string): Promise<ApiResponse<string[]>> {
    return await this.calenderService.listFloors(domain);
  }
}
