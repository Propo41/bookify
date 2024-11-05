import { OAuth2Client } from 'google-auth-library';
import { Body, Controller, Delete, Get, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { CalenderService } from './calender.service';
import { AuthGuard } from '../auth/auth.guard';
import { _OAuth2Client, _User } from '../auth/decorators';
import { OAuthInterceptor } from '../auth/oauth.interceptor';
// prettier-ignore
import { ApiResponse, BookRoomDto, ListRoomsQueryDto, GetAvailableRoomsQueryDto, DeleteResponse, EventResponse, EventUpdateResponse, IConferenceRoom } from '@quickmeet/shared';
import { createResponse } from 'src/helpers/payload.util';

@Controller()
export class CalenderController {
  constructor(private readonly calenderService: CalenderService) {}

  @UseGuards(AuthGuard)
  @UseInterceptors(OAuthInterceptor)
  @Get('/rooms')
  async listRooms(
    @_OAuth2Client() client: OAuth2Client,
    @_User('domain') domain: string,
    @Query() listRoomsQueryDto: ListRoomsQueryDto,
  ): Promise<ApiResponse<EventResponse[]>> {
    const { startTime, endTime, timeZone } = listRoomsQueryDto;
    return await this.calenderService.listRooms(client, domain, startTime, endTime, timeZone);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(OAuthInterceptor)
  @Get('/available-rooms')
  async getAvailableRooms(
    @_OAuth2Client() client: OAuth2Client,
    @_User('domain') domain: string,
    @Query() getAvailableRoomsQueryDto: GetAvailableRoomsQueryDto,
  ): Promise<ApiResponse<IConferenceRoom[]>> {
    const { startTime, duration, timeZone, seats, floor, eventId } = getAvailableRoomsQueryDto;

    const startDate = new Date(startTime);
    startDate.setMinutes(startDate.getMinutes() + Number(duration));
    const endTime = startDate.toISOString();

    const rooms = await this.calenderService.getAvailableRooms(client, domain, startTime, endTime, timeZone, seats, floor, eventId);
    return createResponse(rooms);
  }

  @UseGuards(AuthGuard)
  @Get('/highest-seat-count')
  async getMaxSeatCapacity(@_User('domain') domain: string): Promise<ApiResponse<number>> {
    return await this.calenderService.getHighestSeatCapacity(domain);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(OAuthInterceptor)
  @Post('/room')
  async bookRoom(
    @_OAuth2Client() client: OAuth2Client,
    @_User('domain') domain: string,
    @Body() bookRoomDto: BookRoomDto,
  ): Promise<ApiResponse<EventResponse>> {
    const { startTime, duration, createConference, title, attendees, room } = bookRoomDto;

    // end time
    const startDate = new Date(startTime);
    startDate.setMinutes(startDate.getMinutes() + Number(duration));
    const endTime = startDate.toISOString();

    const event = await this.calenderService.createEvent(client, domain, startTime, endTime, createConference, title, attendees, room);
    return event;
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(OAuthInterceptor)
  @Put('/room')
  async updateEvent(
    @_OAuth2Client() client: OAuth2Client,
    @_User('domain') domain: string,
    @Body('eventId') eventId: string,
    @Body() bookRoomDto: BookRoomDto,
  ): Promise<ApiResponse<EventUpdateResponse>> {
    const { startTime, duration, createConference, title, attendees, room } = bookRoomDto;

    // end time
    const startDate = new Date(startTime);
    startDate.setMinutes(startDate.getMinutes() + Number(duration));
    const endTime = startDate.toISOString();

    return await this.calenderService.updateEvent(client, domain, eventId, startTime, endTime, createConference, title, attendees, room);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(OAuthInterceptor)
  @Delete('/room')
  async deleteRoom(@_OAuth2Client() client: OAuth2Client, @Query('id') eventId: string): Promise<ApiResponse<DeleteResponse>> {
    return await this.calenderService.deleteEvent(client, eventId);
  }

  @UseGuards(AuthGuard)
  @Get('/floors')
  async listFloors(@_User('domain') domain: string): Promise<ApiResponse<string[]>> {
    return await this.calenderService.listFloors(domain);
  }
}
