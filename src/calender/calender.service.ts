import { OAuth2Client } from 'google-auth-library';
import { ConflictException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotImplementedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { google } from 'googleapis';
import appConfig from '../config/env/app.config';
import { EventResponse, RoomResponse } from './dto';
import { isRoomAvailable, parseLocation } from './util/calender.util';
import { Room } from './interfaces/room.interface';
import { AuthService } from '../auth/auth.service';
import { rooms } from '../config/rooms';
import { DeleteResponse } from './dto/delete.response';

@Injectable()
export class CalenderService {
  constructor(
    @Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>,
    private authService: AuthService,
  ) {}

  async createEvent(
    client: OAuth2Client,
    startTime: string,
    endTime: string,
    seats: number,
    createConference?: boolean,
    eventTitle?: string,
    floor?: number,
    attendees?: string[],
  ): Promise<EventResponse | null> {
    console.log('current server date', new Date().toISOString());

    console.log('startTime', startTime);
    console.log('endTime', endTime);

    const room = await this.getAvailableRoom(client, startTime, endTime, seats, floor);

    if (!room) {
      throw new ConflictException('No room available within specified time range');
    }

    let attendeeList = [];
    if (attendees?.length) {
      attendeeList = attendees?.map((attendee) => {
        return { email: attendee };
      });
    }

    let conference = {};
    if (createConference) {
      conference = {
        conferenceData: {
          createRequest: {
            requestId: Math.random().toString(36).substring(7),
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      };
    }

    var event = {
      summary: eventTitle || 'Quick Meeting',
      location: room.name,
      description: 'A quick meeting',
      start: {
        dateTime: startTime,
        timeZone: 'Asia/Dhaka',
      },
      end: {
        dateTime: endTime,
        timeZone: 'Asia/Dhaka',
      },
      attendees: [...attendeeList, { email: room.id }],
      colorId: '3',
      ...conference,
    };

    const calendar = google.calendar({ version: 'v3', auth: client });
    const result = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        ...event,
      },
    });

    if (result.status !== 200) {
      throw new ConflictException("Couldn't book room. Please try again later.");
    }

    console.log('Room has been booked', result.data);

    const formattedRoom = parseLocation(result.data.location);
    return {
      summary: result.data.summary,
      meet: result.data.hangoutLink,
      start: result.data.start.dateTime,
      end: result.data.end.dateTime,
      room: formattedRoom,
    };
  }

  async getAvailableRoom(client: OAuth2Client, start: string, end: string, minSeats: number, floor?: number): Promise<Room> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: client });
      const filteredRoomIds = [];
      for (const room of rooms) {
        if (room.seats >= minSeats && room.floor === floor) {
          filteredRoomIds.push(room.id);
        }
      }

      const availableRooms = await calendar.freebusy.query({
        requestBody: {
          timeMin: start,
          timeMax: end,
          timeZone: 'Asia/Dhaka',
          items: filteredRoomIds.map((id) => {
            return {
              id
            };
          }),
        },
      });

      const calenders = availableRooms.data.calendars;
      for (const roomId of Object.keys(calenders)) {
        const isAvailable = isRoomAvailable(calenders[roomId].busy, new Date(start), new Date(end));
        if (isAvailable) {
          return rooms.find((room) => room.id === roomId);
        }
      }
    } catch (error) {
      console.error(error);

      if (error?.code === 403) {
        await this.authService.logout(client);
        throw new ForbiddenException('Insufficient permissions provided. Please allow access to the calender api during login.');
      }
    }

    return null;
  }

  async listRooms(client: OAuth2Client): Promise<RoomResponse[]> {
    const calendar = google.calendar({ version: 'v3', auth: client });
    const result = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      timeMax: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12hrs
      timeZone: 'Asia/Dhaka',
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = result.data.items.map((event) => {
      return {
        conference: event.hangoutLink,
        room: parseLocation(event.location),
        id: event.id,
        title: event.summary,
        start: event.start.dateTime,
        end: event.end.dateTime,
      } as RoomResponse;
    });

    return events;
  }

  async updateEvent(client: OAuth2Client, id: string, end: string): Promise<EventResponse | null> {
    throw new NotImplementedException('Not implemented yet');

    const calendar = google.calendar({ version: 'v3', auth: client });
    const result = await calendar.events.patch({
      eventId: id,
      calendarId: 'primary',
      requestBody: {
        end: {
          dateTime: end,
          timeZone: 'Asia/Dhaka',
        },
      },
    });

    console.log('Room has been updated', result.data);

    return {
      summary: result.data.summary,
      meet: result.data.hangoutLink,
      start: result.data.start.dateTime,
      end: result.data.end.dateTime,
      room: parseLocation(result.data.location),
    };
  }

  async deleteEvent(client: OAuth2Client, id: string): Promise<DeleteResponse> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: client });
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: id,
      });

      return { deleted: true };
    } catch (error) {
      console.error(error);
      if (error?.code === 403) {
        await this.authService.logout(client);
        throw new ForbiddenException('Insufficient permissions provided. Please allow access to the calender api during login.');
      }

      throw new ConflictException('Could not delete the event.');
    }
  }
}
