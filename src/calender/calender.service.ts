import { OAuth2Client } from 'google-auth-library';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { google, calendar_v3 } from 'googleapis';
import appConfig from '../config/env/app.config';
import { EventResponse, RoomResponse } from './dto';
import { isRoomAvailable, parseLocation, toMs, validateEmail } from './util/calender.util';
import { AuthService } from '../auth/auth.service';
import { DeleteResponse } from './dto/delete.response';
import { ConferenceRoom } from '../auth/entities';
import { EventUpdateResponse } from './dto/event-update.response';
import { ApiResponse } from '../dtos';
import to from 'await-to-js';
import { GaxiosError, GaxiosResponse } from 'gaxios';
import { CalendarAPIErrorMapper } from '../helpers/google-api-error.mapper';

@Injectable()
export class CalenderService {
  constructor(
    @Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>,
    private authService: AuthService,
  ) {}

  async createEvent(
    client: OAuth2Client,
    domain: string,
    startTime: string,
    endTime: string,
    seats: number,
    timeZone: string,
    createConference?: boolean,
    eventTitle?: string,
    floor?: string,
    attendees?: string[],
  ): Promise<EventResponse | null> {
    const rooms: ConferenceRoom[] = await this.getAvailableRooms(client, domain, startTime, endTime, seats, timeZone, floor);
    if (!rooms?.length) {
      throw new ConflictException('No room available within specified time range');
    }

    const attendeeList = [];
    if (attendees?.length) {
      for (const attendee of attendees) {
        if (validateEmail(attendee)) {
          attendeeList.push({ email: attendee });
        } else {
          throw new BadRequestException('Invalid attendee email provided: ' + attendee);
        }
      }
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
      summary: eventTitle?.trim() || 'Quick Meeting | Bookify',
      location: pickedRoom.name,
      description: 'A quick meeting created by Bookify',
      start: {
        dateTime: startTime,
      },
      end: {
        dateTime: endTime,
      },
      attendees: [...attendeeList, { email: pickedRoom.email }],
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
      roomEmail: pickedRoom.email,
      roomId: pickedRoom.id,
      seats: pickedRoom.seats,
      availableRooms: rooms,
    } as EventResponse;
  }

  async getAvailableRooms(
    client: OAuth2Client,
    domain: string,
    start: string,
    end: string,
    minSeats: number,
    timeZone: string,
    floor?: string,
  ): Promise<ConferenceRoom[]> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: client });
      const filteredRoomEmails = [];
      const rooms = await this.authService.getCalenderResources(domain);

      for (const room of rooms) {
        if (room.seats >= minSeats && room.floor === floor) {
          filteredRoomEmails.push(room.email);
        }
      }

      const roomsFreeBusy = await calendar.freebusy.query({
        requestBody: {
          timeMin: start,
          timeMax: end,
          timeZone,
          items: filteredRoomEmails.map((email) => {
            return {
              id: email,
            };
          }),
        },
      });

      const calenders = roomsFreeBusy.data.calendars;
      const availableRooms: ConferenceRoom[] = [];
      let room: ConferenceRoom = null;

      for (const roomEmail of Object.keys(calenders)) {
        const isAvailable = isRoomAvailable(calenders[roomEmail].busy, new Date(start), new Date(end));
        if (isAvailable) {
          room = rooms.find((room) => room.email === roomEmail);
          availableRooms.push(room);
        }
      }

      return availableRooms;
    } catch (error) {
      console.error(error);

      if (error?.code === 403) {
        throw new ForbiddenException('Insufficient permissions provided. Please allow access to the calender api during login.');
      }

      await this.authService.purgeAccess(client);
      throw new UnauthorizedException('Insufficient permissions provided. Please allow access to the calender api during login.');
    }
  }

  async isRoomAvailable(client: OAuth2Client, start: string, end: string, roomEmail: string, timeZone?: string): Promise<boolean> {
    // console.error(error);

    // if (error?.code === 403) {
    //   throw new ForbiddenException('Insufficient permissions provided. Please allow access to the calender api during login.');
    // }

    // await this.authService.purgeAccess(client);
    // throw new UnauthorizedException('Insufficient permissions provided. Please allow access to the calender api during login.');
    const calendar = google.calendar({ version: 'v3', auth: client });

    const [err, roomsFreeBusy]: [GaxiosError, GaxiosResponse<calendar_v3.Schema$FreeBusyResponse>] = await to(
      calendar.freebusy.query({
        requestBody: {
          timeMin: start,
          timeMax: end,
          timeZone,
          items: [{ id: roomEmail }],
        },
      }),
    );

    if (err) {
      CalendarAPIErrorMapper.handleError(err, async () => {
        await this.authService.purgeAccess(client);
      });
    }

    const calenders = roomsFreeBusy.data.calendars;
    const availableRooms: ConferenceRoom[] = [];
    let room: ConferenceRoom = null;

    for (const roomEmail of Object.keys(calenders)) {
      const isAvailable = isRoomAvailable(calenders[roomEmail].busy, new Date(start), new Date(end));
      if (isAvailable) {
        availableRooms.push(room);
      }
    }

    if (availableRooms.length === 0) {
      return false;
    }

    return true;
  }

  async listRooms(client: OAuth2Client, domain: string, startTime: string, endTime: string, timeZone: string): Promise<RoomResponse[]> {
    const calendar = google.calendar({ version: 'v3', auth: client });
    try {
      const result = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startTime,
        timeMax: endTime,
        timeZone,
        maxResults: 20,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const rooms = await this.authService.getCalenderResources(domain);
      const events = result.data.items.map((event) => {
        let room: ConferenceRoom = rooms.find((_room) => event.location.includes(_room.name));

        return {
          conference: event.hangoutLink ? event.hangoutLink.split('/').pop() : undefined,
          room: room.name,
          roomEmail: room.email,
          id: event.id,
          seats: room.seats,
          floor: room.floor,
          title: event.summary,
          start: event.start.dateTime,
          end: event.end.dateTime,
        } as RoomResponse;
      });

      return events;
    } catch (error) {
      await this.authService.purgeAccess(client);
      throw new UnauthorizedException('Please log in again');
    }
  }

  async updateEventRoom(client: OAuth2Client, domain: string, eventId: string, roomEmail: string): Promise<EventResponse | null> {
    const calendar = google.calendar({ version: 'v3', auth: client });
    try {
      const { data } = await calendar.events.get({
        eventId: eventId,
        calendarId: 'primary',
      });

      const rooms: ConferenceRoom[] = await this.authService.getCalenderResources(domain);
      const room = rooms.find((room) => room.email === roomEmail);
      if (!room) {
        throw new NotFoundException('Room not found.');
      }

      // check if room is available
      const availableRooms: ConferenceRoom[] = await this.getAvailableRooms(
        client,
        domain,
        data.start.dateTime,
        data.end.dateTime,
        room.seats,
        data.start.timeZone,
        room.floor,
      );

      const isFree = !!availableRooms.find((room) => room.email === roomEmail);
      if (!isFree) {
        return {
          status: false,
          statusMessage: 'Selected room is not available at the moment',
          availableRooms,
        };
      }

      // remove the previous room id from the list
      const filteredAttendees = data.attendees.filter((attendee) => !attendee.email.endsWith('@resource.calendar.google.com'));
      const result = await calendar.events.update({
        eventId: eventId,
        calendarId: 'primary',
        requestBody: {
          ...data,
          location: room.name,
          attendees: [...filteredAttendees, { email: roomEmail }],
        },
      });

      console.log('Room has been updated', result.data);

      return {
        summary: result.data.summary,
        meet: result.data.hangoutLink,
        start: result.data.start.dateTime,
        seats: room.seats,
        end: result.data.end.dateTime,
        room: parseLocation(result.data.location),
      };
    } catch (error) {
      console.error(error);
      await this.authService.purgeAccess(client);
      throw new UnauthorizedException('Please log in again');
    }
  }

  async updateEventDuration(client: OAuth2Client, eventId: string, roomId: string, duration: number): Promise<ApiResponse<EventUpdateResponse>> {
    const calendar = google.calendar({ version: 'v3', auth: client });

    const [err, events] = await to(
      calendar.events.get({
        eventId: eventId,
        calendarId: 'primary',
      }),
    );

    if (err) {
      throw new UnauthorizedException("Couldn't process request. Please try to login again.");
    }

    const { start, end } = events.data;

    // start time
    const startMs = new Date(start.dateTime).getTime();

    // end time
    const endMs = new Date(end.dateTime).getTime();

    const newDurationInMs = toMs(duration);
    const eventDurationInMs = endMs - startMs;

    let newEnd: string;

    if (newDurationInMs === eventDurationInMs) {
      throw new BadRequestException('Duration has already been set to ' + duration + ' mins');
    } else if (newDurationInMs < eventDurationInMs && newDurationInMs >= toMs(15)) {
      newEnd = new Date(endMs - (eventDurationInMs - newDurationInMs)).toISOString();
    } else {
      const newStart = end.dateTime;
      newEnd = new Date(endMs + (newDurationInMs - eventDurationInMs)).toISOString();

      // check if room is available within newStart and newEnd
      const [err, isAvailable] = await to(this.isRoomAvailable(client, newStart, newEnd, roomId, start.timeZone));
      if (err) {
        throw err;
      }

      if (!isAvailable) {
        throw new ForbiddenException('Room is not available within time range');
      }
    }

    // update the room
    const [error, res] = await to(
      calendar.events.update({
        eventId: eventId,
        calendarId: 'primary',
        requestBody: {
          ...events.data,
          end: {
            dateTime: newEnd,
            timeZone: end.timeZone,
          },
        },
      }),
    );

    if (error) {
      throw new UnauthorizedException("Couldn't process request. Please try to login again.");
    }

    if (res.status !== 200) {
      throw new ForbiddenException('Could not change event time');
    }

    return {
      data: {
        start: res.data.start.dateTime,
        end: res.data.end.dateTime,
      },
      status: 'success',
      message: 'Room has been updated',
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
        await this.authService.purgeAccess(client);
        throw new ForbiddenException('Insufficient permissions provided. Please allow access to the calender api during login.');
      } else if (error.code === 410) {
        throw new GoneException('Event has already been deleted');
      }

      throw new UnauthorizedException('Please log in again');
    }
  }

  async listFloors(domain: string): Promise<string[]> {
    const floors = await this.authService.getFloorsByDomain(domain);
    return floors;
  }
}
