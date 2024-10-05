import { OAuth2Client } from 'google-auth-library';
import { Body, Controller, Delete, Get, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { CalenderService } from './calender.service';
import { AuthGuard } from '../auth/auth.guard';
import { _OAuth2Client, _User } from '../auth/decorators';
import { OAuthInterceptor } from '../auth/oauth.interceptor';
import { ApiResponse, BookRoomDto, DeleteResponse, EventResponse, EventUpdateResponse, IConferenceRoom } from '@bookify/shared';
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
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('timeZone') timeZone: string,
  ): Promise<ApiResponse<EventResponse[]>> {
    return await this.calenderService.listRooms(client, domain, startTime, endTime, timeZone);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(OAuthInterceptor)
  @Get('/available-rooms')
  async getAvailableRooms(
    @_OAuth2Client() client: OAuth2Client,
    @_User('domain') domain: string,
    @Query('startTime') startTime: string,
    @Query('duration') duration: number,
    @Query('timeZone') timeZone: string,
    @Query('seats') seats: number,
    @Query('floor') floor: string,
  ): Promise<ApiResponse<IConferenceRoom[]>> {
    const startDate = new Date(startTime);
    startDate.setMinutes(startDate.getMinutes() + duration);
    const endTime = startDate.toISOString();

    const rooms = await this.calenderService.getAvailableRooms(client, domain, startTime, endTime, seats, timeZone, floor);
    return createResponse(rooms);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(OAuthInterceptor)
  @Get('/highest-seat-count')
  async getMaxSeatCapacity(
    @_OAuth2Client() client: OAuth2Client,
    @_User('domain') domain: string,
    @Query('startTime') startTime: string,
    @Query('duration') duration: number,
    @Query('timeZone') timeZone: string,
    @Query('seats') seats: number,
    @Query('floor') floor: string,
  ): Promise<ApiResponse<IConferenceRoom[]>> {
    const startDate = new Date(startTime);
    startDate.setMinutes(startDate.getMinutes() + duration);
    const endTime = startDate.toISOString();

    const rooms = await this.calenderService.getAvailableRooms(client, domain, startTime, endTime, seats, timeZone, floor);
    return createResponse(rooms);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(OAuthInterceptor)
  @Post('/room')
  async bookRoom(
    @_OAuth2Client() client: OAuth2Client,
    @_User('domain') domain: string,
    @Body() bookRoomDto: BookRoomDto,
  ): Promise<ApiResponse<EventResponse>> {
    const { startTime, duration, seats, timeZone, createConference, title, floor, attendees, room } = bookRoomDto;

    // end time
    const startDate = new Date(startTime);
    startDate.setMinutes(startDate.getMinutes() + duration);
    const endTime = startDate.toISOString();

    const event = await this.calenderService.createEvent(client, domain, startTime, endTime, createConference, title, attendees, room);
    return event;
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
  async deleteRoom(@_OAuth2Client() client: OAuth2Client, @Query('id') eventId: string): Promise<ApiResponse<DeleteResponse>> {
    return await this.calenderService.deleteEvent(client, eventId);
  }

  @UseGuards(AuthGuard)
  @Get('/floors')
  async listFloors(@_User('domain') domain: string): Promise<ApiResponse<string[]>> {
    return await this.calenderService.listFloors(domain);
  }
}
