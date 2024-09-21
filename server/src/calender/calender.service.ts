import { OAuth2Client } from 'google-auth-library';
import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { google, calendar_v3 } from 'googleapis';
import appConfig from '../config/env/app.config';
import { extractRoomName, isRoomAvailable, toMs, validateEmail } from './util/calender.util';
import { AuthService } from '../auth/auth.service';
import { ConferenceRoom } from '../auth/entities';
import { ApiResponse, DeleteResponse, EventResponse, EventUpdateResponse } from '@bookify/shared';
import to from 'await-to-js';
import { GaxiosError, GaxiosResponse } from 'gaxios';
import { GoogleAPIErrorMapper } from '../helpers/google-api-error.mapper';
import { createResponse } from '../helpers/payload.util';

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
  ): Promise<ApiResponse<EventResponse>> {
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

    const [err, result]: [GaxiosError, GaxiosResponse<calendar_v3.Schema$Event>] = await to(
      calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: {
          ...event,
        },
      }),
    );

    if (err) {
      GoogleAPIErrorMapper.handleError(err);
    }

    if (result.status !== 200) {
      throw new ConflictException("Couldn't book room. Please try again later.");
    }

    const room = extractRoomName(rooms, result.data.location);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    console.log('Room has been booked', result.data);

    const data: EventResponse = {
      eventId: result.data.id,
      summary: result.data.summary,
      meet: result.data.hangoutLink,
      start: result.data.start.dateTime,
      end: result.data.end.dateTime,
      room: room,
      roomEmail: pickedRoom.email,
      roomId: pickedRoom.id,
      seats: pickedRoom.seats,
      availableRooms: rooms,
    };

    return createResponse(data, 'Room has been booked');
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
    const calendar = google.calendar({ version: 'v3', auth: client });
    const filteredRoomEmails = [];
    const rooms = await this.authService.getCalenderResources(domain);

    for (const room of rooms) {
      if (room.seats >= minSeats && room.floor === floor) {
        filteredRoomEmails.push(room.email);
      }
    }

    const [err, roomsFreeBusy]: [GaxiosError, GaxiosResponse<calendar_v3.Schema$FreeBusyResponse>] = await to(
      calendar.freebusy.query({
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
      }),
    );

    if (err) {
      GoogleAPIErrorMapper.handleError(err);
    }

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
  }

  async isRoomAvailable(client: OAuth2Client, start: string, end: string, roomEmail: string, timeZone?: string): Promise<boolean> {
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
      GoogleAPIErrorMapper.handleError(err);
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

  async listRooms(client: OAuth2Client, domain: string, startTime: string, endTime: string, timeZone: string): Promise<ApiResponse<EventResponse[]>> {
    const calendar = google.calendar({ version: 'v3', auth: client });

    const [err, result]: [GaxiosError, GaxiosResponse<calendar_v3.Schema$Events>] = await to(
      calendar.events.list({
        calendarId: 'primary',
        timeMin: startTime,
        timeMax: endTime,
        timeZone,
        maxResults: 20,
        singleEvents: true,
        orderBy: 'startTime',
      }),
    );

    if (err) {
      GoogleAPIErrorMapper.handleError(err);
    }

    const rooms = await this.authService.getCalenderResources(domain);
    const events = result.data.items.map((event) => {
      let room: ConferenceRoom = rooms.find((_room) => event.location.includes(_room.name));

      const _event: EventResponse = {
        meet: event.hangoutLink ? event.hangoutLink.split('/').pop() : undefined,
        room: room.name,
        roomEmail: room.email,
        eventId: event.id,
        seats: room.seats,
        floor: room.floor,
        summary: event.summary,
        start: event.start.dateTime,
        end: event.end.dateTime,
      };

      return _event;
    });

    return createResponse(events);
  }

  async updateEventRoom(client: OAuth2Client, domain: string, eventId: string, roomEmail: string): Promise<ApiResponse<EventUpdateResponse>> {
    const calendar = google.calendar({ version: 'v3', auth: client });

    const [err, res]: [GaxiosError, GaxiosResponse<calendar_v3.Schema$Event>] = await to(
      calendar.events.get({
        eventId: eventId,
        calendarId: 'primary',
      }),
    );

    if (err) {
      GoogleAPIErrorMapper.handleError(err);
    }

    const rooms: ConferenceRoom[] = await this.authService.getCalenderResources(domain);
    const room = rooms.find((room) => room.email === roomEmail);
    if (!room) {
      throw new NotFoundException('Room not found.');
    }

    // check if room is available
    const availableRooms: ConferenceRoom[] = await this.getAvailableRooms(
      client,
      domain,
      res.data.start.dateTime,
      res.data.end.dateTime,
      room.seats,
      res.data.start.timeZone,
      room.floor,
    );

    const isFree = !!availableRooms.find((room) => room.email === roomEmail);
    if (!isFree) {
      const data: EventResponse = { availableRooms };
      return createResponse(data, 'Selected room is not available at the moment');
    }

    // remove the previous room id from the list
    const filteredAttendees = res.data.attendees.filter((attendee) => !attendee.email.endsWith('@resource.calendar.google.com'));
    const result = await calendar.events.update({
      eventId: eventId,
      calendarId: 'primary',
      requestBody: {
        ...res.data,
        location: room.name,
        attendees: [...filteredAttendees, { email: roomEmail }],
      },
    });

    console.log('Room has been updated', result.data);

    const roomName = extractRoomName(rooms, result.data.location);
    if (!roomName) {
      throw new BadRequestException('Room not found');
    }
    const data: EventResponse = {
      seats: room.seats,
      room: roomName,
    };

    return createResponse(data, 'Selected room is not available at the moment');
  }

  async updateEventDuration(client: OAuth2Client, eventId: string, roomId: string, duration: number): Promise<ApiResponse<EventUpdateResponse>> {
    const calendar = google.calendar({ version: 'v3', auth: client });

    const [err, events]: [GaxiosError, GaxiosResponse<calendar_v3.Schema$Event>] = await to(
      calendar.events.get({
        eventId: eventId,
        calendarId: 'primary',
      }),
    );

    if (err) {
      GoogleAPIErrorMapper.handleError(err);
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
      const isAvailable = await this.isRoomAvailable(client, newStart, newEnd, roomId, start.timeZone);
      if (!isAvailable) {
        throw new ForbiddenException('Room is not available within time range');
      }
    }

    // update the room
    const [error, res]: [GaxiosError, GaxiosResponse<calendar_v3.Schema$Event>] = await to(
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
      GoogleAPIErrorMapper.handleError(error);
    }

    if (res.status !== 200) {
      throw new ForbiddenException('Could not change event time');
    }

    const data: EventUpdateResponse = {
      start: res.data.start.dateTime,
      end: res.data.end.dateTime,
    };

    return createResponse(data, 'Room has been updated');
  }

  async deleteEvent(client: OAuth2Client, id: string): Promise<ApiResponse<DeleteResponse>> {
    const calendar = google.calendar({ version: 'v3', auth: client });
    const [err, _]: [GaxiosError, GaxiosResponse<void>] = await to(
      calendar.events.delete({
        calendarId: 'primary',
        eventId: id,
      }),
    );

    if (err) {
      GoogleAPIErrorMapper.handleError(err);
    }

    const data: DeleteResponse = {
      deleted: true,
    };

    return createResponse(data, 'Event deleted');
  }

  async listFloors(domain: string): Promise<ApiResponse<string[]>> {
    const floors = await this.authService.getFloorsByDomain(domain);
    return createResponse(floors);
  }
}
