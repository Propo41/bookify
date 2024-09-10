import { OAuth2Client } from 'google-auth-library';
import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
    timeZone: string,
    createConference?: boolean,
    eventTitle?: string,
    floor?: number,
    attendees?: string[],
  ): Promise<EventResponse | null> {
    const rooms: Room[] = await this.getAvailableRooms(client, startTime, endTime, seats, timeZone, floor);
    if (!rooms?.length) {
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

    // room.seat should be as closer to user's preferred minSeat value
    const pickedRoom = rooms[0];
    var event = {
      summary: eventTitle || 'Quick Meeting',
      location: pickedRoom.name,
      description: 'A quick meeting',
      start: {
        dateTime: startTime,
      },
      end: {
        dateTime: endTime,
      },
      attendees: [...attendeeList, { email: pickedRoom.id }],
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
      eventId: result.data.id,
      summary: result.data.summary,
      meet: result.data.hangoutLink,
      start: result.data.start.dateTime,
      end: result.data.end.dateTime,
      room: formattedRoom,
      roomId: pickedRoom.id,
      availableRooms: rooms,
    } as EventResponse;
  }

  async getAvailableRooms(client: OAuth2Client, start: string, end: string, minSeats: number, timeZone: string, floor?: number): Promise<Room[]> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: client });
      const filteredRoomIds = [];
      for (const room of rooms) {
        if (room.seats >= minSeats && room.floor === floor) {
          filteredRoomIds.push(room.id);
        }
      }

      const roomsFreeBusy = await calendar.freebusy.query({
        requestBody: {
          timeMin: start,
          timeMax: end,
          timeZone,
          items: filteredRoomIds.map((id) => {
            return {
              id,
            };
          }),
        },
      });

      const calenders = roomsFreeBusy.data.calendars;
      const availableRooms: Room[] = [];
      let room: Room = null;

      for (const roomId of Object.keys(calenders)) {
        const isAvailable = isRoomAvailable(calenders[roomId].busy, new Date(start), new Date(end));
        if (isAvailable) {
          room = rooms.find((room) => room.id === roomId);
          availableRooms.push(room);
        }
      }

      return availableRooms;
    } catch (error) {
      console.error(error);

      if (error?.code === 403) {
        await this.authService.logout(client);
        throw new ForbiddenException('Insufficient permissions provided. Please allow access to the calender api during login.');
      }
    }

    return null;
  }

  async listRooms(client: OAuth2Client, startTime: string, endTime: string, timeZone: string): Promise<RoomResponse[]> {
    const calendar = google.calendar({ version: 'v3', auth: client });
    const result = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startTime,
      timeMax: endTime,
      timeZone,
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

  async updateEvent(client: OAuth2Client, eventId: string, roomId: string): Promise<EventResponse | null> {
    const calendar = google.calendar({ version: 'v3', auth: client });
    const { data } = await calendar.events.get({
      eventId: eventId,
      calendarId: 'primary',
    });

    const room = rooms.find((room) => room.id === roomId);
    if (!room) {
      throw new NotFoundException('Room not found.');
    }

    // remove the previous room id from the list
    const filteredAttendees = data.attendees.filter((attendee) => !attendee.email.endsWith('@resource.calendar.google.com'));
    const result = await calendar.events.update({
      eventId: eventId,
      calendarId: 'primary',
      requestBody: {
        ...data,
        location: room.name,
        attendees: [...filteredAttendees, { email: roomId }],
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
